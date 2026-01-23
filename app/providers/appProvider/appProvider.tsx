"use client";

import { ErrorBoundaryProvider } from "../errorBoundary/ErrorBoundaryProvider";
import { NavigationProvider } from "../navigator-provider";

interface AppProviderProps {
  children: React.ReactNode;
}
export const AppProviders = (props: AppProviderProps) => {
  const { children } = props;
  return (
    <ErrorBoundaryProvider>
      <NavigationProvider>{children}</NavigationProvider>
    </ErrorBoundaryProvider>
  );
};
