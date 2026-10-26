import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import type { LawyerBuddyConfig } from "../types";

export function safeParseYaml(text: string): LawyerBuddyConfig | null {
  try {
    const value = parseYaml(text);
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as LawyerBuddyConfig;
    }
    return null;
  } catch {
    return null;
  }
}

export function configToYamlString(config: LawyerBuddyConfig): string {
  return stringifyYaml(config, { indent: 2, lineWidth: 0 });
}
