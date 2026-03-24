/**
 * Type-safe IPC client for the Renderer process.
 * Wraps window.mosaApi with proper typing.
 */
export const ipc = {
  invoke: <T>(channel: string, data?: unknown): Promise<T> => {
    return window.mosaApi!.invoke<T>(channel, data);
  },
  on: window.mosaApi?.on.bind(window.mosaApi),
  once: window.mosaApi?.once.bind(window.mosaApi),
};
