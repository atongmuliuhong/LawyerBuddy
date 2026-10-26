import React from "react";
import { Box, Text } from "ink";
import type { TuiAppState } from "./types.js";
import { lawyerBuddyDarkBlueTheme } from "./theme.js";

export function Header({
  state,
  model,
  cwd,
  serverUrl,
}: {
  state: TuiAppState;
  model?: string;
  cwd: string;
  serverUrl?: string;
}): React.ReactNode {
  const connection =
    state.connection === "remote" ? (serverUrl ? `server ${serverUrl}` : "server connected") : "local in-process";

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text>
        <Text color={lawyerBuddyDarkBlueTheme.brand} bold>
          Pilot
        </Text>
        <Text color={lawyerBuddyDarkBlueTheme.brandAccent} bold>
          Deck
        </Text>
        <Text color={lawyerBuddyDarkBlueTheme.brandAccent}> ↗</Text>
        <Text color={lawyerBuddyDarkBlueTheme.subtle}>{"  "}v0.1.0</Text>
      </Text>
      <Text color={lawyerBuddyDarkBlueTheme.subtle}>
        {model ?? "model"} · {state.mode} · {shortenPath(cwd)} · {connection}
      </Text>
    </Box>
  );
}

function shortenPath(path: string): string {
  if (path.length <= 60) {
    return path;
  }
  return `...${path.slice(-57)}`;
}
