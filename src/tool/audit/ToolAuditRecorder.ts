import type { PermissionDecision, PermissionDecisionReason, PermissionMode } from "../../permission/index.js";
import type { LawyerBuddyToolErrorCode } from "../protocol/errors.js";

export type LawyerBuddyPermissionAuditRecord = {
  type: "permission";
  sessionId: string;
  turnId: string;
  toolCallId: string;
  toolName: string;
  mode: PermissionMode;
  decision: PermissionDecision["type"];
  reason: PermissionDecisionReason;
  createdAt: string;
};

export type LawyerBuddyToolAuditRecord = {
  type: "tool";
  sessionId: string;
  turnId: string;
  toolCallId: string;
  toolName: string;
  status: "success" | "error";
  errorCode?: LawyerBuddyToolErrorCode;
  startedAt: string;
  completedAt: string;
  durationMs: number;
};

export type LawyerBuddyToolAuditRecorder = {
  recordPermission(record: LawyerBuddyPermissionAuditRecord): void | Promise<void>;
  recordTool(record: LawyerBuddyToolAuditRecord): void | Promise<void>;
};
