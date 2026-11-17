import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ShieldCheck, User, LogOut } from "lucide-react";

interface ProfileDropdownProps {
  onLogout?: () => void;
  onProfileClick?: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  onLogout,
  onProfileClick,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Click Outside Listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    if (confirm(t("user.confirmLogout"))) {
      if (onLogout) {
        onLogout();
      } else {
        alert("Logged out successfully");
      }
    }
    setIsOpen(false);
  };

  const handleProfile = () => {
    if (onProfileClick) {
      onProfileClick();
    } else {
      alert(t("user.profile"));
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={profileRef}>
      {/* Profile Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 p-1 pl-1.5 pr-3 rounded-full topnav-btn select-none cursor-pointer"
        aria-label="User profile menu"
      >
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
          alt={t("user.name")}
          className="h-8 w-8 rounded-full object-cover ring-1 ring-navbar-accent/30 shrink-0"
        />
        <div className="hidden sm:flex flex-col text-left leading-tight">
          <span className="text-xs font-bold text-navbar-title">
            {t("user.name")}
          </span>
          <span className="text-[10px] opacity-75">{t("user.role")}</span>
        </div>
        <ChevronDown
          size={15}
          className={`transition-transform duration-200 ml-0.5 opacity-70 ${
            isOpen ? "rotate-180 text-navbar-accent" : ""
          }`}
        />
      </button>

      {/* Profile Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-navbar-bg border border-navbar-border rounded-xl shadow-xl p-1 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* User Bio Header */}
          <div className="px-3.5 py-2.5 border-b border-navbar-border mb-1">
            <p className="text-xs font-bold text-navbar-title leading-tight">
              {t("user.name")}
            </p>
            <p className="text-[11px] opacity-75 truncate mt-0.5">
              aungkyaw@shwerspar.com
            </p>
            <div className="mt-1.5 flex items-center gap-1 text-[10px] text-navbar-accent font-semibold bg-navbar-hover-bg px-2 py-0.5 rounded-md w-fit">
              <ShieldCheck size={12} />
              <span>{t("user.branch")}</span>
            </div>
          </div>

          {/* Profile Item */}
          <button
            type="button"
            onClick={handleProfile}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg topnav-dropdown-item text-left cursor-pointer"
          >
            <User size={15} />
            <span>{t("user.profile")}</span>
          </button>

          <div className="h-px bg-navbar-border my-1" />

          {/* Logout Item */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium cursor-pointer"
          >
            <LogOut size={15} className="text-rose-500" />
            <span>{t("user.logout")}</span>
          </button>
        </div>
      )}
    </div>
  );
};
