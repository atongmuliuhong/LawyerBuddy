export type LawyerBuddyToolInputSchema = {
  type: "object";
  properties?: Record<string, LawyerBuddyJsonSchema>;
  required?: string[];
  additionalProperties?: boolean;
  [key: string]: unknown;
};

export type LawyerBuddyJsonSchema = {
  type?: string | string[];
  properties?: Record<string, LawyerBuddyJsonSchema>;
  required?: string[];
  additionalProperties?: boolean;
  items?: LawyerBuddyJsonSchema;
  enum?: unknown[];
  [key: string]: unknown;
};

export type LawyerBuddyToolValidationIssue = {
  path: string;
  code: "required" | "unknown_property" | "invalid_type" | "invalid_enum" | "invalid_schema";
  message: string;
};

export type LawyerBuddyToolValidationResult =
  | { ok: true; input: unknown }
  | { ok: false; issues: LawyerBuddyToolValidationIssue[] };
