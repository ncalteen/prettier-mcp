# prettier-mcp

MCP server to check and format code files using
[Prettier](https://prettier.io/).

This repository is a simple implementation of a Model Context Protocol (MCP)
server that integrates with Prettier to provide code formatting capabilities. It
listens for requests to check or format code files.

![Continuous Integration](https://github.com/ncalteen/prettier-mcp/actions/workflows/continuous-integration.yml/badge.svg)
![Continuous Delivery](https://github.com/ncalteen/prettier-mcp/actions/workflows/continuous-delivery.yml/badge.svg)
![Coverage](./badges/coverage.svg)
![Linter](https://github.com/ncalteen/prettier-mcp/actions/workflows/linter.yml/badge.svg)

## Usage

To install this MCP server in VS Code, follow the below instructions:

1. Clone this repository
1. Add the following configuration to your `settings.json` or `.vscode/mcp.json`
   file. Make sure to replace `<PATH_TO_CLONED_REPOSITORY>` with the actual path
   where you cloned this repository.

   ```json
   {
     "mcp": {
       "servers": {
         "Prettier": {
           "type": "stdio",
           "command": "node",
           "args": ["<PATH_TO_CLONED_REPOSITORY>/dist/index.js"],
           "env": {
             "PRETTIER_CONFIG_PATH": "${input:prettier-config-path}"
           }
         }
       }
     }
   }
   ```

## Debugging

```bash
npx @modelcontextprotocol/inspector node "<PATH_TO_CLONED_REPOSITORY>/dist/index.js"
```

## Reference

- [MCP Documentation](https://modelcontextprotocol.io/quickstart/server#node)
