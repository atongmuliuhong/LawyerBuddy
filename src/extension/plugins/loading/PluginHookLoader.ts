import type { LawyerBuddyHooksSettings } from "../../hooks/protocol/settings.js";
import type { LawyerBuddyLoadedPlugin } from "../protocol/plugin.js";

export function loadPluginHooks(plugins: LawyerBuddyLoadedPlugin[]): LawyerBuddyHooksSettings {
  const settings: LawyerBuddyHooksSettings = {};
  for (const plugin of plugins) {
    for (const [event, matchers] of Object.entries(plugin.hooksConfig ?? {}) as Array<
      [keyof LawyerBuddyHooksSettings, NonNullable<LawyerBuddyHooksSettings[keyof LawyerBuddyHooksSettings]>]
    >) {
      settings[event] = [
        ...(settings[event] ?? []),
        ...matchers.map((matcher) => ({
          ...matcher,
          pluginName: plugin.name,
          pluginId: `${plugin.name}@${plugin.source}`,
          pluginRoot: plugin.path,
        })),
      ];
    }
  }
  return settings;
}
