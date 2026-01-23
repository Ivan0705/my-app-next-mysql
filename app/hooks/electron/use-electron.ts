'use client';

import { useEffect, useState } from "react";

interface ElectronAPI {
  getVersion: () => Promise<string>;
  readFile: (filePath: string) => Promise<string>;
  writeFile: (filePath: string, data: string) => Promise<{ success: boolean }>;
  showOpenDialog: (options: any) => Promise<any>;
  showSaveDialog: (options: any) => Promise<any>;
  showNotification: (title: string, body: string) => Promise<void>;
  setTitle: (title: string) => Promise<void>;
  onUpdateCounter: (callback: (value: number) => void) => () => void;
}

// Расширяем Window interface для TypeScript
declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export const useElectron = () => {
  const [isElectron, setIsElectron] = useState(false);
  const [electronAPI, setElectronAPI] = useState<ElectronAPI | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkElectron = () => {
      // Проверяем наличие electronAPI в window
      return !!(window && (window as any).electronAPI);
    };

    const detected = checkElectron();
    setIsElectron(detected);

    if (detected && window.electronAPI) {
      setElectronAPI(window.electronAPI);
    }

    setIsLoading(false);
  }, []);

  return {
    isElectron,
    electronAPI,
    isLoading,
  };
};
