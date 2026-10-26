import type { LawyerBuddyToolResult } from "../protocol/result.js";
import type { LawyerBuddyToolCall, LawyerBuddyToolRuntimeContext } from "../protocol/types.js";
import type { ToolRuntime } from "../execution/ToolRuntime.js";
import type { LawyerBuddyToolScheduler } from "./ToolScheduler.js";

export class SequentialToolScheduler implements LawyerBuddyToolScheduler {
  constructor(private readonly runtime: ToolRuntime) {}

  async executeAll(
    calls: LawyerBuddyToolCall[],
    context: LawyerBuddyToolRuntimeContext,
  ): Promise<LawyerBuddyToolResult[]> {
    const results: LawyerBuddyToolResult[] = [];
    for (const call of calls) {
      results.push(await this.runtime.execute(call, context));
    }
    return results;
  }
}
