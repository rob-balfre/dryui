import { createRequire } from 'node:module';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const require = createRequire(import.meta.url);
const pkg: unknown = require('../package.json');
const version =
	typeof pkg === 'object' && pkg !== null && 'version' in pkg ? String(pkg.version) : '0.0.0';
const server = new McpServer(
	{ name: '@dryui/mcp', version },
	{ instructions: 'DryUI MCP no longer exposes runtime tools. Use the installed DryUI skills.' }
);

const transport = new StdioServerTransport();
await server.connect(transport);
