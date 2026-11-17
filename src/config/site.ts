import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Users2,
  Settings,
} from "lucide-react";
import type { MenuItem } from "../types/indes";

export const menuConfig: MenuItem[] = [
  {
    id: "dashboard",
    titleKey: "menu.dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    id: "trading",
    titleKey: "menu.trading",
    icon: ShoppingCart,
    subItems: [
      {
        id: "purchase",
        titleKey: "submenu.purchase",
        path: "/purchase",
      },
      { id: "sales", titleKey: "submenu.sales", path: "/sales" },
      {
        id: "settlement",
        titleKey: "submenu.settlement",
        path: "/settlement",
      },
      { id: "prices", titleKey: "submenu.prices", path: "/prices" },
    ],
  },
  {
    id: "inventory",
    titleKey: "menu.inventory",
    icon: Boxes,
    subItems: [
      { id: "stock", titleKey: "submenu.stock", path: "/stock" },
      {
        id: "milling",
        titleKey: "submenu.milling",
        path: "/milling",
      },
      { id: "loss", titleKey: "submenu.loss", path: "/adjustments" },
    ],
  },
  {
    id: "partners",
    titleKey: "menu.partners",
    icon: Users2,
    subItems: [
      {
        id: "partners-list",
        titleKey: "submenu.partnersList",
        path: "/partners",
      },
      {
        id: "advances",
        titleKey: "submenu.advances",
        path: "/advances",
      },
    ],
  },
  {
    id: "system",
    titleKey: "menu.system",
    path: "/settings",
    icon: Settings,
  },
];
