export {
  BackgroundTaskRuntime,
  type BackgroundTaskRuntimeOptions,
  type StartTaskSpec,
  type StopTaskOptions,
} from "./runtime/BackgroundTaskRuntime.js";
export { TaskOutputStore, type TaskOutputStoreOptions } from "./storage/TaskOutputStore.js";
export type {
  LawyerBuddyBackgroundBashTask,
  LawyerBuddyBackgroundTaskKind,
  LawyerBuddyBackgroundTaskListFilter,
  LawyerBuddyBackgroundTaskStatus,
  LawyerBuddyTaskOutputSlice,
} from "./protocol/types.js";
