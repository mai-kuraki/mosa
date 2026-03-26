import { app, BrowserWindow, protocol, shell } from "electron";
import { join } from "path";
import { readFile } from "fs/promises";
import { createLogger } from "./services/logger.service";

const logger = createLogger("main");

let mainWindow: BrowserWindow | null = null;

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    title: "Mosa",
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 12, y: 12 },
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
    if (process.env.NODE_ENV === "development") {
      mainWindow?.webContents.openDevTools({ mode: "detach" });
    }
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

// Register mosa:// as a privileged scheme (must be called before app ready)
protocol.registerSchemesAsPrivileged([
  { scheme: "mosa", privileges: { standard: false, secure: true, supportFetchAPI: true } },
]);

app.whenReady().then(async () => {
  logger.info("Mosa starting...");

  // Handle mosa://thumbnail/<absolute-path> → serve local file
  protocol.handle("mosa", async (req) => {
    const filePath = decodeURIComponent(req.url.replace(/^mosa:\/\/[^/]+/, ""));
    try {
      const data = await readFile(filePath);
      return new Response(data, {
        headers: { "Content-Type": "image/jpeg" },
      });
    } catch (e) {
      logger.error(`Protocol handler failed for: ${filePath}`, e);
      return new Response("Not found", { status: 404 });
    }
  });

  // Initialize database and IPC handlers BEFORE creating window
  try {
    const { initDatabase } = await import("./services/database.service");
    await initDatabase();
    logger.info("Database initialized");

    const { registerIpcHandlers } = await import("./ipc");
    registerIpcHandlers();
    logger.info("IPC handlers registered");
  } catch (e) {
    logger.error("Background init failed:", e);
  }

  createWindow();

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
