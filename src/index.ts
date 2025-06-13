import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import * as fs from 'fs'
import * as prettier from 'prettier'
import { z } from 'zod'
import packageJson from '../package.json' with { type: 'json' }
import { getConfig } from './utils.js'

// Create a server instance
const server = new McpServer(
  {
    name: 'Prettier',
    version: packageJson.version
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      logging: {}
    }
  }
)

server.tool(
  'check-format',
  'Check if a file is formatted according to Prettier rules',
  {
    filePath: z.string().describe('Path to the file to check formatting')
  },
  async ({ filePath }) => {
    server.server.sendLoggingMessage({
      level: 'info',
      data: `Checking Formatting: ${filePath}`
    })

    if (!fs.existsSync(filePath)) {
      server.server.sendLoggingMessage({
        level: 'error',
        data: `File Not Found: ${filePath}`
      })
      return {
        content: [
          {
            type: 'text',
            text: `File Not Found: ${filePath}`
          }
        ]
      }
    }

    const config = await getConfig(server, filePath)
    server.server.sendLoggingMessage({
      level: 'info',
      data: `Config: ${JSON.stringify(config)}`
    })

    const fileInfo = await prettier.getFileInfo(filePath)
    server.server.sendLoggingMessage({
      level: 'info',
      data: `File Info: ${JSON.stringify(fileInfo)}`
    })

    if (fileInfo.ignored) {
      server.server.sendLoggingMessage({
        level: 'info',
        data: `File ${filePath} Ignored by Prettier`
      })
      return {
        content: [
          {
            type: 'text',
            text: `The file ${filePath} is ignored by Prettier.`
          }
        ]
      }
    }

    if (!fileInfo.inferredParser) {
      server.server.sendLoggingMessage({
        level: 'info',
        data: `File ${filePath} has no Inferred Parser`
      })
      return {
        content: [
          {
            type: 'text',
            text: `The file ${filePath} has no inferred parser.`
          }
        ]
      }
    }

    const isFormatted = await prettier.check(
      fs.readFileSync(filePath, 'utf8'),
      {
        ...config,
        parser: fileInfo.inferredParser
      }
    )

    server.server.sendLoggingMessage({
      level: 'info',
      data: `Result: ${isFormatted}`
    })

    return {
      content: [
        {
          type: 'text',
          text: `The file ${filePath} is ${isFormatted ? '' : 'not '}formatted correctly according to the provided Prettier configuration: ${JSON.stringify(config)}.`
        }
      ]
    }
  }
)

server.tool(
  'fix-format',
  'Fixes the formatting of a file according to Prettier rules',
  {
    filePath: z.string().describe('Path to the file to format')
  },
  async ({ filePath }) => {
    server.server.sendLoggingMessage({
      level: 'info',
      data: `Fixing Formatting: ${filePath}`
    })

    if (!fs.existsSync(filePath)) {
      server.server.sendLoggingMessage({
        level: 'error',
        data: `File Not Found: ${filePath}`
      })
      return {
        content: [
          {
            type: 'text',
            text: `File Not Found: ${filePath}`
          }
        ]
      }
    }

    const config = await getConfig(server, filePath)
    server.server.sendLoggingMessage({
      level: 'info',
      data: `Config: ${JSON.stringify(config)}`
    })

    const fileInfo = await prettier.getFileInfo(filePath)
    server.server.sendLoggingMessage({
      level: 'info',
      data: `File Info: ${JSON.stringify(fileInfo)}`
    })

    if (fileInfo.ignored) {
      server.server.sendLoggingMessage({
        level: 'info',
        data: `File ${filePath} Ignored by Prettier`
      })
      return {
        content: [
          {
            type: 'text',
            text: `The file ${filePath} is ignored by Prettier.`
          }
        ]
      }
    }

    if (!fileInfo.inferredParser) {
      server.server.sendLoggingMessage({
        level: 'info',
        data: `File ${filePath} has no Inferred Parser`
      })
      return {
        content: [
          {
            type: 'text',
            text: `The file ${filePath} has no inferred parser.`
          }
        ]
      }
    }

    fs.writeFileSync(
      filePath,
      await prettier.format(fs.readFileSync(filePath, 'utf8'), {
        ...config,
        parser: fileInfo.inferredParser
      })
    )

    server.server.sendLoggingMessage({
      level: 'info',
      data: `File ${filePath} formatted successfully.`
    })

    return {
      content: [
        {
          type: 'text',
          text: `File ${filePath} formatted successfully according to the provided Prettier configuration: ${JSON.stringify(config)}.`
        }
      ]
    }
  }
)

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)

  server.server.sendLoggingMessage({
    level: 'info',
    data: `Prettier MCP Server Started (Version ${packageJson.version})`
  })
}

/* istanbul ignore next */
main().catch((error) => {
  console.error('Error starting Prettier MCP Server:', error)
  process.exit(1)
})
