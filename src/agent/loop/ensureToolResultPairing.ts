import type { CanonicalToolCall } from "../../model/index.js";
import type { LawyerBuddyToolErrorResult, LawyerBuddyToolResult } from "../../tool/index.js";
import { buildToolErrorRecovery } from "../../tool/execution/errorRecovery.js";

export type MissingToolResultRecoveryContext = {
  cwd?: string;
  permissionMode?: string;
};

export function ensureToolResultPairing(
  calls: CanonicalToolCall[],
  results: LawyerBuddyToolResult[],
  now: () => Date = () => new Date(),
  message = "Tool execution did not produce a result.",
  recoveryContext?: MissingToolResultRecoveryContext,
): LawyerBuddyToolResult[] {
  const resultsByCallId = new Map<string, LawyerBuddyToolResult[]>();
  for (const result of results) {
    const queue = resultsByCallId.get(result.toolCallId);
    if (queue) {
      queue.push(result);
    } else {
      resultsByCallId.set(result.toolCallId, [result]);
    }
  }

  const paired: LawyerBuddyToolResult[] = [];

  for (const call of calls) {
    paired.push(
      resultsByCallId.get(call.id)?.shift()
        ?? createMissingToolResult(call, now, message, recoveryContext),
    );
  }

  return paired;
}

export function createMissingToolResult(
  call: CanonicalToolCall,
  now: () => Date = () => new Date(),
  message = "Tool execution did not produce a result.",
  recoveryContext?: MissingToolResultRecoveryContext,
): LawyerBuddyToolErrorResult {
  const timestamp = now().toISOString();
  const recovery = buildToolErrorRecovery({
    code: "tool_execution_failed",
    toolName: call.name,
    message,
    cwd: recoveryContext?.cwd ?? ".",
    permissionMode: recoveryContext?.permissionMode ?? "default",
  });
  return {
    type: "error",
    toolCallId: call.id,
    toolName: call.name,
    error: {
      code: "tool_execution_failed",
      message,
    },
    content: [{ type: "text", text: recovery.message }],
    metadata: {
      recovery: recovery.advice,
    },
    startedAt: timestamp,
    completedAt: timestamp,
  };
}
