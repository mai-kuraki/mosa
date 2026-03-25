import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "@mosa/ipc-bridge";
import type { IpcEvents } from "@mosa/ipc-bridge";

/**
 * Type-safe API exposed to the Renderer process via contextBridge.
 * All IPC calls go through this bridge — Renderer never accesses Node.js directly.
 */
const mosaApi = {
  /** Invoke an IPC handler on the Main process and await the result. */
  invoke: <T>(channel: string, data?: unknown): Promise<T> => {
    const validChannels = Object.values(IPC_CHANNELS);
    if (!validChannels.includes(channel as (typeof validChannels)[number])) {
      return Promise.reject(new Error(`Invalid IPC channel: ${channel}`));
    }
    return ipcRenderer.invoke(channel, data);
  },

  /** Listen for one-way events pushed from Main process. */
  on: <K extends keyof IpcEvents>(
    event: K,
    callback: (data: IpcEvents[K]) => void,
  ): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: IpcEvents[K]) => callback(data);
    ipcRenderer.on(event as string, handler);
    return () => ipcRenderer.removeListener(event as string, handler);
  },

  /** One-time event listener. */
  once: <K extends keyof IpcEvents>(event: K, callback: (data: IpcEvents[K]) => void): void => {
    ipcRenderer.once(event as string, (_event, data) => callback(data));
  },
};

contextBridge.exposeInMainWorld("mosaApi", mosaApi);

// Type declaration for Renderer process
export type MosaApi = typeof mosaApi;
