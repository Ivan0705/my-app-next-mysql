import { NavigationItem } from "@/app/widgets/navbar/model";

export const DEFAULT_NAV_ITEM: NavigationItem[] = [
  {
    label: "Дашборд",
    href:"/pages/dashboard",
    icon: "📊",
  },
  {
    label: "Пользователи",
    href: "/pages/users",
    icon: "👥",
  },
  {
    label: "Проекты",
    href: "/pages/projects",
    icon: "🚀",
  },
];
