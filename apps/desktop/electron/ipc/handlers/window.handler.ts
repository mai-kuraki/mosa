import { BrowserWindow } from "electron";

export function handleWindowMinimize(): void {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.minimize();
}

export function handleWindowMaximize(): void {
  const win = BrowserWindow.getFocusedWindow();
  if (!win) return;
  if (win.isMaximized()) {
    win.unmaximize();
  } else {
    win.maximize();
  }
}

export function handleWindowClose(): void {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.close();
}
