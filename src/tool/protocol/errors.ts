export type LawyerBuddyToolErrorCode =
  | "tool_not_found"
  | "tool_unavailable"
  | "invalid_tool_input"
  | "permission_denied"
  | "permission_cancelled"
  | "permission_required"
  | "tool_execution_failed"
  | "tool_aborted"
  | "tool_timeout"
  | "result_too_large"
  | "path_not_allowed"
  | "file_not_found"
  | "file_conflict"
  | "unsupported_tool"
  | "setup_required"
  | "plan_mode_violation"
  | "ask_mode_violation";

export type LawyerBuddyToolError = {
  code: LawyerBuddyToolErrorCode;
  message: string;
  cause?: unknown;
  details?: Record<string, unknown>;
};

export class LawyerBuddyToolRuntimeError extends Error {
  readonly code: LawyerBuddyToolErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(code: LawyerBuddyToolErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "LawyerBuddyToolRuntimeError";
    this.code = code;
    this.details = details;
  }
}

export function toolError(
  code: LawyerBuddyToolErrorCode,
  message: string,
  details?: Record<string, unknown>,
): LawyerBuddyToolError {
  return { code, message, details };
}

export function normalizeToolError(error: unknown): LawyerBuddyToolError {
  if (error instanceof LawyerBuddyToolRuntimeError) {
    return toolError(error.code, error.message, error.details);
  }

  if (error instanceof Error) {
    return {
      code: "tool_execution_failed",
      message: error.message,
      cause: error,
    };
  }

  return {
    code: "tool_execution_failed",
    message: "Tool execution failed with a non-Error value.",
    cause: error,
  };
}
