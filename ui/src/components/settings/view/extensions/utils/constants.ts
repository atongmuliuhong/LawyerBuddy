export const EMPTY_CONFIG = JSON.stringify({ mcpServers: {} }, null, 2);

export const INPUT_CLASS =
  "h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring";

export const STDIO_TEMPLATE = {
  command: "npx",
  args: ["-y", "some-mcp-server"],
  env: {
    API_KEY: "${env:API_KEY}",
  },
};

export const REMOTE_TEMPLATE = {
  url: "https://example.com/mcp",
  headers: {
    Authorization: "Bearer ${env:MCP_TOKEN}",
  },
};

/**
 * 中国法律 MCP（Ansvar-Systems/chinese-law-mcp，Apache-2.0，免费）。
 * 内置 1188 部法律、62981 条条文，提供法条检索、引用校验、效力核查等 8 个工具。
 *
 * 该 npm 包的 prepare 脚本（`test -d dist || npm run build`）在 Windows 下会失败，
 * 因此 `npx -y @ansvar/chinese-law-mcp` 无法直接启动，这里改为指向已在本地
 * 安装好的入口文件。安装命令：
 *   npm install --prefix D:\lawyerbuddy-home\mcp-servers\chinese-law \
 *     @ansvar/chinese-law-mcp --ignore-scripts
 */
export const CHINESE_LAW_STDIO_TEMPLATE = {
  command: "node",
  args: [
    "D:\\lawyerbuddy-home\\mcp-servers\\chinese-law\\node_modules\\@ansvar\\chinese-law-mcp\\dist\\index.js",
  ],
};

export const CHINESE_LAW_SERVER_NAME = "chinese-law";
