"use client";
import { usePathname } from "next/navigation";
import { useNavigation } from "../../../providers/navigator-provider";
import { Navbar } from "..";
import { OrientationEnum } from "../model";

export default function Navigation() {
  const pathname = usePathname();
  const { items, getActiveItem } = useNavigation();
  const activeItem = getActiveItem(pathname);

  return (
    <Navbar
      items={items}
      orientation={OrientationEnum.VERTICAL}
      activeItem={activeItem}
    />
  );
}
