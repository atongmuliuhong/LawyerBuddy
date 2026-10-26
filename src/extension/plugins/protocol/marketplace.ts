import type { LawyerBuddyMarketplaceReference } from "./manifest.js";

export type LawyerBuddyPluginMarketplaceStatus = "resolved" | "deferred";

export type LawyerBuddyMarketplaceResolution = {
  status: LawyerBuddyPluginMarketplaceStatus;
  reference: LawyerBuddyMarketplaceReference;
  reason?: string;
};

export function resolveMarketplaceReference(reference: LawyerBuddyMarketplaceReference): LawyerBuddyMarketplaceResolution {
  if (reference.source === "git" || reference.source === "zip" || reference.source === "mcpb") {
    return {
      status: "deferred",
      reference,
      reason: `${reference.source} installation is not implemented in the local runtime.`,
    };
  }
  return { status: "resolved", reference };
}
