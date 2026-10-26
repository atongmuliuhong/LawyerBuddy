import assert from "node:assert/strict";
import { homedir } from "node:os";
import test from "node:test";

import { expandMcpString, expandMcpConfig } from "../../src/mcp/config/expandPlaceholders.js";
import { parsePluginMcpServers } from "../../src/mcp/runtime/parsePluginMcpServers.js";

test("expandMcpString expands ${env:*} placeholders", () => {
  process.env.LAWYERBUDDY_TEST_TOKEN = "secret123";
  try {
    assert.equal(expandMcpString("Bearer ${env:LAWYERBUDDY_TEST_TOKEN}"), "Bearer secret123");
  } finally {
    delete process.env.LAWYERBUDDY_TEST_TOKEN;
  }
});

test("expandMcpString expands ${userHome} placeholder", () => {
  const result = expandMcpString("${userHome}/my-tools");
  assert.equal(result, homedir() + "/my-tools");
});

test("expandMcpString expands ~ prefix", () => {
  assert.equal(expandMcpString("~/server.js"), homedir() + "/server.js");
  assert.equal(expandMcpString("~\\server.js"), homedir() + "\\server.js");
  assert.equal(expandMcpString("~"), homedir());
});

test("expandMcpString leaves unknown env vars as empty string", () => {
  delete process.env.__LAWYERBUDDY_NONEXISTENT_VAR__;
  assert.equal(expandMcpString("${env:__LAWYERBUDDY_NONEXISTENT_VAR__}"), "");
});

test("expandMcpString handles combined placeholders", () => {
  process.env.LAWYERBUDDY_TEST_PORT = "8080";
  try {
    const result = expandMcpString("http://localhost:${env:LAWYERBUDDY_TEST_PORT}${userHome}/path");
    assert.equal(result, `http://localhost:8080${homedir()}/path`);
  } finally {
    delete process.env.LAWYERBUDDY_TEST_PORT;
  }
});

test("expandMcpConfig recursively expands objects and arrays", () => {
  process.env.LAWYERBUDDY_TEST_VAL = "expanded";
  try {
    const input = {
      key: "${env:LAWYERBUDDY_TEST_VAL}",
      nested: { inner: "${userHome}/dir" },
      list: ["~/a", "${env:LAWYERBUDDY_TEST_VAL}"],
      number: 42,
    };
    const result = expandMcpConfig(input) as Record<string, unknown>;
    assert.equal(result.key, "expanded");
    assert.equal((result.nested as Record<string, string>).inner, homedir() + "/dir");
    assert.deepEqual(result.list, [homedir() + "/a", "expanded"]);
    assert.equal(result.number, 42);
  } finally {
    delete process.env.LAWYERBUDDY_TEST_VAL;
  }
});

test("parsePluginMcpServers expands ${env:*} in stdio env", () => {
  process.env.LAWYERBUDDY_TEST_TOKEN = "tok_abc";
  try {
    const { servers } = parsePluginMcpServers({
      myServer: {
        command: "node",
        args: ["server.js"],
        env: { API_TOKEN: "${env:LAWYERBUDDY_TEST_TOKEN}" },
      },
    });
    assert.equal(servers.length, 1);
    const s = servers[0]!;
    assert.equal(s.transport, "stdio");
    if (s.transport === "stdio") {
      assert.equal(s.env?.API_TOKEN, "tok_abc");
    }
  } finally {
    delete process.env.LAWYERBUDDY_TEST_TOKEN;
  }
});

test("parsePluginMcpServers expands ${env:*} in stdio command before transport detection", () => {
  process.env.LAWYERBUDDY_TEST_COMMAND = "node";
  try {
    const { servers, diagnostics } = parsePluginMcpServers({
      myServer: {
        command: "${env:LAWYERBUDDY_TEST_COMMAND}",
      },
    });
    assert.equal(diagnostics.length, 0);
    assert.equal(servers.length, 1);
    const s = servers[0]!;
    assert.equal(s.transport, "stdio");
    if (s.transport === "stdio") {
      assert.equal(s.command, "node");
    }
  } finally {
    delete process.env.LAWYERBUDDY_TEST_COMMAND;
  }
});

test("parsePluginMcpServers drops empty expanded stdio command", () => {
  delete process.env.__LAWYERBUDDY_NONEXISTENT_COMMAND__;
  const { servers, diagnostics } = parsePluginMcpServers({
    myServer: {
      command: "${env:__LAWYERBUDDY_NONEXISTENT_COMMAND__}",
    },
  });
  assert.equal(servers.length, 0);
  assert.equal(diagnostics[0]?.message, "no recognized transport (need command or url)");
});

test("parsePluginMcpServers expands ${userHome} in stdio cwd", () => {
  const { servers } = parsePluginMcpServers({
    myServer: {
      command: "node",
      cwd: "${userHome}/my-tools",
    },
  });
  assert.equal(servers.length, 1);
  const s = servers[0]!;
  if (s.transport === "stdio") {
    assert.equal(s.cwd, homedir() + "/my-tools");
  }
});

test("parsePluginMcpServers expands ~ in stdio args (backward compat)", () => {
  const { servers } = parsePluginMcpServers({
    myServer: {
      command: "node",
      args: ["~/server.js"],
    },
  });
  assert.equal(servers.length, 1);
  const s = servers[0]!;
  if (s.transport === "stdio") {
    assert.deepEqual(s.args, [homedir() + "/server.js"]);
  }
});

test("parsePluginMcpServers expands ${env:*} in streamable_http url", () => {
  process.env.LAWYERBUDDY_TEST_URL = "https://mcp.example.com";
  try {
    const { servers } = parsePluginMcpServers({
      httpServer: {
        url: "${env:LAWYERBUDDY_TEST_URL}/mcp",
      },
    });
    assert.equal(servers.length, 1);
    const s = servers[0]!;
    if (s.transport === "streamable_http") {
      assert.equal(s.url, "https://mcp.example.com/mcp");
    }
  } finally {
    delete process.env.LAWYERBUDDY_TEST_URL;
  }
});

test("parsePluginMcpServers expands ${env:*} in streamable_http headers", () => {
  process.env.LAWYERBUDDY_TEST_AUTH = "Bearer sk-123";
  try {
    const { servers } = parsePluginMcpServers({
      httpServer: {
        url: "https://mcp.example.com/mcp",
        headers: { Authorization: "${env:LAWYERBUDDY_TEST_AUTH}" },
      },
    });
    assert.equal(servers.length, 1);
    const s = servers[0]!;
    if (s.transport === "streamable_http") {
      assert.equal(s.headers?.Authorization, "Bearer sk-123");
    }
  } finally {
    delete process.env.LAWYERBUDDY_TEST_AUTH;
  }
});

test("user config and plugin config resolve same placeholders consistently", () => {
  process.env.LAWYERBUDDY_TEST_CONSISTENCY = "same_value";
  try {
    const userExpanded = expandMcpString("${env:LAWYERBUDDY_TEST_CONSISTENCY}");
    const { servers } = parsePluginMcpServers({
      srv: {
        command: "node",
        env: { VAR: "${env:LAWYERBUDDY_TEST_CONSISTENCY}" },
      },
    });
    const pluginExpanded = servers[0]!.transport === "stdio" ? servers[0]!.env?.VAR : undefined;
    assert.equal(userExpanded, pluginExpanded);
    assert.equal(userExpanded, "same_value");
  } finally {
    delete process.env.LAWYERBUDDY_TEST_CONSISTENCY;
  }
});
