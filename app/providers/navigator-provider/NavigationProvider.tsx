"use client";
import { ReactNode } from "react";
import { NavigationItem } from "@/app/widgets/navbar/model";
//import { NavigationContextType } from "./model";
import { NavigationContext } from "./NavigationContext";
import { DEFAULT_NAV_ITEM } from "./constants/navigation.constants";

interface NavigationProviderProps {
  children: ReactNode;
  items?: NavigationItem[];
}

export const NavigationProvider = (props: NavigationProviderProps) => {
  const { children, items = DEFAULT_NAV_ITEM } = props;

  const getActiveItem = (currentPath: string): NavigationItem | undefined => {
    return items.find((item) => item.href === currentPath);
  };

  const value: any = {
    items,
    getActiveItem,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
