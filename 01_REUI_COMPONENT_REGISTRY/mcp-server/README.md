# ReUI MCP Server

An MCP (Model Context Protocol) server that integrates directly with AI coding assistants (Claude Code, Cursor, Windsurf, Antigravity) to search, inspect, and inject ReUI/shadcn components into codebases.

## Tools Exposed

1. **`list_categories`**: Lists all available categories of components and blocks.
2. **`search_components`**: Keyword and category search for components.
3. **`get_component`**: Returns raw TypeScript source code, dependencies, and file paths.
4. **`generate_install_command`**: Emits the standard `npx shadcn@latest add ...` CLI command.

## Client Registration (`mcpServers`)

Add the following to your AI client configuration (e.g. `claude_desktop_config.json` or `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "reui": {
      "command": "node",
      "args": ["G:\\Deployment Help\\01_REUI_COMPONENT_REGISTRY\\mcp-server\\dist\\index.js"]
    }
  }
}
```
