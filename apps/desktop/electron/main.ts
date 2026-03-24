import { app, BrowserWindow, shell } from "electron";
import { join } from "path";
import { createLogger } from "./services/logger.service";

const logger = createLogger("main");

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    title: "Mosa",
    frame: false,
    roundedCorners: true,
    backgroundColor: "#FFFFFF",
    webPreferences: {
      preload: join(__dirname, "../preload/preload.mjs"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });

  // Push maximize state changes to Renderer for TitleBar icon toggle
  mainWindow.on("maximize", () => {
    mainWindow?.webContents.send("window:maximized-change", true);
  });
  mainWindow.on("unmaximize", () => {
    mainWindow?.webContents.send("window:maximized-change", false);
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(async () => {
  logger.info("Mosa starting...");

  createWindow();

  // Initialize database and IPC handlers asynchronously after window is created
  import("./services/database.service")
    .then((m) => m.initDatabase())
    .then(() => {
      logger.info("Database initialized");
      return import("./ipc").then((m) => m.registerIpcHandlers());
    })
    .then(() => {
      logger.info("IPC handlers registered");
    })
    .catch((e) => logger.error("Background init failed:", e));

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
