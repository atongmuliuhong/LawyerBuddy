import type { LawyerBuddyConfig } from "../../modelPool/types";

export function isCronConfigEnabled(config: LawyerBuddyConfig): boolean {
  return config.cron !== undefined && config.cron.enabled !== false;
}
