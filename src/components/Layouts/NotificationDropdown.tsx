import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Bell, CheckCheck, Clock, ArrowRight } from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  isRead: boolean;
  type: "voucher" | "price" | "alert";
}

export const NotificationDropdown: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // နမူနာ ပွဲရုံ Notification စာရင်း
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "ဘောက်ချာအသစ် ထွက်ရှိသည်",
      desc: "ဦးအေးမောင် - စပါး တင်း ၅၀ (အဝယ်ဘောက်ချာ #V-8941)",
      time: "၁၀ မိနစ် အလို",
      isRead: false,
      type: "voucher",
    },
    {
      id: "2",
      title: "မတ်ပဲ ဈေးနှုန်း အပြောင်းအလဲ",
      desc: "ယနေ့ အဝယ်ဖွင့်ဈေး ၁၁၈,၀၀၀ ကျပ်သို့ တက်သွားပါသည်",
      time: "၄၅ မိနစ် အလို",
      isRead: false,
      type: "price",
    },
    {
      id: "3",
      title: "တောင်သူ အပ်ကုန် သတိပေးချက်",
      desc: "ဦးစိုးဝင်း အပ်ထားသော ပဲတီစိမ်း မျှော်မှန်းဈေးသို့ ရောက်ရှိပါပြီ",
      time: "၂ နာရီ အလို",
      isRead: true,
      type: "alert",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Click Outside Listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-10 w-10 rounded-full flex items-center justify-center topnav-btn relative cursor-pointer"
        title={t("navbar.notifications")}
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-navbar-badge rounded-full ring-1 ring-slate-200" />
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-navbar-bg border border-navbar-border rounded-2xl shadow-2xl p-0 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3 border-b border-navbar-border flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-navbar-title">
                {t("navbar.notifications")}
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white leading-none">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-navbar-accent hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck size={13} />
                အားလုံးဖတ်ပြီး
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-navbar-border">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs opacity-60">
                အကြောင်းကြားချက် မရှိသေးပါ
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 text-left transition-colors cursor-pointer hover:bg-navbar-hover-bg ${
                    !item.isRead ? "bg-blue-50/40" : ""
                  }`}
                  onClick={() => {
                    setNotifications((prev) =>
                      prev.map((n) =>
                        n.id === item.id ? { ...n, isRead: true } : n
                      )
                    );
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-xs ${
                        !item.isRead
                          ? "font-bold text-navbar-title"
                          : "font-medium opacity-80"
                      }`}
                    >
                      {item.title}
                    </p>
                    <span className="text-[10px] opacity-60 flex items-center gap-1 shrink-0">
                      <Clock size={10} />
                      {item.time}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-75 mt-1 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Footer View All */}
          <div className="p-2 border-t border-navbar-border text-center bg-slate-50/50">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full py-1.5 text-xs font-semibold text-navbar-accent hover:bg-navbar-hover-bg rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span>အကြောင်းကြားချက် အားလုံးကြည့်မည်</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
