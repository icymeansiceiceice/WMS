import type { LucideIcon } from "lucide-react";

export interface SubMenuItem {
  id: string;
  titleKey: string;
  path: string;
}

export interface MenuItem {
  id: string;
  titleKey: string;
  path?: string;
  icon: LucideIcon;
  subItems?: SubMenuItem[];
}
