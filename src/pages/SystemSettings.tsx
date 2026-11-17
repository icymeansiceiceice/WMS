import React, { useState, useRef, useEffect } from "react";
import {
  Package,
  Warehouse as WarehouseIcon,
  History,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  User,
  Phone,
  MapPin,
  Sliders,
  TrendingUp,
  ArrowRight,
  Laptop,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

// ================= TYPES =================
interface Commodity {
  id: string;
  nameMm: string;
  nameEn: string;
  category: "beans" | "rice" | "oilseed";
  unit: string;
  stdWeightPerBag: number;
  defaultCommission: number;
  marketRate: number;
  priceChange?: number;
  isActive: boolean;
}

interface Warehouse {
  id: string;
  code: string;
  name: string;
  location: string;
  capacityBags: number;
  currentBags: number;
  riceBags: number;
  beansBags: number;
  supervisor: string;
  phone: string;
  status: "active" | "maintenance" | "full";
}

interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  module: "trading" | "inventory" | "settings" | "auth";
  details: string;
  oldValue?: string;
  newValue?: string;
  device: string;
  ip: string;
}

export const SystemSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "commodities" | "warehouses" | "audits"
  >("commodities");

  // ================= 1. COMMODITY DATA =================
  const [commodities, setCommodities] = useState<Commodity[]>([
    {
      id: "C-01",
      nameMm: "မတ်ပဲ (FAQ)",
      nameEn: "Black Gram (FAQ)",
      category: "beans",
      unit: "တင်း",
      stdWeightPerBag: 60,
      defaultCommission: 2.5,
      marketRate: 118000,
      priceChange: 3000,
      isActive: true,
    },
    {
      id: "C-02",
      nameMm: "ရွှေဘို ပေါ်ဆန်း (စပါး)",
      nameEn: "Shwebo Pawsan Paddy",
      category: "rice",
      unit: "တင်း",
      stdWeightPerBag: 46,
      defaultCommission: 2.0,
      marketRate: 145000,
      priceChange: 0,
      isActive: true,
    },
    {
      id: "C-03",
      nameMm: "ပဲတီစိမ်း (ရွှေဝါ)",
      nameEn: "Green Gram (Special)",
      category: "beans",
      unit: "တင်း",
      stdWeightPerBag: 56,
      defaultCommission: 2.5,
      marketRate: 98000,
      priceChange: -1500,
      isActive: true,
    },
    {
      id: "C-04",
      nameMm: "ဧည့်မထ (ဆန် ၅၀ ကီလို)",
      nameEn: "Emata Milled Rice",
      category: "rice",
      unit: "အိတ်",
      stdWeightPerBag: 108,
      defaultCommission: 2.0,
      marketRate: 85000,
      priceChange: 1000,
      isActive: true,
    },
    {
      id: "C-05",
      nameMm: "ကုလားပဲ (V2)",
      nameEn: "Chickpea (V2)",
      category: "beans",
      unit: "တင်း",
      stdWeightPerBag: 58,
      defaultCommission: 2.5,
      marketRate: 105000,
      priceChange: 0,
      isActive: true,
    },
    {
      id: "C-06",
      nameMm: "နှမ်းနက် (စမုံနက်)",
      nameEn: "Black Sesame",
      category: "oilseed",
      unit: "ပိဿာ",
      stdWeightPerBag: 45,
      defaultCommission: 3.0,
      marketRate: 340000,
      priceChange: 5000,
      isActive: false,
    },
  ]);

  const [commoditySearch, setCommoditySearch] = useState("");
  const [commodityCategoryFilter, setCommodityCategoryFilter] = useState("all");
  const [isCommodityFilterOpen, setIsCommodityFilterOpen] = useState(false);
  const commodityFilterRef = useRef<HTMLDivElement>(null);

  const [isAddCommodityOpen, setIsAddCommodityOpen] = useState(false);
  const [newCommodity, setNewCommodity] = useState<Partial<Commodity>>({
    nameMm: "",
    nameEn: "",
    category: "beans",
    unit: "တင်း",
    stdWeightPerBag: 60,
    defaultCommission: 2.5,
    marketRate: 100000,
    isActive: true,
  });

  // ================= 2. WAREHOUSE DATA =================
  const [warehouses, setWarehouses] = useState<Warehouse[]>([
    {
      id: "WH-01",
      code: "BAY-1",
      name: "ဗဟို စပါးနှင့် ဆန်သိုလှောင်ရုံ",
      location: "ကုန်စည်ဒိုင်လမ်းမကြီး၊ အကွက် (က-၁)",
      capacityBags: 20000,
      currentBags: 15400,
      riceBags: 11000,
      beansBags: 4400,
      supervisor: "ဦးကျော်စွာ",
      phone: "09-420011223",
      status: "active",
    },
    {
      id: "WH-02",
      code: "BAY-2",
      name: "ပဲမျိုးစုံ အထူးသိုလှောင်ရုံ",
      location: "ဒုတိယရုံတန်း၊ အကွက် (ခ-၃)",
      capacityBags: 15000,
      currentBags: 13800,
      riceBags: 2000,
      beansBags: 11800,
      supervisor: "ဦးသန်းနိုင်",
      phone: "09-250033445",
      status: "active",
    },
    {
      id: "WH-03",
      code: "BAY-3",
      name: "တောင်သူ အပ်ကုန် သီးသန့်ဂိုဒေါင်",
      location: "အနောက်ဘက် ခြံဝင်းအတွင်း",
      capacityBags: 12000,
      currentBags: 11750,
      riceBags: 4000,
      beansBags: 7750,
      supervisor: "ကိုမင်းခန့်",
      phone: "09-790088990",
      status: "full",
    },
    {
      id: "WH-04",
      code: "BAY-4",
      name: "နေလှန်းကွင်း အရန်သိုလှောင်ရုံ",
      location: "နေလှန်းကွင်း မြောက်ဘက်ခြမ်း",
      capacityBags: 8000,
      currentBags: 2400,
      riceBags: 1200,
      beansBags: 1200,
      supervisor: "ဦးဝင်းမောင်",
      phone: "09-450077661",
      status: "maintenance",
    },
  ]);

  const [isAddWarehouseOpen, setIsAddWarehouseOpen] = useState(false);
  const [newWarehouse, setNewWarehouse] = useState<Partial<Warehouse>>({
    code: "",
    name: "",
    location: "",
    capacityBags: 10000,
    supervisor: "",
    phone: "",
    status: "active",
  });

  // ================= 3. AUDIT LOGS DATA =================
  const [auditLogs] = useState<AuditLog[]>([
    {
      id: "LOG-1095",
      timestamp: "၁၀ မိနစ် အလို (၁၀:၄၅ AM)",
      userName: "ဒေါ်ခင်စန်းဝေ",
      userRole: "စာရင်းကိုင်မှူး",
      action: "ယနေ့ပေါက်ဈေး ပြင်ဆင်ခြင်း",
      module: "settings",
      details:
        "မတ်ပဲ (FAQ) ဖွင့်ဈေးနှုန်းအား ပွဲရုံဘုတ်တွင် ပြင်ဆင်သတ်မှတ်ခဲ့သည်",
      oldValue: "၁၁၅,၀၀၀ ကျပ်",
      newValue: "၁၁၈,၀၀၀ ကျပ်",
      device: "Windows 11 / Chrome",
      ip: "192.168.1.15",
    },
    {
      id: "LOG-1094",
      timestamp: "၁ နာရီ အလို (၀၉:၂၀ AM)",
      userName: "ဦးအောင်ကျော်",
      userRole: "မန်နေဂျာ",
      action: "အဝယ်ဘောက်ချာ အတည်ပြုခြင်း",
      module: "trading",
      details:
        "ဘောက်ချာ #V-8941 (ဦးအေးမောင် - စပါးတင်း ၅၀) လက်ငင်းငွေချေမှု အတည်ပြုပြီး",
      oldValue: "စစ်ဆေးဆဲ",
      newValue: "အတည်ပြုပြီး (Paid)",
      device: "iPhone 15 Pro / Safari",
      ip: "192.168.1.42",
    },
    {
      id: "LOG-1093",
      timestamp: "၂ နာရီ အလို (၀၈:၁၀ AM)",
      userName: "ဦးကျော်စွာ",
      userRole: "ဂိုဒေါင်မှူး (ရုံ-၁)",
      action: "ဂိုဒေါင် ကုန်လွှဲပြောင်းခြင်း",
      module: "inventory",
      details:
        "ရုံ-၁ မှ ရုံ-၃ သို့ ဆန်အိတ် ၂၀၀ ကားခေါင်း (၃ခ/၉၉၂၁) ဖြင့် လွှဲပြောင်းသိမ်းဆည်း",
      device: "iPad Air / Safari",
      ip: "192.168.1.88",
    },
    {
      id: "LOG-1092",
      timestamp: "မနေ့က ၀၄:၁၅ PM",
      userName: "ကိုမင်းခန့်",
      userRole: "ဂိုဒေါင်မှူး (ရုံ-၃)",
      action: "အပ်ကုန်လက်ခံလွှာ ထုတ်ပေးခြင်း",
      module: "inventory",
      details: "တောင်သူ ဦးဘကြည် (မတ်ပဲ တင်း ၁၀၀) ဈေးစောင့်အပ်ကုန် လက်ခံပြီး",
      device: "Windows 10 / Firefox",
      ip: "192.168.1.33",
    },
    {
      id: "LOG-1091",
      timestamp: "မနေ့က ၀၂:၀၀ PM",
      userName: "ဒေါ်ခင်စန်းဝေ",
      userRole: "စာရင်းကိုင်မှူး",
      action: "စနစ်သို့ Login ဝင်ရောက်ခြင်း",
      module: "auth",
      details:
        "လုံခြုံရေး အဆင့် ၂ စစ်ဆေးချက်ဖြင့် အောင်မြင်စွာ စနစ်ဝင်ရောက်ခဲ့သည်",
      device: "Windows 11 / Chrome",
      ip: "192.168.1.15",
    },
  ]);

  const [auditSearch, setAuditSearch] = useState("");
  const [auditModuleFilter, setAuditModuleFilter] = useState("all");
  const [isAuditFilterOpen, setIsAuditFilterOpen] = useState(false);
  const auditFilterRef = useRef<HTMLDivElement>(null);

  // Click Outside Listeners
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        commodityFilterRef.current &&
        !commodityFilterRef.current.contains(e.target as Node)
      ) {
        setIsCommodityFilterOpen(false);
      }
      if (
        auditFilterRef.current &&
        !auditFilterRef.current.contains(e.target as Node)
      ) {
        setIsAuditFilterOpen(false);
      }
    };
    if (isCommodityFilterOpen || isAuditFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCommodityFilterOpen, isAuditFilterOpen]);

  // Computed Values
  const totalCapacity = warehouses.reduce((acc, w) => acc + w.capacityBags, 0);
  const totalOccupied = warehouses.reduce((acc, w) => acc + w.currentBags, 0);
  const totalAvailable = totalCapacity - totalOccupied;
  const totalPercentage = Math.round((totalOccupied / totalCapacity) * 100);

  // Filter Categories
  const commodityCategories = [
    {
      id: "all",
      label: "သီးနှံ အားလုံး",
      count: commodities.length,
      color: "bg-slate-400",
    },
    {
      id: "beans",
      label: "ပဲမျိုးစုံ",
      count: commodities.filter((c) => c.category === "beans").length,
      color: "bg-emerald-500",
    },
    {
      id: "rice",
      label: "ဆန် / စပါး",
      count: commodities.filter((c) => c.category === "rice").length,
      color: "bg-amber-500",
    },
    {
      id: "oilseed",
      label: "ဆီထွက်သီးနှံ",
      count: commodities.filter((c) => c.category === "oilseed").length,
      color: "bg-sky-500",
    },
  ];

  const selectedCommodityCategory =
    commodityCategories.find((c) => c.id === commodityCategoryFilter) ||
    commodityCategories[0];

  const auditModules = [
    { id: "all", label: "ဌာန အားလုံး", count: auditLogs.length },
    {
      id: "trading",
      label: "အရောင်းအဝယ်",
      count: auditLogs.filter((l) => l.module === "trading").length,
    },
    {
      id: "inventory",
      label: "ဂိုဒေါင်/ကုန်စည်",
      count: auditLogs.filter((l) => l.module === "inventory").length,
    },
    {
      id: "settings",
      label: "စနစ်သတ်မှတ်ချက်",
      count: auditLogs.filter((l) => l.module === "settings").length,
    },
  ];

  const selectedAuditModule =
    auditModules.find((m) => m.id === auditModuleFilter) || auditModules[0];

  // Handlers
  const handleAddCommodity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommodity.nameMm) return;

    const item: Commodity = {
      id: `C-0${commodities.length + 1}`,
      nameMm: newCommodity.nameMm || "",
      nameEn: newCommodity.nameEn || "",
      category: (newCommodity.category as any) || "beans",
      unit: newCommodity.unit || "တင်း",
      stdWeightPerBag: Number(newCommodity.stdWeightPerBag) || 60,
      defaultCommission: Number(newCommodity.defaultCommission) || 2.5,
      marketRate: Number(newCommodity.marketRate) || 100000,
      priceChange: 0,
      isActive: true,
    };

    setCommodities([item, ...commodities]);
    setIsAddCommodityOpen(false);
    setNewCommodity({
      nameMm: "",
      nameEn: "",
      category: "beans",
      unit: "တင်း",
      stdWeightPerBag: 60,
      defaultCommission: 2.5,
      marketRate: 100000,
      isActive: true,
    });
  };

  const handleAddWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWarehouse.name) return;

    const item: Warehouse = {
      id: `WH-0${warehouses.length + 1}`,
      code: newWarehouse.code || `BAY-${warehouses.length + 1}`,
      name: newWarehouse.name || "",
      location: newWarehouse.location || "ပွဲရုံဝင်းအတွင်း",
      capacityBags: Number(newWarehouse.capacityBags) || 10000,
      currentBags: 0,
      riceBags: 0,
      beansBags: 0,
      supervisor: newWarehouse.supervisor || "တာဝန်ခံ မသတ်မှတ်ရသေး",
      phone: newWarehouse.phone || "-",
      status: "active",
    };

    setWarehouses([...warehouses, item]);
    setIsAddWarehouseOpen(false);
    setNewWarehouse({
      code: "",
      name: "",
      location: "",
      capacityBags: 10000,
      supervisor: "",
      phone: "",
      status: "active",
    });
  };

  // Filtered Lists
  const filteredCommodities = commodities.filter((item) => {
    const matchesSearch =
      item.nameMm.toLowerCase().includes(commoditySearch.toLowerCase()) ||
      item.nameEn.toLowerCase().includes(commoditySearch.toLowerCase());
    const matchesCategory =
      commodityCategoryFilter === "all" ||
      item.category === commodityCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredAudits = auditLogs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(auditSearch.toLowerCase());
    const matchesModule =
      auditModuleFilter === "all" || log.module === auditModuleFilter;
    return matchesSearch && matchesModule;
  });

  return (
    <div className="space-y-4 sm:space-y-6 select-none pb-3">
      {/* ================= 1. GREETING & HEADER ================= */}
      <div className="relative overflow-hidden py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">
          ပွဲရုံ အခြေခံ စနစ်သတ်မှတ်ချက်များ
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 sm:mt-3 max-w-xl leading-relaxed">
          အရောင်းအဝယ်ပြုလုပ်မည့် သီးနှံပေါက်ဈေးနှင့် ပွဲခများ၊ ဂိုဒေါင်
          သိုလှောင်ရုံများနှင့် ဝန်ထမ်းများ၏ လှုပ်ရှားမှု စနစ်မှတ်တမ်းများ
        </p>
      </div>

      {/* ================= 2. MOBILE & TABLET SEGMENTED CONTROL (Apple Style) ================= */}
      {/* 💡 Mobile / Tablet မျက်နှာပြင်တွင် ကတ်အကြီးကြီး မဟုတ်တော့ဘဲ အညီအမျှခွဲထားသော Pill Control အဖြစ် ဖော်ပြပါမည် */}
      {/* 💡 Scroll Bar လုံးဝ မပေါ်ဘဲ ချောမွေ့စွာ ပွတ်ဆွဲနိုင်သော နည်းလမ်း */}
      <div className="lg:hidden flex items-center gap-1.5 p-1  overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]  mb-10">
        {/* Tab 1: သီးနှံများ */}
        <button
          type="button"
          onClick={() => setActiveTab("commodities")}
          className={`flex items-center gap-1.5 py-2 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === "commodities"
              ? "bg-btn-color text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Package size={15} />
          <span>သီးနှံများ</span>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              activeTab === "commodities"
                ? "bg-white/20 text-white"
                : "bg-slate-200/80 text-slate-600"
            }`}
          >
            {commodities.length}
          </span>
        </button>

        {/* Tab 2: ဂိုဒေါင် */}
        <button
          type="button"
          onClick={() => setActiveTab("warehouses")}
          className={`flex items-center gap-1.5 py-2 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === "warehouses"
              ? "bg-btn-color text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <WarehouseIcon size={15} />
          <span>ဂိုဒေါင်</span>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              activeTab === "warehouses"
                ? "bg-white/20 text-white"
                : "bg-slate-200/80 text-slate-600"
            }`}
          >
            {warehouses.length}
          </span>
        </button>

        {/* Tab 3: မှတ်တမ်း */}
        <button
          type="button"
          onClick={() => setActiveTab("audits")}
          className={`flex items-center gap-1.5 py-2 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === "audits"
              ? "bg-btn-color text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <History size={15} />
          <span>မှတ်တမ်း</span>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              activeTab === "audits"
                ? "bg-white/20 text-white"
                : "bg-slate-200/80 text-slate-600"
            }`}
          >
            {auditLogs.length}
          </span>
        </button>

        {/* Tab 4: အသစ်တိုးလာမည့် Tab (ဥပမာ - စနစ်သတ်မှတ်ချက်) */}
        <button
          type="button"
          onClick={() => setActiveTab("general" as any)}
          className={`flex items-center gap-1.5 py-2 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            (activeTab as any) === "general"
              ? "bg-btn-color text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Sliders size={15} />
          <span>အထွေထွေ</span>
        </button>
      </div>

      {/* ================= 3. MAIN WORKSPACE LAYOUT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* DESKTOP EXCLUSIVE LEFT NAV PANEL (Desktop တွင်သာ ပေါ်မည်) */}
        <div className="hidden lg:block lg:col-span-3 bg-card rounded-3xl p-3 border border-slate-200/80 shadow-xs sticky top-20 space-y-3">
          <nav className="space-y-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("commodities")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-full text-left transition-all cursor-pointer ${
                activeTab === "commodities"
                  ? "bg-btn-color text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Package size={17} className="shrink-0" />
                <span className="text-xs font-bold truncate">
                  သီးနှံ/ကုန်ပစ္စည်းများ
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                  activeTab === "commodities"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {commodities.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("warehouses")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-full text-left transition-all cursor-pointer ${
                activeTab === "warehouses"
                  ? "bg-btn-color text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <WarehouseIcon size={17} className="shrink-0" />
                <span className="text-xs font-bold truncate">
                  ဂိုဒေါင်နှင့် သိုလှောင်ရုံ
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                  activeTab === "warehouses"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {warehouses.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("audits")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-full text-left transition-all cursor-pointer ${
                activeTab === "audits"
                  ? "bg-btn-color text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <History size={17} className="shrink-0" />
                <span className="text-xs font-bold truncate">
                  စနစ်မှတ်တမ်း (Audits)
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                  activeTab === "audits"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {auditLogs.length}
              </span>
            </button>
          </nav>
        </div>

        {/* RIGHT CONTENT CANVAS (Mobile/Tablet တွင် Full-Width, Desktop တွင် 9 Cols) */}
        <div className="w-full lg:col-span-9 space-y-4">
          {/* ================= TAB 1: COMMODITIES ================= */}
          {activeTab === "commodities" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Search + Dropdown Filter + Create Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 sm:p-4 rounded-3xl border border-slate-200/80 shadow-xs">
                <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  {/* Search Bar */}
                  <div className="relative flex-1">
                    <Search
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      placeholder="သီးနှံအမည်ဖြင့် ရှာရန်..."
                      value={commoditySearch}
                      onChange={(e) => setCommoditySearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#547a95] transition-all"
                    />
                  </div>

                  {/* Option 1 Dropdown Filter Popover */}
                  <div className="relative shrink-0" ref={commodityFilterRef}>
                    <button
                      type="button"
                      onClick={() => setIsCommodityFilterOpen((prev) => !prev)}
                      className="h-9 px-3.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-xs font-bold text-slate-700 flex items-center justify-between gap-2 cursor-pointer transition-all shadow-2xs w-full sm:w-auto"
                    >
                      <div className="flex items-center gap-2">
                        <Sliders size={13} className="text-slate-500" />
                        <span className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${selectedCommodityCategory.color}`}
                          />
                          <span>{selectedCommodityCategory.label}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 ml-1">
                        <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono font-bold leading-none">
                          {selectedCommodityCategory.count}
                        </span>
                        <ChevronDown
                          size={13}
                          className={`text-slate-400 transition-transform duration-200 ${
                            isCommodityFilterOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {/* Dropdown Menu */}
                    {isCommodityFilterOpen && (
                      <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          အမျိုးအစား ရွေးချယ်ပါ
                        </div>
                        {commodityCategories.map((cat) => {
                          const isSelected = commodityCategoryFilter === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                setCommodityCategoryFilter(cat.id);
                                setIsCommodityFilterOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer text-left ${
                                isSelected
                                  ? "bg-btn-color text-white"
                                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-2 h-2 rounded-full ${cat.color}`}
                                />
                                <span>{cat.label}</span>
                              </div>
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                                  isSelected
                                    ? "bg-white/20 text-white"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {cat.count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Create Button */}
                <button
                  type="button"
                  onClick={() => setIsAddCommodityOpen(true)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 text-xs text-white bg-btn-color hover:bg-btn-hover active:scale-95 rounded-full shadow-sm transition cursor-pointer shrink-0"
                >
                  <Plus size={16} />
                  <span>သီးနှံအသစ် သတ်မှတ်မည်</span>
                </button>
              </div>

              {/* Commodities Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                {filteredCommodities.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-card rounded-3xl p-4 sm:p-5 border transition-all duration-200 flex flex-col justify-between ${
                      item.isActive
                        ? "border-slate-200/80 shadow-xs hover:border-slate-300"
                        : "border-slate-200/50 bg-slate-50/50 opacity-70"
                    }`}
                  >
                    <div>
                      {/* Top Header & Toggle */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border ${
                              item.category === "beans"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200/70"
                                : item.category === "rice"
                                ? "bg-amber-50 text-amber-700 border-amber-200/70"
                                : "bg-sky-50 text-sky-700 border-sky-200/70"
                            }`}
                          >
                            {item.nameMm.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-sm font-bold text-slate-800 leading-tight">
                                {item.nameMm}
                              </h3>
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                {item.id}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                              {item.nameEn}
                            </p>
                          </div>
                        </div>

                        {/* Switch */}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.isActive}
                            onChange={() => {
                              setCommodities((prev) =>
                                prev.map((c) =>
                                  c.id === item.id
                                    ? { ...c, isActive: !c.isActive }
                                    : c
                                )
                              );
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      {/* Specs Matrix */}
                      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100">
                        <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100/80">
                          <span className="text-[10px] text-slate-400 font-semibold block">
                            စံအလေးချိန်
                          </span>
                          <span className="text-xs font-bold text-slate-800 mt-0.5 block font-mono">
                            {item.stdWeightPerBag} ပေါင်
                          </span>
                        </div>

                        <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100/80">
                          <span className="text-[10px] text-slate-400 font-semibold block">
                            ပွဲခ နှုန်း
                          </span>
                          <span className="text-xs font-bold text-slate-800 mt-0.5 block font-mono">
                            {item.defaultCommission}%
                          </span>
                        </div>

                        <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100/80">
                          <span className="text-[10px] text-slate-400 font-semibold block">
                            ယူနစ်
                          </span>
                          <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                            ၁ {item.unit}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Live Rate Strip */}
                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-slate-500">ပေါက်ဈေး:</span>
                        <span className="font-extrabold text-slate-800 font-mono">
                          {item.marketRate.toLocaleString()} ကျပ်
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="ပြင်ဆင်မည်"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              confirm(
                                `${item.nameMm} အား စာရင်းမှ ဖျက်ပစ်ရန် သေချာပါသလား?`
                              )
                            ) {
                              setCommodities((prev) =>
                                prev.filter((c) => c.id !== item.id)
                              );
                            }
                          }}
                          className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="ဖျက်မည်"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 2: WAREHOUSES ================= */}
          {activeTab === "warehouses" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Header Action Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3.5 sm:p-4 rounded-3xl border border-slate-200/80 shadow-xs">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    ဂိုဒေါင် သိုလှောင်နိုင်မှု ဇယား
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    စုစုပေါင်း နေရာလွတ်{" "}
                    <span className="font-bold text-slate-800 font-mono">
                      {totalAvailable.toLocaleString()}
                    </span>{" "}
                    အိတ် ကျန်ရှိပါသည်
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddWarehouseOpen(true)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 text-xs text-white bg-btn-color hover:bg-btn-hover active:scale-95 rounded-full shadow-sm transition cursor-pointer shrink-0"
                >
                  <Plus size={16} />
                  <span>ဂိုဒေါင်အသစ် ထည့်မည်</span>
                </button>
              </div>

              {/* Warehouse Bays Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                {warehouses.map((wh) => {
                  const percentage = Math.round(
                    (wh.currentBags / wh.capacityBags) * 100
                  );
                  const ricePercent = Math.round(
                    (wh.riceBags / wh.capacityBags) * 100
                  );
                  const beansPercent = Math.round(
                    (wh.beansBags / wh.capacityBags) * 100
                  );

                  return (
                    <div
                      key={wh.id}
                      className="bg-card rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Bay Code Badge & Name */}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold font-mono">
                                {wh.code}
                              </span>
                              <h3 className="text-sm font-extrabold text-slate-800 leading-tight">
                                {wh.name}
                              </h3>
                            </div>
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                              <MapPin size={12} />
                              <span>{wh.location}</span>
                            </p>
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                              wh.status === "active"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                : wh.status === "full"
                                ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                                : "bg-amber-50 text-amber-700 border border-amber-200/60"
                            }`}
                          >
                            {wh.status === "active"
                              ? "လက်ခံဆဲ"
                              : wh.status === "full"
                              ? "နေရာပြည့်"
                              : "ပြင်ဆင်ဆဲ"}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-5 pt-4 border-t border-slate-100">
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-bold text-slate-700">
                              သိုလှောင်မှု အခြေအနေ
                            </span>
                            <span className="font-extrabold text-slate-800 font-mono">
                              {wh.currentBags.toLocaleString()} /{" "}
                              {wh.capacityBags.toLocaleString()} အိတ် (
                              {percentage}%)
                            </span>
                          </div>

                          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                            <div
                              style={{ width: `${ricePercent}%` }}
                              title={`ဆန်/စပါး: ${wh.riceBags} အိတ်`}
                              className="h-full bg-amber-500 transition-all duration-500"
                            />
                            <div
                              style={{ width: `${beansPercent}%` }}
                              title={`ပဲမျိုးစုံ: ${wh.beansBags} အိတ်`}
                              className="h-full bg-emerald-500 transition-all duration-500"
                            />
                          </div>

                          {/* Legend Indicators */}
                          <div className="flex items-center justify-between text-[11px] mt-2.5 text-slate-500">
                            <div className="flex items-center gap-2.5">
                              <span className="flex items-center gap-1 font-medium">
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                <span>
                                  စပါး ({wh.riceBags.toLocaleString()})
                                </span>
                              </span>
                              <span className="flex items-center gap-1 font-medium">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span>
                                  ပဲ ({wh.beansBags.toLocaleString()})
                                </span>
                              </span>
                            </div>
                            <span className="font-semibold text-slate-700">
                              လွတ်{" "}
                              {(
                                wh.capacityBags - wh.currentBags
                              ).toLocaleString()}{" "}
                              အိတ်
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Supervisor Contact Bar */}
                      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                            <User size={14} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 leading-tight">
                              {wh.supervisor}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {wh.phone}
                            </p>
                          </div>
                        </div>

                        <a
                          href={`tel:${wh.phone}`}
                          className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Phone size={12} />
                          <span>ဖုန်းခေါ်မည်</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TAB 3: AUDIT LOGS ================= */}
          {activeTab === "audits" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Filter Strip */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-card p-3 sm:p-3.5 rounded-3xl border border-slate-200/80 shadow-xs">
                <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1">
                    <Search
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      placeholder="ဝန်ထမ်းအမည် (သို့) ပြုလုပ်ချက်ဖြင့် ရှာပါ..."
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#547a95] transition-all"
                    />
                  </div>

                  {/* Audit Dropdown Filter */}
                  <div className="relative shrink-0" ref={auditFilterRef}>
                    <button
                      type="button"
                      onClick={() => setIsAuditFilterOpen((prev) => !prev)}
                      className="h-9 px-3.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-xs font-bold text-slate-700 flex items-center justify-between gap-2 cursor-pointer transition-all shadow-2xs w-full sm:w-auto"
                    >
                      <div className="flex items-center gap-2">
                        <Sliders size={13} className="text-slate-500" />
                        <span>{selectedAuditModule.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 ml-1">
                        <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono font-bold leading-none">
                          {selectedAuditModule.count}
                        </span>
                        <ChevronDown
                          size={13}
                          className={`text-slate-400 transition-transform duration-200 ${
                            isAuditFilterOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {isAuditFilterOpen && (
                      <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          ဌာန / ကဏ္ဍ
                        </div>
                        {auditModules.map((m) => {
                          const isSelected = auditModuleFilter === m.id;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                setAuditModuleFilter(m.id);
                                setIsAuditFilterOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer text-left ${
                                isSelected
                                  ? "bg-btn-color text-white"
                                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                              }`}
                            >
                              <span>{m.label}</span>
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                                  isSelected
                                    ? "bg-white/20 text-white"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {m.count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-500 font-semibold px-2 py-1">
                  မှတ်တမ်း{" "}
                  <span className="font-bold text-slate-800">
                    {filteredAudits.length}
                  </span>{" "}
                  ခု
                </div>
              </div>

              {/* Timeline Container */}
              <div className="bg-card rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs">
                <div className="space-y-6 relative before:absolute before:inset-0 before:left-4.5 before:w-0.5 before:bg-slate-100">
                  {filteredAudits.map((log) => (
                    <div
                      key={log.id}
                      className="relative flex items-start gap-4"
                    >
                      {/* Timeline Node */}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 font-bold shadow-xs ${
                          log.module === "trading"
                            ? "bg-emerald-500 text-white ring-4 ring-emerald-50"
                            : log.module === "settings"
                            ? "bg-blue-500 text-white ring-4 ring-blue-50"
                            : log.module === "inventory"
                            ? "bg-amber-500 text-white ring-4 ring-amber-50"
                            : "bg-purple-500 text-white ring-4 ring-purple-50"
                        }`}
                      >
                        {log.module === "trading" ? (
                          <TrendingUp size={15} />
                        ) : log.module === "settings" ? (
                          <Sliders size={15} />
                        ) : log.module === "inventory" ? (
                          <WarehouseIcon size={15} />
                        ) : (
                          <ShieldCheck size={15} />
                        )}
                      </div>

                      {/* Content Card */}
                      <div className="flex-1 bg-slate-50/70 hover:bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-800">
                              {log.userName}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400">
                              ({log.userRole})
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-400 font-mono">
                            {log.timestamp}
                          </span>
                        </div>

                        <p className="text-xs font-bold text-slate-800 mt-1">
                          {log.action}
                        </p>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {log.details}
                        </p>

                        {/* Value Diff Badges */}
                        {log.oldValue && log.newValue && (
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/60 text-xs">
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-mono text-[11px] line-through">
                              {log.oldValue}
                            </span>
                            <ArrowRight size={13} className="text-slate-400" />
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[11px] font-bold">
                              {log.newValue}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400 pt-2 border-t border-slate-200/60 font-mono">
                          <span className="flex items-center gap-1">
                            <Laptop size={11} />
                            {log.device}
                          </span>
                          <span>IP: {log.ip}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL: ADD COMMODITY ================= */}
      {isAddCommodityOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-card w-full max-w-lg rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xl max-h-[92vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-btn-color text-white flex items-center justify-center font-bold">
                  <Package size={17} />
                </div>
                <h3 className="font-bold text-slate-800 text-base">
                  သီးနှံ/ကုန်ပစ္စည်းအသစ် ထည့်သွင်းခြင်း
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCommodityOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleAddCommodity}
              className="mt-4 space-y-3.5 text-xs font-semibold"
            >
              {/* သီးနှံအမည် (မြန်မာ & English) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    သီးနှံ အမည် (မြန်မာ)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ဥပမာ - မတ်ပဲ (FAQ)"
                    value={newCommodity.nameMm}
                    onChange={(e) =>
                      setNewCommodity({
                        ...newCommodity,
                        nameMm: e.target.value,
                      })
                    }
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    သီးနှံ အမည် (English)
                  </label>
                  <input
                    type="text"
                    placeholder="ဥပမာ - Black Gram"
                    value={newCommodity.nameEn}
                    onChange={(e) =>
                      setNewCommodity({
                        ...newCommodity,
                        nameEn: e.target.value,
                      })
                    }
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* အမျိုးအစား အုပ်စု & ယူနစ် */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    အမျိုးအစား အုပ်စု
                  </label>
                  <select
                    value={newCommodity.category}
                    onChange={(e) =>
                      setNewCommodity({
                        ...newCommodity,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="beans">ပဲမျိုးစုံ</option>
                    <option value="rice">ဆန် / စပါး</option>
                    <option value="oilseed">ဆီထွက်သီးနှံ (နှမ်း/မြေပဲ)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    အရောင်းအဝယ် ယူနစ်
                  </label>
                  <select
                    value={newCommodity.unit}
                    onChange={(e) =>
                      setNewCommodity({ ...newCommodity, unit: e.target.value })
                    }
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="တင်း">တင်း</option>
                    <option value="အိတ်">အိတ်</option>
                    <option value="ပိဿာ">ပိဿာ</option>
                    <option value="တန်">တန်</option>
                  </select>
                </div>
              </div>

              {/* ၁ အိတ် စံအလေးချိန် & ပုံသေ ပွဲခ ရာခိုင်နှုန်း */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ၁ အိတ် စံအလေးချိန် (ပေါင်)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newCommodity.stdWeightPerBag}
                    onChange={(e) =>
                      setNewCommodity({
                        ...newCommodity,
                        stdWeightPerBag: Number(e.target.value),
                      })
                    }
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ပုံသေ ပွဲခ ရာခိုင်နှုန်း (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={newCommodity.defaultCommission}
                    onChange={(e) =>
                      setNewCommodity({
                        ...newCommodity,
                        defaultCommission: Number(e.target.value),
                      })
                    }
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCommodityOpen(false)}
                  className="w-full sm:w-auto px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer text-center"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2 text-xs font-bold text-white bg-btn-color hover:bg-btn-hover rounded-full shadow-sm cursor-pointer text-center"
                >
                  သီးနှံအသစ် သိမ်းမည်
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD WAREHOUSE ================= */}
      {isAddWarehouseOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-card w-full max-w-lg rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xl max-h-[92vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-btn-color text-white flex items-center justify-center font-bold">
                  <WarehouseIcon size={17} />
                </div>
                <h3 className="font-bold text-slate-800 text-base">
                  ဂိုဒေါင်အသစ် စာရင်းသွင်းခြင်း
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddWarehouseOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleAddWarehouse}
              className="mt-4 space-y-3.5 text-xs font-semibold"
            >
              {/* ဂိုဒေါင် ကုဒ် & ဂိုဒေါင် အမည် */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ဂိုဒေါင် ကုဒ်
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ဥပမာ - BAY-5"
                    value={newWarehouse.code}
                    onChange={(e) =>
                      setNewWarehouse({ ...newWarehouse, code: e.target.value })
                    }
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ဂိုဒေါင် အမည်
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ဥပမာ - အရန် သိုလှောင်ရုံ"
                    value={newWarehouse.name}
                    onChange={(e) =>
                      setNewWarehouse({ ...newWarehouse, name: e.target.value })
                    }
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* တည်နေရာ / အကွက်နံပါတ် */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  တည်နေရာ / အကွက်နံပါတ်
                </label>
                <input
                  type="text"
                  placeholder="ဥပမာ - တောင်ဘက်ခြံဝင်း၊ ရုံအမှတ် ဂ-၄"
                  value={newWarehouse.location}
                  onChange={(e) =>
                    setNewWarehouse({
                      ...newWarehouse,
                      location: e.target.value,
                    })
                  }
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
                />
              </div>

              {/* အများဆုံး သိုလှောင်နိုင်မှု & ဂိုဒေါင်မှူး အမည် */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    အများဆုံး သိုလှောင်နိုင်မှု (အိတ်)
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="500"
                    value={newWarehouse.capacityBags}
                    onChange={(e) =>
                      setNewWarehouse({
                        ...newWarehouse,
                        capacityBags: Number(e.target.value),
                      })
                    }
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ဂိုဒေါင်မှူး အမည်
                  </label>
                  <input
                    type="text"
                    placeholder="ဥပမာ - ဦးမောင်မောင်"
                    value={newWarehouse.supervisor}
                    onChange={(e) =>
                      setNewWarehouse({
                        ...newWarehouse,
                        supervisor: e.target.value,
                      })
                    }
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* ဆက်သွယ်ရန် ဖုန်းနံပါတ် */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ဆက်သွယ်ရန် ဖုန်းနံပါတ်
                </label>
                <input
                  type="text"
                  placeholder="09-xxxxxxxxx"
                  value={newWarehouse.phone}
                  onChange={(e) =>
                    setNewWarehouse({ ...newWarehouse, phone: e.target.value })
                  }
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden font-mono"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddWarehouseOpen(false)}
                  className="w-full sm:w-auto px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer text-center"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2 text-xs font-bold text-white bg-btn-color hover:bg-btn-hover rounded-full shadow-sm cursor-pointer text-center"
                >
                  ဂိုဒေါင် စာရင်းသွင်းမည်
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
