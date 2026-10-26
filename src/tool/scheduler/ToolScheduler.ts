import type { LawyerBuddyToolResult } from "../protocol/result.js";
import type { LawyerBuddyToolCall, LawyerBuddyToolRuntimeContext } from "../protocol/types.js";

export type LawyerBuddyToolScheduler = {
  executeAll(calls: LawyerBuddyToolCall[], context: LawyerBuddyToolRuntimeContext): Promise<LawyerBuddyToolResult[]>;
};
