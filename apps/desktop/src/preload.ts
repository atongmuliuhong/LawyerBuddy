import { contextBridge, ipcRenderer, webFrame, type IpcRendererEvent } from "electron";

import { installWindowChrome } from "./preloadChrome";
import type { DesktopCommand, DesktopMenuState } from "./desktopCommands";
import type { DesktopAppearance } from './appearance';
import type { FilePickerRequest, FilePickerResult } from './filePicker';

installWindowChrome(process.platform, ipcRenderer);

type RuntimeStatus = {
  phase: string;
  message: string;
  logPath?: string;
  error?: string;
};

contextBridge.exposeInMainWorld("lawyerbuddyDesktop", {
  platform: process.platform,
  // Zoom roles in the application menu drive these; the renderer polls the
  // factor on window resize to show transient feedback (webFrame has no events).
  getZoomFactor: () => webFrame.getZoomFactor(),
  resetZoom: () => {
    webFrame.setZoomLevel(0);
  },
  setMenuState: (state: DesktopMenuState) => ipcRenderer.invoke("lawyerbuddy:menu-state", state),
  onCommand: (callback: (command: DesktopCommand) => void) => {
    const listener = (_event: IpcRendererEvent, command: DesktopCommand) => callback(command);
    ipcRenderer.on("lawyerbuddy:command", listener);
    return () => ipcRenderer.off("lawyerbuddy:command", listener);
  },
  getAppearance: () => ipcRenderer.sendSync("lawyerbuddy:get-appearance") as DesktopAppearance | null,
  getAppearanceCapabilities: () => ipcRenderer.invoke('lawyerbuddy:appearance-capabilities') as Promise<{ hardwareAcceleration: boolean }>,
  setAppearance: (value: Partial<DesktopAppearance>) => ipcRenderer.invoke("lawyerbuddy:set-appearance", value),
  saveAppearanceImage: (bytes: Uint8Array) => ipcRenderer.invoke('lawyerbuddy:save-appearance-image', bytes),
  readAppearanceImage: (id: string) => ipcRenderer.invoke('lawyerbuddy:read-appearance-image', id),
  deleteAppearanceImage: (id: string) => ipcRenderer.invoke('lawyerbuddy:delete-appearance-image', id),
  checkUpdates: () => ipcRenderer.invoke("lawyerbuddy:update-check"),
  getUpdateStatus: () => ipcRenderer.invoke("lawyerbuddy:update-status"),
  startUpdate: () => ipcRenderer.invoke("lawyerbuddy:update-start"),
  cancelUpdate: () => ipcRenderer.invoke("lawyerbuddy:update-cancel"),
  pauseUpdate: () => ipcRenderer.invoke("lawyerbuddy:update-pause"),
  resumeUpdate: () => ipcRenderer.invoke("lawyerbuddy:update-resume"),
  getRuntimeInfo: () => ipcRenderer.invoke("lawyerbuddy:get-runtime-info"),
  getAboutInfo: () => ipcRenderer.invoke("lawyerbuddy:about-info"),
  onRuntimeStatus: (callback: (status: RuntimeStatus) => void) => {
    const listener = (_event: IpcRendererEvent, status: RuntimeStatus) => callback(status);
    ipcRenderer.on("lawyerbuddy:runtime-status", listener);
    return () => ipcRenderer.off("lawyerbuddy:runtime-status", listener);
  },
  retryRuntime: () => ipcRenderer.invoke("lawyerbuddy:retry-runtime"),
  openRuntimeLog: () => ipcRenderer.invoke("lawyerbuddy:open-runtime-log"),
  pickFolder: () => ipcRenderer.invoke("lawyerbuddy:pick-folder"),
  pickFiles: (request: FilePickerRequest) => ipcRenderer.invoke('lawyerbuddy:pick-files', request) as Promise<FilePickerResult>,
});
