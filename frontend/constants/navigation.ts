import {
  LayoutDashboard,
  Search,
  Package,
  Upload,
  ChartColumn,
  Monitor,
  Workflow,
  LucideIcon,
} from "lucide-react";

import { ROUTES } from "./routes";
export interface NavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;
}
export const navigation: NavigationItem[] = [  {
    title: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    title: "Search Playground",
    href: ROUTES.SEARCH,
    icon: Search,
  },
  {
    title: "Products",
    href: ROUTES.PRODUCTS,
    icon: Package,
  },
  {
    title: "Bulk Import",
    href: ROUTES.BULK_IMPORT,
    icon: Upload,
  },
  {
    title: "Analytics",
    href: ROUTES.ANALYTICS,
    icon: ChartColumn,
  },
  {
    title: "System Monitor",
    href: ROUTES.MONITOR,
    icon: Monitor,
  },
  {
    title: "Architecture",
    href: ROUTES.ARCHITECTURE,
    icon: Workflow,
  },
];