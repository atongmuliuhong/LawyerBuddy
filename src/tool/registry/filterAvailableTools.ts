import type {
  LawyerBuddyToolAvailability,
  LawyerBuddyToolAvailabilityContext,
  LawyerBuddyToolDefinition,
} from "../protocol/types.js";
import { ToolRegistry, type ToolUnavailableDiagnostic } from "./ToolRegistry.js";

export type LawyerBuddyUnavailableToolDiagnostic = {
  toolName: string;
  code: Exclude<LawyerBuddyToolAvailability, { ok: true }>["code"];
  reason: string;
};

export type FilterAvailableToolsResult = {
  registry: ToolRegistry;
  unavailable: LawyerBuddyUnavailableToolDiagnostic[];
};

export async function filterAvailableTools(
  registry: ToolRegistry,
  context: LawyerBuddyToolAvailabilityContext,
): Promise<FilterAvailableToolsResult> {
  const filtered = new ToolRegistry();
  const unavailable: LawyerBuddyUnavailableToolDiagnostic[] = [];
  for (const { diagnostic, aliases } of registry.listUnavailableEntries()) {
    filtered.markUnavailable(diagnostic, aliases);
    unavailable.push(diagnostic);
  }
  const checkCache = new Map<
    NonNullable<LawyerBuddyToolDefinition["checkAvailability"]>,
    Promise<LawyerBuddyToolAvailability>
  >();

  for (const tool of registry.list()) {
    const availability = await resolveToolAvailability(tool, context, checkCache);
    if (availability.ok) {
      filtered.register(tool);
      continue;
    }

    const diagnostic: LawyerBuddyUnavailableToolDiagnostic = {
      toolName: tool.name,
      code: availability.code,
      reason: availability.reason,
    };
    unavailable.push(diagnostic);
    const marked: ToolUnavailableDiagnostic = diagnostic;
    filtered.markUnavailable(marked, tool.aliases);
  }

  return { registry: filtered, unavailable };
}

async function resolveToolAvailability(
  tool: LawyerBuddyToolDefinition,
  context: LawyerBuddyToolAvailabilityContext,
  cache: Map<NonNullable<LawyerBuddyToolDefinition["checkAvailability"]>, Promise<LawyerBuddyToolAvailability>>,
): Promise<LawyerBuddyToolAvailability> {
  const check = tool.checkAvailability;
  if (!check) {
    return { ok: true };
  }

  let promise = cache.get(check);
  if (!promise) {
    promise = Promise.resolve()
      .then(() => check(context))
      .catch((error): LawyerBuddyToolAvailability => ({
        ok: false,
        code: "failed_check",
        reason: error instanceof Error ? error.message : String(error),
      }));
    cache.set(check, promise);
  }

  return promise;
}
