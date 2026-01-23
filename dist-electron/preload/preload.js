"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electronAPI = {
    getVersion: () => electron_1.ipcRenderer.invoke('get-app-version'),
    readFile: (filePath) => electron_1.ipcRenderer.invoke('read-file', filePath),
    writeFile: (filePath, data) => electron_1.ipcRenderer.invoke('write-file', filePath, data),
    showOpenDialog: (options) => electron_1.ipcRenderer.invoke('show-open-dialog', options),
    showSaveDialog: (options) => electron_1.ipcRenderer.invoke('show-save-dialog', options),
    showNotification: (title, body) => electron_1.ipcRenderer.invoke('show-notification', title, body),
    setTitle: (title) => electron_1.ipcRenderer.invoke('set-title', title),
    onUpdateCounter: (callback) => {
        const listener = (event, value) => callback(value);
        electron_1.ipcRenderer.on('update-counter', listener);
        return () => {
            electron_1.ipcRenderer.removeListener('update-counter', listener);
        };
    },
};
electron_1.contextBridge.exposeInMainWorld('electronAPI', electronAPI);
