import { app, BrowserWindow } from "electron";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import fetch from "node-fetch"; // npm install node-fetch@2

// 🔹 Helpers ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 🔹 Detectar SO
const OS_TYPE = getOS();

// 🔹 Detectar si estamos empaquetados
const isPackaged = app.isPackaged;
const resourcesPath = isPackaged ? process.resourcesPath : __dirname;

// 🔹 Función para detectar si estamos en desarrollo
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
  : "python"; // usa Python del entorno activo en dev

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

// 🔹 Esperar a que el backend responda en /api/summary
function waitBackendReady(retries = 10, interval = 1000) {
  const url = "http://127.0.0.1:5000/api/estimations/summary"; // ← ruta correcta

  return new Promise((resolve, reject) => {
    let attempts = 0;

    const check = () => {
      attempts++;
      console.log(`[Backend Check] Intento ${attempts} a ${url}`);

      fetch(url)
        .then((res) => {
          if (res.ok) {
            console.log(`[Backend Ready] ${url} respondió correctamente`);
            resolve();
          } else {
            console.log(`[Backend Not Ready] Status: ${res.status}`);
            throw new Error("Backend aún no listo");
          }
        })
        .catch((err) => {
          console.log(`[Backend Check Failed] ${err.message}`);
          if (attempts < retries) {
            setTimeout(check, interval);
          } else {
            reject(new Error("Backend no respondió en el tiempo esperado"));
          }
        });
    };

    check();
  });
}

// 🔹 Crear ventana principal
let mainWindow;
function createMainWindow() {
  mainWindow = new BrowserWindow({
    minHeight: 600,
    height: 850,
    width: 1024,
    minWidth: 1080,
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
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev()) {
    mainWindow.loadURL("http://localhost:3000");
  } else {
    mainWindow.loadFile(join(resourcesPath, "dist/index.html"));
  }
}

// 🔹 Crear ventana de loading
let loadingScreen;
function createLoadingScreen() {
  loadingScreen = new BrowserWindow({
    minHeight: 600,
    height: 650,
    width: 1000,
    minWidth: 950,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev()) {
    loadingScreen.loadFile(join(app.getAppPath(), "./public/loading.html"));
  } else {
    loadingScreen.loadFile(join(app.getAppPath(), "/dist-react/loading.html"));
  }

  loadingScreen.once("ready-to-show", () => {
    loadingScreen.show();
    startBackend();

    // Esperar a backend y luego abrir ventana principal
    waitBackendReady()
      .then(() => {
        createMainWindow();
        loadingScreen.close();
      })
      .catch((err) => {
        console.error(err);
        createMainWindow();
        loadingScreen.close();
        // loadingScreen.webContents.executeJavaScript(`
        //   document.body.innerHTML = "<h2>Backend no respondió a tiempo 😢</h2>";
        // `);
      });
  });
}

// 🔹 Eventos app
app.whenReady().then(() => {
  createLoadingScreen();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createLoadingScreen();
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
