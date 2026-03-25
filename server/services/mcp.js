const { Client } = require('@modelcontextprotocol/sdk/client');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const { SSEClientTransport } = require('@modelcontextprotocol/sdk/client/sse.js');
const { dbAll, dbGet, dbRun } = require('../config/database');

/**
 * MCP Manager — per-tenant MCP server connections.
 * Each tenant has its own set of MCP servers and tool connections.
 */
class McpManager {
  constructor() {
    // Map<serverId, { tenantId, client, transport, tools, serverName }>
    this.connections = new Map();
  }

  /**
   * Initialize all enabled MCP servers for all tenants.
   */
  async initAll() {
    const servers = await dbAll('SELECT * FROM mcp_servers WHERE enabled = 1 AND tenant_id IS NOT NULL');
    console.log(`MCP: Initializing ${servers.length} enabled server(s)...`);
    for (const server of servers) {
      try {
        await this.connectServer(server.tenant_id, server);
      } catch (err) {
        console.error(`MCP: Failed to connect "${server.name}" (tenant ${server.tenant_id}):`, err.message);
      }
    }
  }

  /**
   * Connect to a single MCP server for a tenant.
   */
  async connectServer(tenantId, server) {
    if (this.connections.has(server.id)) {
      await this.disconnectServer(tenantId, server.id);
    }

    let transport;
    if (server.transport === 'stdio') {
      const args = JSON.parse(server.args || '[]');
      const envVars = JSON.parse(server.env_vars || '{}');
      transport = new StdioClientTransport({
        command: server.command,
        args,
        env: { ...process.env, ...envVars }
      });
    } else if (server.transport === 'sse') {
      transport = new SSEClientTransport(new URL(server.url));
    } else {
      throw new Error(`Unknown transport: ${server.transport}`);
    }

    const client = new Client({ name: 'sellmate-bot', version: '1.0.0' });
    await client.connect(transport);

    let tools = [];
    try {
      const result = await client.listTools();
      tools = result.tools || [];
      console.log(`MCP: "${server.name}" (tenant ${tenantId}) connected - ${tools.length} tool(s)`);
    } catch (err) {
      console.warn(`MCP: "${server.name}" connected but listTools failed:`, err.message);
    }

    this.connections.set(server.id, {
      tenantId,
      client,
      transport,
      tools,
      serverName: server.name
    });

    return tools;
  }

  async disconnectServer(tenantId, serverId) {
    const conn = this.connections.get(serverId);
    if (!conn) return;
    try {
      await conn.client.close();
    } catch (err) {
      console.warn(`MCP: Error closing "${conn.serverName}":`, err.message);
    }
    this.connections.delete(serverId);
  }

  async disconnectAll() {
    for (const [id, conn] of this.connections) {
      try { await conn.client.close(); } catch (e) {}
    }
    this.connections.clear();
  }

  /**
   * Get all tools for a specific tenant.
   */
  getAllToolsForTenant(tenantId) {
    const openaiTools = [];
    const anthropicTools = [];
    const toolMap = new Map();

    for (const [serverId, conn] of this.connections) {
      if (conn.tenantId !== tenantId) continue;
      for (const tool of conn.tools) {
        const qualifiedName = `${conn.serverName}__${tool.name}`.replace(/[^a-zA-Z0-9_-]/g, '_');
        toolMap.set(qualifiedName, { serverId, toolName: tool.name });

        openaiTools.push({
          type: 'function',
          function: {
            name: qualifiedName,
            description: tool.description || '',
            parameters: tool.inputSchema || { type: 'object', properties: {} }
          }
        });

        anthropicTools.push({
          name: qualifiedName,
          description: tool.description || '',
          input_schema: tool.inputSchema || { type: 'object', properties: {} }
        });
      }
    }

    return { openaiTools, anthropicTools, toolMap };
  }

  /**
   * Execute a tool call for a specific tenant.
   */
  async executeTool(tenantId, qualifiedName, args, toolMap) {
    const mapping = toolMap.get(qualifiedName);
    if (!mapping) throw new Error(`Unknown tool: ${qualifiedName}`);

    const conn = this.connections.get(mapping.serverId);
    if (!conn) throw new Error(`MCP server not connected for tool: ${qualifiedName}`);
    if (conn.tenantId !== tenantId) throw new Error(`Tool does not belong to this tenant`);

    const result = await conn.client.callTool({
      name: mapping.toolName,
      arguments: args
    });

    if (result.content && Array.isArray(result.content)) {
      return result.content
        .map(c => c.type === 'text' ? c.text : JSON.stringify(c))
        .join('\n');
    }
    return JSON.stringify(result);
  }

  hasToolsForTenant(tenantId) {
    for (const conn of this.connections.values()) {
      if (conn.tenantId === tenantId && conn.tools.length > 0) return true;
    }
    return false;
  }

  /**
   * Get status for a specific tenant's MCP servers.
   */
  async getStatusForTenant(tenantId) {
    const status = [];
    const servers = await dbAll('SELECT * FROM mcp_servers WHERE tenant_id = ?', [tenantId]);
    for (const server of servers) {
      const conn = this.connections.get(server.id);
      status.push({
        id: server.id,
        name: server.name,
        transport: server.transport,
        enabled: !!server.enabled,
        connected: !!conn,
        toolCount: conn ? conn.tools.length : 0,
        tools: conn ? conn.tools.map(t => ({ name: t.name, description: t.description })) : []
      });
    }
    return status;
  }
}

const mcpManager = new McpManager();

module.exports = { mcpManager };
