import type { LawyerBuddyHooksSettings } from "../../hooks/protocol/settings.js";

export type LawyerBuddyPluginManifest = {
  name: string;
  version?: string;
  description?: string;
  commands?: string | string[];
  agents?: string | string[];
  skills?: string | string[];
  hooks?: string | LawyerBuddyHooksSettings;
  mcpServers?: Record<string, unknown>;
  lspServers?: Record<string, unknown>;
  outputStyles?: string | string[];
  marketplace?: LawyerBuddyMarketplaceReference;
  mcpb?: string;
  settings?: Record<string, unknown>;
};

export type LawyerBuddyMarketplaceReference = {
  name: string;
  plugin: string;
  version?: string;
  source?: "marketplace" | "git" | "zip" | "mcpb";
  url?: string;
};
