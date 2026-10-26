import type { CanonicalMessage } from "../../model/index.js";
import type { LawyerBuddyHookEvent } from "../../extension/hooks/protocol/events.js";
import type { LawyerBuddyHookBaseInput } from "../../extension/hooks/protocol/input.js";
import type { LawyerBuddyHookEffect, LawyerBuddyLifecycleError } from "./effects.js";

export type LifecycleDispatchInput = {
  event: LawyerBuddyHookEvent;
  baseInput: LawyerBuddyHookBaseInput;
  payload?: Record<string, unknown>;
  matchQuery?: string;
  signal?: AbortSignal;
  env?: NodeJS.ProcessEnv;
};

export type LifecycleDispatchResult = {
  effects: LawyerBuddyHookEffect[];
  messages: CanonicalMessage[];
  events: unknown[];
  blockingErrors: LawyerBuddyLifecycleError[];
  nonBlockingErrors: LawyerBuddyLifecycleError[];
};

export function emptyLifecycleDispatchResult(): LifecycleDispatchResult {
  return {
    effects: [],
    messages: [],
    events: [],
    blockingErrors: [],
    nonBlockingErrors: [],
  };
}
