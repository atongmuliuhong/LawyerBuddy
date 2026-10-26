export type LawyerBuddyExtensionError = {
  code: "extension_load_failed" | "extension_invalid";
  message: string;
};
