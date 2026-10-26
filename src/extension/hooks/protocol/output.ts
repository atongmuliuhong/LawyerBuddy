export type LawyerBuddyPermissionHookDecision =
  | {
      behavior: "allow";
      updatedInput?: Record<string, unknown>;
      updatedPermissions?: unknown[];
    }
  | {
      behavior: "deny";
      message?: string;
      interrupt?: boolean;
    };

export type LawyerBuddyHookSpecificOutput = {
  hookEventName: string;
  additionalContext?: string;
  initialUserMessage?: string;
  watchPaths?: string[];
  permissionDecision?: "allow" | "deny" | "ask" | "passthrough";
  permissionDecisionReason?: string;
  updatedInput?: Record<string, unknown>;
  updatedMCPToolOutput?: unknown;
  decision?: LawyerBuddyPermissionHookDecision;
  retry?: boolean;
  worktreePath?: string;
};

export type LawyerBuddyHookSyncOutput = {
  type: "sync";
  continue?: boolean;
  suppressOutput?: boolean;
  stopReason?: string;
  decision?: "approve" | "block";
  reason?: string;
  systemMessage?: string;
  specific?: LawyerBuddyHookSpecificOutput;
  raw?: unknown;
};

export type LawyerBuddyHookAsyncOutput = {
  type: "async";
  raw?: unknown;
};

export type LawyerBuddyHookOutput = LawyerBuddyHookSyncOutput | LawyerBuddyHookAsyncOutput;
