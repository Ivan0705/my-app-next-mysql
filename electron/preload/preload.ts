import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  getVersion: () => ipcRenderer.invoke('get-app-version'),
  
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  
  writeFile: (filePath: string, data: string) => 
    ipcRenderer.invoke('write-file', filePath, data),
  
  showOpenDialog: (options: any) => 
    ipcRenderer.invoke('show-open-dialog', options),
    
  showSaveDialog: (options: any) => 
    ipcRenderer.invoke('show-save-dialog', options),
    
  showNotification: (title: string, body: string) =>
    ipcRenderer.invoke('show-notification', title, body),

  setTitle: (title: string) => ipcRenderer.invoke('set-title', title),
  
  onUpdateCounter: (callback: (value: number) => void) => {
    const listener = (event: any, value: number) => callback(value);
    ipcRenderer.on('update-counter', listener);
    
    return () => {
      ipcRenderer.removeListener('update-counter', listener);
    };
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;
