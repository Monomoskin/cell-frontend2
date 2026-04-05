import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  saveUser: (username) => ipcRenderer.send("save-user", username),
});
