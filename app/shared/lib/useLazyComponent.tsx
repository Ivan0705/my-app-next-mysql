import { lazy } from "react";

export const useLazyComponent = (factory: () => Promise<any>) => {
  return lazy(factory);
};
