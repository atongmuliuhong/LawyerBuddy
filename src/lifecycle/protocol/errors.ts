export class LawyerBuddyLifecycleRuntimeError extends Error {
  readonly name = "LawyerBuddyLifecycleRuntimeError";

  constructor(
    readonly code: "hook_blocked" | "hook_failed",
    message: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
  }
}
