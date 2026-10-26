import type { LawyerBuddyLoadedPlugin } from "../protocol/plugin.js";

export function discoverBuiltinPlugins(plugins: LawyerBuddyLoadedPlugin[] = []): LawyerBuddyLoadedPlugin[] {
  return plugins.filter((plugin) => plugin.source === "builtin");
}
