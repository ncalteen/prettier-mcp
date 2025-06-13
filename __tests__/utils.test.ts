import { jest } from '@jest/globals'

const resolveConfigMock = jest.fn<typeof import('prettier').resolveConfig>()
const mcpServerMock = {
  server: {
    sendLoggingMessage: jest.fn()
  }
}

jest.unstable_mockModule('prettier', () => ({
  resolveConfig: resolveConfigMock
}))
jest.unstable_mockModule('@modelcontextprotocol/sdk/server/mcp.js', () => ({
  McpServer: mcpServerMock
}))

const { getConfig } = await import('../src/utils.js')

describe('utils.ts', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Gets the config', async () => {
    resolveConfigMock.mockResolvedValue({
      semi: true,
      singleQuote: true
    })

    const result = await getConfig(mcpServerMock as any, 'path/to/file.js')

    expect(result).toEqual({
      semi: true,
      singleQuote: true
    })
    expect(resolveConfigMock).toHaveBeenCalledWith('path/to/file.js')
    expect(mcpServerMock.server.sendLoggingMessage).not.toHaveBeenCalled()
  })

  it('Handles missing config', async () => {
    resolveConfigMock.mockResolvedValue(null)

    const result = await getConfig(mcpServerMock as any, 'path/to/file.js')

    expect(result).toEqual({})
    expect(resolveConfigMock).toHaveBeenCalledWith('path/to/file.js')
    expect(mcpServerMock.server.sendLoggingMessage).toHaveBeenCalledWith({
      level: 'warning',
      data: 'Could Not Resolve Prettier Configuration'
    })
  })

  it('Handles error resolving config', async () => {
    const error = new Error('Test error')
    resolveConfigMock.mockRejectedValue(error)

    const result = await getConfig(mcpServerMock as any, 'path/to/file.js')

    expect(result).toEqual({})
    expect(resolveConfigMock).toHaveBeenCalledWith('path/to/file.js')
    expect(mcpServerMock.server.sendLoggingMessage).toHaveBeenCalledWith({
      level: 'error',
      data: 'Error Resolving Prettier Configuration:',
      error
    })
  })
})
