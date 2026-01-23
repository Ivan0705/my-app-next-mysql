"use client";

import { usePathname } from "next/navigation";
import { NavigationItem } from "../../model";
import cls from "./Navbar.module.css";
import { useNavigation } from "@/app/providers/navigator-provider";
import { NavItem } from "../NavItem/NavItem";

interface NavbarProps {
  items: NavigationItem[];
  orientation?: string;
  activeItem?: NavigationItem;
}

export const Navbar = (props: NavbarProps) => {
  const { items, getActiveItem } = useNavigation();
  const pathname = usePathname();

  return (
    <nav className={cls.Navbar}>
      <ul className={cls.Navbar_List}>
        {items.map((item:any) => (
          <NavItem key={item.href} item={item} />
        ))}
      </ul>
    </nav>
  );
};
