import { app, BrowserWindow, Menu, ipcMain, dialog, Notification } from 'electron';
import { join } from 'path';
import { readFile, writeFile } from 'fs/promises';
import isDev from 'electron-is-dev';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, '../preload/preload.js'),
    },
    show: false,
    titleBarStyle: 'default',
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../../out/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  Menu.setApplicationMenu(null);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// API handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('read-file', async (event, filePath: string) => {
  try {
    const content = await readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    throw new Error(`Failed to read file: ${error}`);
  }
});

ipcMain.handle('write-file', async (event, filePath: string, data: string) => {
  try {
    await writeFile(filePath, data, 'utf-8');
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to write file: ${error}`);
  }
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow!, options);
  return result;
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow!, options);
  return result;
});

ipcMain.handle('show-notification', async (event, title: string, body: string) => {
  new Notification({ title, body }).show();
});

ipcMain.handle('set-title', (event, title: string) => {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  if (win) {
    win.setTitle(title);
  }
});

// Event handlers для onUpdateCounter
let counter = 0;
ipcMain.on('update-counter', (event, value) => {
  counter += value;
  event.reply('update-counter', counter);
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
