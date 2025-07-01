import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { type Options, resolveConfig } from 'prettier'

/**
 * Retrieves the Prettier configuration options relative to the file being
 * formatted or checked.
 *
 * @param server The McpServer instance to send logging messages.
 * @param filePath The path to the file being formatted or checked.
 * @returns A Promise that resolves to the Prettier configuration options.
 */
export async function getConfig(
  server: McpServer,
  filePath: string
): Promise<Options> {
  try {
    const config = await resolveConfig(filePath)

    if (!config) {
      server.server.sendLoggingMessage({
        level: 'warning',
        data: 'Could Not Resolve Prettier Configuration'
      })
      return {}
    }

    return config
  } catch (error) {
    server.server.sendLoggingMessage({
      level: 'error',
      data: 'Error Resolving Prettier Configuration:',
      error
    })

    return {}
  }
}
