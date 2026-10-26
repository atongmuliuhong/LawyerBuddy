import type { LawyerBuddyCustomRouter } from "../../router/customRouter/customRouter.js";

export type RouterContribution = {
  id: string;
  description?: string;
  createCustomRouter(): LawyerBuddyCustomRouter;
};
