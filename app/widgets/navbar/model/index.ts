import type { UrlObject } from "url";
type Url = string | UrlObject;

export type Link = {
  path: string;
  label: string;
};

export interface NavigationItem {
  label: string;
  href: Url;
  icon?: React.ReactNode | string;
  component?: React.ReactNode;
  badge?: number;
}

export enum OrientationEnum {
  HORIZONTAL = "horizontal",
  VERTICAL = "vertical",
}
