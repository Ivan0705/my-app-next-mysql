export interface ElectronAPI {
  getVersion: () => Promise<string>;
  readFile: (filePath: string) => Promise<string>;
  writeFile: (filePath: string, data: string) => Promise<{ success: boolean }>;
  showOpenDialog: (options: any) => Promise<any>;
  showSaveDialog: (options: any) => Promise<any>;
  showNotification: (title: string, body: string) => Promise<void>;
  setTitle: (title: string) => Promise<void>;
  onUpdateCounter: (callback: (value: number) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
