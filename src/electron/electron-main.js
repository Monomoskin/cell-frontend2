import { app, BrowserWindow, ipcMain } from "electron";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import fs from "fs";
import os from "os";

// 🔹 Helpers ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 🔹 Detectar SO
const OS_TYPE = getOS();

// 🔹 Detectar si estamos empaquetados
const isPackaged = app.isPackaged;
const resourcesPath = isPackaged ? process.resourcesPath : __dirname;

// 🔹 Función isDev
function isDev() {
  return !isPackaged;
}

// 🔹 Rutas backend y Python
const backendPath = isPackaged
  ? join(resourcesPath, "backend", "app.py")
  : join(__dirname, "../../../backend/app.py");

const pythonExecutable = isPackaged
  ? process.platform === "win32"
    ? join(resourcesPath, "newenv", "Scripts", "python.exe")
    : join(resourcesPath, "newenv", "bin", "python")
  : "python"; // en dev usa python global

// 🔹 Variable global para backend
let backendProcess = null;

// 🔹 Función para levantar backend Flask
function startBackend() {
  const logPath = join(resourcesPath, "backend.log");
  const out = fs.openSync(logPath, "a");
  const err = fs.openSync(logPath, "a");

  backendProcess = spawn(pythonExecutable, [backendPath], {
    env: process.env,
    stdio: isDev() ? "inherit" : ["ignore", out, err],
  });

  backendProcess.on("close", (code) => {
    console.log(`Backend Flask finalizó con código ${code}`);
  });

  backendProcess.on("error", (err) => {
    console.error("Error al iniciar backend Flask:", err);
  });
}

// 🔹 Crear ventana principal
let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    minHeight: 600,
    height: 650,
    width: 1024,
    minWidth: 980,
    titleBarStyle: OS_TYPE === "windows" ? "hidden" : "hiddenInset",
    titleBarOverlay:
      OS_TYPE === "windows"
        ? {
            color: "#00000000",
            symbolColor: "#ccc",
            height: 25,
            cursor: "pointer",
          }
        : false,
    webPreferences: {
      preload: join(__dirname, "preload.js"), // seguro
      contextIsolation: true,
      nodeIntegration: false, // nunca true
    },
  });

  if (isDev()) {
    mainWindow.loadURL("http://localhost:3000");
  } else {
    mainWindow.loadFile(join(resourcesPath, "dist/index.html"));
  }
}

// 🔹 IPC para guardar username localmente
ipcMain.on("save-user", (event, username) => {
  try {
    const dataPath = join(app.getPath("userData"), "user.json");
    fs.writeFileSync(dataPath, JSON.stringify({ username }));
    console.log("Usuario guardado localmente:", username);
  } catch (err) {
    console.error("Error guardando usuario:", err);
  }
});

// 🔹 Eventos app
app.whenReady().then(() => {
  startBackend();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (backendProcess) {
    backendProcess.kill("SIGTERM");
    backendProcess = null;
  }
  if (process.platform !== "darwin") app.quit();
});

// 🔹 Función para detectar OS
function getOS() {
  const platform = os.platform();
  if (platform === "win32") return "windows";
  if (platform === "darwin") return "mac";
  return "unsupported";
}

// 🔹 Exportaciones opcionales
export { isDev, getOS };
