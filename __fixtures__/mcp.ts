import { jest } from '@jest/globals'

export const McpServer = {
  server: {
    sendLoggingMessage: jest.fn()
  },
  tool: jest.fn(),
  connect: jest.fn()
}
