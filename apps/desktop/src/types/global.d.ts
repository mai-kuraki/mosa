import type { IpcEvents } from "@mosa/ipc-bridge";

export interface MosaApi {
  invoke: <T>(channel: string, data?: unknown) => Promise<T>;
  on: <K extends keyof IpcEvents>(event: K, callback: (data: IpcEvents[K]) => void) => () => void;
  once: <K extends keyof IpcEvents>(event: K, callback: (data: IpcEvents[K]) => void) => void;
}

declare global {
  interface Window {
    mosaApi?: MosaApi;
  }
}
