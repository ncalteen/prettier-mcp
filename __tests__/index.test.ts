import { jest } from '@jest/globals'
import * as fs from '../__fixtures__/fs.js'
import { McpServer } from '../__fixtures__/mcp.js'
import * as prettier from '../__fixtures__/prettier.js'
import { StdioServerTransport } from '../__fixtures__/stdio.js'

jest.unstable_mockModule('@modelcontextprotocol/sdk/server/mcp.js', () => ({
  McpServer: jest.fn(() => McpServer)
}))
jest.unstable_mockModule('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport
}))
jest.unstable_mockModule('prettier', () => prettier)
jest.unstable_mockModule('fs', () => fs)

const getConfig = jest.fn<typeof import('../src/utils.js').getConfig>()
jest.unstable_mockModule('../src/utils.js', () => ({
  getConfig
}))

// Mock package.json
jest.unstable_mockModule(
  '../package.json',
  () => ({
    default: { version: '1.0.0' }
  }),
  { virtual: true }
)

describe('index.ts', () => {
  let checkFormatTool: any
  let fixFormatTool: any

  beforeAll(async () => {
    // Import the module after mocks are set up
    await import('../src/index.js')

    const toolCalls = McpServer.tool.mock.calls
    const checkFormatCall = toolCalls.find((call) => call[0] === 'check-format')
    const fixFormatCall = toolCalls.find((call) => call[0] === 'fix-format')

    if (!checkFormatCall || !fixFormatCall) {
      throw new Error('Tool calls not found')
    }

    checkFormatTool = checkFormatCall[3]
    fixFormatTool = fixFormatCall[3]
  })

  beforeEach(() => {
    // Reset only the mock calls, not the mock functions themselves
    jest.clearAllMocks()
  })

  describe('check-format tool', () => {
    it('should return error when file does not exist', async () => {
      fs.existsSync.mockReturnValue(false)

      const result = await checkFormatTool({ filePath: 'nonexistent.js' })

      expect(McpServer.server.sendLoggingMessage).toHaveBeenCalledWith({
        level: 'info',
        data: 'Checking Formatting: nonexistent.js'
      })
      expect(McpServer.server.sendLoggingMessage).toHaveBeenCalledWith({
        level: 'error',
        data: 'File Not Found: nonexistent.js'
      })
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: 'File Not Found: nonexistent.js'
          }
        ]
      })
    })

    it('should return message when file is ignored by Prettier', async () => {
      fs.existsSync.mockReturnValue(true)
      getConfig.mockResolvedValue({ semi: true })
      prettier.getFileInfo.mockResolvedValue({
        ignored: true,
        inferredParser: null
      })

      const result = await checkFormatTool({ filePath: 'ignored.js' })

      expect(McpServer.server.sendLoggingMessage).toHaveBeenCalledWith({
        level: 'info',
        data: 'File ignored.js Ignored by Prettier'
      })
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: 'The file ignored.js is ignored by Prettier.'
          }
        ]
      })
    })

    it('should return message when file has no inferred parser', async () => {
      fs.existsSync.mockReturnValue(true)
      getConfig.mockResolvedValue({ semi: true })
      prettier.getFileInfo.mockResolvedValue({
        ignored: false,
        inferredParser: null
      })

      const result = await checkFormatTool({ filePath: 'unknown.xyz' })

      expect(McpServer.server.sendLoggingMessage).toHaveBeenCalledWith({
        level: 'info',
        data: 'File unknown.xyz has no Inferred Parser'
      })
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: 'The file unknown.xyz has no inferred parser.'
          }
        ]
      })
    })

    it('should check formatting successfully when file is formatted correctly', async () => {
      const filePath = 'formatted.js'
      const fileContent = 'const x = 1;'
      const config = { semi: true, singleQuote: true }

      fs.existsSync.mockReturnValue(true)
      getConfig.mockResolvedValue(config)
      prettier.getFileInfo.mockResolvedValue({
        ignored: false,
        inferredParser: 'babel'
      })
      fs.readFileSync.mockReturnValue(fileContent)
      prettier.check.mockResolvedValue(true)

      const result = await checkFormatTool({ filePath })

      expect(prettier.check).toHaveBeenCalledWith(fileContent, {
        ...config,
        parser: 'babel'
      })
      expect(McpServer.server.sendLoggingMessage).toHaveBeenCalledWith({
        level: 'info',
        data: 'Result: true'
      })
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: `The file ${filePath} is formatted correctly according to the provided Prettier configuration: ${JSON.stringify(config)}.`
          }
        ]
      })
    })

    it('should check formatting successfully when file is not formatted correctly', async () => {
      const filePath = 'unformatted.js'
      const fileContent = 'const x=1'
      const config = { semi: true, singleQuote: true }

      fs.existsSync.mockReturnValue(true)
      getConfig.mockResolvedValue(config)
      prettier.getFileInfo.mockResolvedValue({
        ignored: false,
        inferredParser: 'babel'
      })
      fs.readFileSync.mockReturnValue(fileContent)
      prettier.check.mockResolvedValue(false)

      const result = await checkFormatTool({ filePath })

      expect(prettier.check).toHaveBeenCalledWith(fileContent, {
        ...config,
        parser: 'babel'
      })
      expect(McpServer.server.sendLoggingMessage).toHaveBeenCalledWith({
        level: 'info',
        data: 'Result: false'
      })
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: `The file ${filePath} is not formatted correctly according to the provided Prettier configuration: ${JSON.stringify(config)}.`
          }
        ]
      })
    })
  })

  describe('fix-format tool', () => {
    it('should return error when file does not exist', async () => {
      fs.existsSync.mockReturnValue(false)

      const result = await fixFormatTool({ filePath: 'nonexistent.js' })

      expect(McpServer.server.sendLoggingMessage).toHaveBeenCalledWith({
        level: 'info',
        data: 'Fixing Formatting: nonexistent.js'
      })
      expect(McpServer.server.sendLoggingMessage).toHaveBeenCalledWith({
        level: 'error',
        data: 'File Not Found: nonexistent.js'
      })
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: 'File Not Found: nonexistent.js'
          }
        ]
      })
    })

    it('should return message when file is ignored by Prettier', async () => {
      fs.existsSync.mockReturnValue(true)
      getConfig.mockResolvedValue({ semi: true })
      prettier.getFileInfo.mockResolvedValue({
        ignored: true,
        inferredParser: null
      })

      const result = await fixFormatTool({ filePath: 'ignored.js' })

      expect(McpServer.server.sendLoggingMessage).toHaveBeenCalledWith({
        level: 'info',
        data: 'File ignored.js Ignored by Prettier'
      })
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: 'The file ignored.js is ignored by Prettier.'
          }
        ]
      })
    })

    it('should return message when file has no inferred parser', async () => {
      fs.existsSync.mockReturnValue(true)
      getConfig.mockResolvedValue({ semi: true })
      prettier.getFileInfo.mockResolvedValue({
        ignored: false,
        inferredParser: null
      })

      const result = await fixFormatTool({ filePath: 'unknown.xyz' })

      expect(McpServer.server.sendLoggingMessage).toHaveBeenCalledWith({
        level: 'info',
        data: 'File unknown.xyz has no Inferred Parser'
      })
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: 'The file unknown.xyz has no inferred parser.'
          }
        ]
      })
    })

    it('should format file successfully', async () => {
      const filePath = 'unformatted.js'
      const originalContent = 'const x=1'
      const formattedContent = 'const x = 1;'
      const config = { semi: true, singleQuote: true }

      fs.existsSync.mockReturnValue(true)
      getConfig.mockResolvedValue(config)
      prettier.getFileInfo.mockResolvedValue({
        ignored: false,
        inferredParser: 'babel'
      })
      fs.readFileSync.mockReturnValue(originalContent)
      prettier.format.mockResolvedValue(formattedContent)

      const result = await fixFormatTool({ filePath })

      expect(prettier.format).toHaveBeenCalledWith(originalContent, {
        ...config,
        parser: 'babel'
      })
      expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, formattedContent)
      expect(McpServer.server.sendLoggingMessage).toHaveBeenCalledWith({
        level: 'info',
        data: `File ${filePath} formatted successfully.`
      })
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: `File ${filePath} formatted successfully according to the provided Prettier configuration: ${JSON.stringify(config)}.`
          }
        ]
      })
    })

    it('should log config and file info during formatting', async () => {
      const filePath = 'test.js'
      const config = { semi: false, singleQuote: false }
      const fileInfo = { ignored: false, inferredParser: 'typescript' }

      fs.existsSync.mockReturnValue(true)
      getConfig.mockResolvedValue(config)
      prettier.getFileInfo.mockResolvedValue(fileInfo)
      fs.readFileSync.mockReturnValue('const x = 1')
      prettier.format.mockResolvedValue('const x = 1')

      await fixFormatTool({ filePath })

      expect(McpServer.server.sendLoggingMessage).toHaveBeenCalledWith({
        level: 'info',
        data: `Config: ${JSON.stringify(config)}`
      })
      expect(McpServer.server.sendLoggingMessage).toHaveBeenCalledWith({
        level: 'info',
        data: `File Info: ${JSON.stringify(fileInfo)}`
      })
    })
  })
})
