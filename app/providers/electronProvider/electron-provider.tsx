// app/providers/electron-provider.tsx
"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useElectron } from "../../hooks/electron/use-electron";

interface ElectronContextValue {
  isElectron: boolean;
  electronAPI: ReturnType<typeof useElectron>["electronAPI"];
  isLoading: boolean;
}

const ElectronContext = createContext<ElectronContextValue | undefined>(
  undefined
);

export const ElectronProvider = ({ children }: { children: ReactNode }) => {
  const electron = useElectron();

  return (
    <ElectronContext.Provider value={electron}>
      {children}
    </ElectronContext.Provider>
  );
};

export const useElectronContext = () => {
  const context = useContext(ElectronContext);
  if (context === undefined) {
    throw new Error(
      "useElectronContext must be used within an ElectronProvider"
    );
  }
  return context;
};
