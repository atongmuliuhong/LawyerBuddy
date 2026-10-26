import type { LawyerBuddyHookEvent } from "../protocol/events.js";

export type LawyerBuddyHookExecutionEvent =
  | {
      type: "started";
      hookName: string;
      hookEvent: LawyerBuddyHookEvent;
    }
  | {
      type: "response";
      hookName: string;
      hookEvent: LawyerBuddyHookEvent;
      stdout: string;
      stderr: string;
      exitCode?: number;
      outcome: "success" | "blocking" | "non_blocking_error" | "cancelled" | "timeout";
    };

export type LawyerBuddyHookExecutionEventHandler = (event: LawyerBuddyHookExecutionEvent) => void;

export class HookExecutionEventBus {
  private handlers = new Set<LawyerBuddyHookExecutionEventHandler>();

  subscribe(handler: LawyerBuddyHookExecutionEventHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  emit(event: LawyerBuddyHookExecutionEvent): void {
    for (const handler of this.handlers) {
      handler(event);
    }
  }
}
