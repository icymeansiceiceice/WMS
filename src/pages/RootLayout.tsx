import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Languages,
  ChevronDown,
} from "lucide-react";
import { Sidebar } from "../components/Layouts/Sidebar";
import { NotificationDropdown } from "../components/Layouts/NotificationDropdown";
import { ProfileDropdown } from "../components/Layouts/ProfileDropdown";
import { Outlet } from "react-router";

export function RootLayout() {
  const { t, i18n } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const changeLanguage = (lang: "my" | "en") => {
    i18n.changeLanguage(lang);
    setIsLangOpen(false);
  };

  // Language Dropdown Click Outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    if (isLangOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLangOpen]);

  return (
    <div className="min-h-screen bg-app text-slate-900 flex flex-col font-sans">
      {/* 1. SIDEBAR */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* 2. MAIN CONTENT WRAPPER */}
      <div
        className={`flex-1 flex flex-col transition-[padding] duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-20" : "lg:pl-72"
        }`}
      >
        {/* ================= TOP NAVBAR ================= */}
        <header className="h-14 bg-navbar-bg border-b border-navbar-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="lg:hidden p-2 rounded-full topnav-btn cursor-pointer"
            aria-label="Open mobile navigation"
          >
            <Menu size={22} />
          </button>

          {/* Desktop Mini-Sidebar Toggle */}
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="hidden lg:flex p-2 rounded-full topnav-btn cursor-pointer"
            title={
              isCollapsed ? t("navbar.openSidebar") : t("navbar.closeSidebar")
            }
            aria-label="Toggle Desktop Sidebar"
          >
            {isCollapsed ? (
              <PanelLeftOpen size={22} />
            ) : (
              <PanelLeftClose size={22} />
            )}
          </button>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Language Switcher */}
            <div className="relative" ref={langRef}>
              <button
                type="button"
                onClick={() => setIsLangOpen((prev) => !prev)}
                className="h-10 px-3 rounded-full flex items-center gap-1.5 text-xs font-semibold topnav-btn cursor-pointer"
                title="Change Language"
              >
                <Languages size={15} />
                <span className="font-bold tracking-wide">
                  {i18n.language === "my" ? "MM" : "EN"}
                </span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 opacity-70 ${
                    isLangOpen ? "rotate-180 text-navbar-accent" : ""
                  }`}
                />
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-28 bg-navbar-bg border border-navbar-border rounded-xl shadow-xl p-1 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={() => changeLanguage("my")}
                    className={`w-full mb-1 text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-between topnav-dropdown-item cursor-pointer ${
                      i18n.language === "my"
                        ? "text-navbar-accent font-bold bg-navbar-hover-bg"
                        : ""
                    }`}
                  >
                    <span>MM</span>
                    {i18n.language === "my" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-navbar-accent" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => changeLanguage("en")}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-between topnav-dropdown-item cursor-pointer ${
                      i18n.language === "en"
                        ? "text-navbar-accent font-bold bg-navbar-hover-bg"
                        : ""
                    }`}
                  >
                    <span>EN</span>
                    {i18n.language === "en" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-navbar-accent" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* 1. NOTIFICATIONS COMPONENT */}
            <NotificationDropdown />

            {/* Separator Divider */}
            <div className="h-7 w-px bg-navbar-border" />

            {/* 2. PROFILE COMPONENT */}
            <ProfileDropdown />
          </div>
        </header>

        {/* ================= WORKSPACE CONTENT ================= */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
