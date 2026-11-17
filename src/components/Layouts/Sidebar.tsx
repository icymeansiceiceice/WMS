import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { ChevronDown, X } from "lucide-react";
import { menuConfig } from "../../config/site";
import { useLocation, useNavigate } from "react-router";

// (၂) currentPath နှင့် onNavigate props တွေ မလိုတော့ပါ
interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (c: boolean | ((prev: boolean) => boolean)) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { t } = useTranslation();

  // (၃) URL လမ်းကြောင်းနှင့် Page ကူးပြောင်းရန် Hook များ ထည့်ပါ
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname; // URL ပေါ်မူတည်ပြီး Menu active ဖြစ်စေရန်

  const [openMenuId, setOpenMenuId] = useState<string | null>("trading");

  const toggleSubMenu = (menuId: string) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setOpenMenuId(menuId);
      return;
    }
    setOpenMenuId((prev) => (prev === menuId ? null : menuId));
  };

  // (၄) navigate(path) ဖြင့် Page အမှန်တကယ် ကူးပြောင်းပေးပါ
  const handleItemClick = (path: string, parentMenuId?: string) => {
    navigate(path); // <-- ဤနေရာတွင် navigate(path) ခေါ်ရပါမည်
    setIsMobileOpen(false);
    if (parentMenuId) {
      setOpenMenuId(parentMenuId);
    } else {
      setOpenMenuId(null);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
        />
      )}
      {/* Main Sidebar */}
      <aside
        className={`bg-sidebar fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-white/10 transition-all duration-300 ease-in-out select-none overflow-hidden will-change-[width,transform] w-72
          ${
            isMobileOpen
              ? "translate-x-0 shadow-2xl"
              : "-translate-x-full lg:translate-x-0"
          }
          ${isCollapsed ? "lg:w-20" : "lg:w-72"}
        `}
      >
        {/* ================= HEADER BRAND ================= */}
        <div
          style={{ backgroundColor: "var(--sidebar-header)" }}
          className={`h-16 flex items-center border-b border-white/10 shrink-0 transition-all duration-300 ease-in-out ${
            isCollapsed
              ? "lg:px-4.5 px-4 justify-between"
              : "px-4 justify-between"
          }`}
        >
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            <div className="h-10 w-10 min-w-10 rounded-xl bg-menu-active flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/30 shrink-0">
              A
            </div>
            <div
              className={`flex flex-col whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
                isCollapsed
                  ? "lg:opacity-0 lg:max-w-0 lg:pointer-events-none lg:-translate-x-4 opacity-100 max-w-[180px] translate-x-0"
                  : "opacity-100 max-w-[180px] translate-x-0"
              }`}
            >
              <span className="font-bold text-menu-default text-sm tracking-wide leading-tight truncate">
                {t("brand.title")}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-menu-default hover:text-menu-hover cursor-pointer shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* ================= NAVIGATION LIST ================= */}
        <nav
          className={`flex-1 overflow-y-auto py-3.5 space-y-2 sidebar-scrollbar overflow-x-hidden transition-all duration-300 ease-in-out ${
            isCollapsed ? "lg:px-4 px-3" : "px-3"
          }`}
        >
          {menuConfig.map((item) => {
            const Icon = item.icon;
            const hasSub = !!item.subItems && item.subItems.length > 0;
            const isSubOpen = openMenuId === item.id;
            const title = t(item.titleKey);

            const isDirectActive = Boolean(
              item.path && item.path === currentPath
            );
            const isChildActive = Boolean(
              item.subItems?.some((sub) => sub.path === currentPath)
            );

            const isMainButtonActive =
              isDirectActive || (isCollapsed && !isMobileOpen && isChildActive);

            return (
              <div key={item.id} className="relative group">
                {/* Main Menu Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (hasSub) toggleSubMenu(item.id);
                    else if (item.path) handleItemClick(item.path);
                  }}
                  title={isCollapsed ? title : undefined}
                  className={`menu-item rounded-full flex items-center h-11 w-full transition-all duration-300 ease-in-out cursor-pointer overflow-hidden ${
                    isCollapsed
                      ? "lg:px-2.5 px-3.5 lg:justify-start justify-between"
                      : "px-3.5 justify-between"
                  } ${isMainButtonActive ? "active" : ""}`}
                >
                  <div className="flex items-center gap-3 overflow-hidden min-w-0">
                    <div className="w-6 h-6 min-w-6 flex items-center justify-center shrink-0">
                      <Icon size={20} className="shrink-0" />
                    </div>
                    <span
                      className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out text-sm text-left ${
                        isCollapsed
                          ? "lg:opacity-0 lg:max-w-0 lg:pointer-events-none lg:-translate-x-3 opacity-100 max-w-[160px] translate-x-0"
                          : "opacity-100 max-w-[160px] translate-x-0"
                      }`}
                    >
                      {title}
                    </span>
                  </div>

                  {hasSub && (
                    <div
                      className={`shrink-0 overflow-hidden transition-all duration-300 ease-in-out flex items-center justify-center ${
                        isCollapsed
                          ? "lg:opacity-0 lg:max-w-0 lg:pointer-events-none opacity-100 max-w-[20px]"
                          : "opacity-100 max-w-[20px] ml-2"
                      }`}
                    >
                      <ChevronDown
                        size={15}
                        className={`transition-transform duration-300 text-menu-default ${
                          isSubOpen ? "rotate-180 text-menu-active-text" : ""
                        }`}
                      />
                    </div>
                  )}
                </button>

                {/* Submenu Accordion */}
                {hasSub && (
                  <div
                    className={`grid transition-all duration-300 ease-in-out ml-4 border-l border-white/10 ${
                      isSubOpen && (!isCollapsed || isMobileOpen)
                        ? "grid-rows-[1fr] opacity-100 mt-1.5"
                        : "grid-rows-[0fr] opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className="overflow-hidden pl-4 pr-1 space-y-1">
                      {item.subItems?.map((sub) => {
                        const isSubActive = sub.path === currentPath;
                        const subTitle = t(sub.titleKey);
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => handleItemClick(sub.path, item.id)}
                            className={`menu-item w-full text-left px-3.5 py-2 text-xs rounded-full transition-colors duration-150 cursor-pointer ${
                              isSubActive ? "active" : ""
                            }`}
                          >
                            <span className="truncate whitespace-nowrap block">
                              {subTitle}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Desktop Collapsed Tooltip */}
                {isCollapsed && (
                  <div className="hidden lg:group-hover:flex absolute left-full top-0 ml-3.5 z-50 bg-slate-900 border border-slate-700/80 rounded-2xl p-2 min-w-[190px] flex-col gap-1 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-xs font-semibold px-3 py-1 border-b border-white/10 whitespace-nowrap text-white">
                      {title}
                    </div>
                    {hasSub ? (
                      item.subItems?.map((sub) => {
                        const isSubActive = sub.path === currentPath;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleItemClick(sub.path, item.id)}
                            className={`menu-item w-full text-left text-xs px-2.5 py-1.5 rounded-full transition-colors cursor-pointer ${
                              isSubActive ? "active" : ""
                            }`}
                          >
                            {t(sub.titleKey)}
                          </button>
                        );
                      })
                    ) : (
                      <button
                        onClick={() => item.path && handleItemClick(item.path)}
                        className="menu-item text-left text-xs px-2.5 py-1.5 rounded-full cursor-pointer"
                      >
                        Open
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
