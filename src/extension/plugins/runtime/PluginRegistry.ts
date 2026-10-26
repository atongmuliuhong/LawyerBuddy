import type { LawyerBuddyLoadedPlugin } from "../protocol/plugin.js";

export class PluginRegistry {
  private readonly plugins = new Map<string, LawyerBuddyLoadedPlugin>();

  replaceAll(plugins: LawyerBuddyLoadedPlugin[]): void {
    this.plugins.clear();
    for (const plugin of plugins) {
      this.plugins.set(`${plugin.name}@${plugin.source}`, plugin);
    }
  }

  list(): LawyerBuddyLoadedPlugin[] {
    return [...this.plugins.values()];
  }
}
