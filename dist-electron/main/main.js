"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const promises_1 = require("fs/promises");
const electron_is_dev_1 = __importDefault(require("electron-is-dev"));
let mainWindow = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: (0, path_1.join)(__dirname, '../preload/preload.js'),
        },
        show: false,
        titleBarStyle: 'default',
    });
    if (electron_is_dev_1.default) {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile((0, path_1.join)(__dirname, '../../out/index.html'));
    }
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
    });
    electron_1.Menu.setApplicationMenu(null);
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
// API handlers
electron_1.ipcMain.handle('get-app-version', () => {
    return electron_1.app.getVersion();
});
electron_1.ipcMain.handle('read-file', async (event, filePath) => {
    try {
        const content = await (0, promises_1.readFile)(filePath, 'utf-8');
        return content;
    }
    catch (error) {
        throw new Error(`Failed to read file: ${error}`);
    }
});
electron_1.ipcMain.handle('write-file', async (event, filePath, data) => {
    try {
        await (0, promises_1.writeFile)(filePath, data, 'utf-8');
        return { success: true };
    }
    catch (error) {
        throw new Error(`Failed to write file: ${error}`);
    }
});
electron_1.ipcMain.handle('show-open-dialog', async (event, options) => {
    const result = await electron_1.dialog.showOpenDialog(mainWindow, options);
    return result;
});
electron_1.ipcMain.handle('show-save-dialog', async (event, options) => {
    const result = await electron_1.dialog.showSaveDialog(mainWindow, options);
    return result;
});
electron_1.ipcMain.handle('show-notification', async (event, title, body) => {
    new electron_1.Notification({ title, body }).show();
});
electron_1.ipcMain.handle('set-title', (event, title) => {
    const webContents = event.sender;
    const win = electron_1.BrowserWindow.fromWebContents(webContents);
    if (win) {
        win.setTitle(title);
    }
});
// Event handlers для onUpdateCounter
let counter = 0;
electron_1.ipcMain.on('update-counter', (event, value) => {
    counter += value;
    event.reply('update-counter', counter);
});
electron_1.app.whenReady().then(createWindow);
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
