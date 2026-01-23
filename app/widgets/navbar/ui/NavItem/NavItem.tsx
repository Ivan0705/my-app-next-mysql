import Link from "next/link";
import { NavigationItem } from "../../model";
import { usePathname } from "next/navigation";
import cls from "./NavItem.module.css";

interface NavItemProps {
  item: NavigationItem;
}
export const NavItem = (props: NavItemProps) => {
  const { item } = props;

  const pathname = usePathname();
  const isActive = pathname === item.href;

  return (
    <li className={cls.NavItem}>
      <Link
        href={item.href}
        className={`${cls.NavItem_Link} ${
          isActive ? cls.NavItem_LinkActive : ""
        }`}
      >
        {item.icon && <span className={cls.NavItem_Icon}>{item.icon}</span>}
        {item.label}
      </Link>
    </li>
  );
};
