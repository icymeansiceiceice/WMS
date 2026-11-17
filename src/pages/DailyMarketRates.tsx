import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Minus,
  Search,
  Plus,
  Calendar,
  Copy,
  History,
  X,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  Package,
  Edit3,
  Trash2,
  Printer,
  AlertTriangle,
} from "lucide-react";

// ================= TYPES =================
export type PriceSession = "MORNING" | "EVENING" | "ALL_DAY";
export type PriceTrend = "UP" | "DOWN" | "STABLE" | "NONE";

export interface CommodityRate {
  id: string;
  commodityId: string;
  commodityName: string;
  category: "beans" | "oilseed" | "rice";
  unit: string; // တင်း / ပိဿာ
  vissPerTin: number;
  session: PriceSession;
  date: string; // YYYY-MM-DD
  isSet: boolean; // ယနေ့အတွက် ဈေးနှုန်း သတ်မှတ်ပြီးခြင်း ရှိ/မရှိ
  currentRate: number; // ယနေ့ ပေါက်ဈေး (ကျပ်)
  yesterdayRate: number; // မနေ့က ပေါက်ဈေး (ကျပ်)
  openingRate?: number; // အဖွင့်ဈေး
  priceChange: number; // ကွာဟချက် (+/- ကျပ်)
  trend: PriceTrend;
  remarks?: string;
  updatedAt?: string;
}

export interface RateHistoryEntry {
  date: string;
  session: PriceSession;
  rate: number;
  change: number;
  trend: PriceTrend;
  remarks?: string;
}

// ================= MOCK COMMODITY TEMPLATES =================
const COMMODITY_TEMPLATES = [
  {
    id: "C-01",
    name: "မတ်ပဲ (FAQ)",
    category: "beans" as const,
    unit: "တင်း",
    vissPerTin: 20,
    defaultYesterday: 88500,
  },
  {
    id: "C-02",
    name: "ပဲစင်းငုံ နီ (RC)",
    category: "beans" as const,
    unit: "တင်း",
    vissPerTin: 20,
    defaultYesterday: 97000,
  },
  {
    id: "C-03",
    name: "နှမ်းနက် (စမုံ)",
    category: "oilseed" as const,
    unit: "တင်း",
    vissPerTin: 15,
    defaultYesterday: 140000,
  },
  {
    id: "C-04",
    name: "ပဲတီစိမ်း (ရွှေဝါ)",
    category: "beans" as const,
    unit: "တင်း",
    vissPerTin: 20,
    defaultYesterday: 78000,
  },
  {
    id: "C-05",
    name: "စပါး (ရွှေဘိုပေါ်ဆန်း)",
    category: "rice" as const,
    unit: "တင်း",
    vissPerTin: 20,
    defaultYesterday: 123000,
  },
  {
    id: "C-06",
    name: "မြေပဲဆံ (လုံးဆံ)",
    category: "oilseed" as const,
    unit: "ပိဿာ",
    vissPerTin: 1,
    defaultYesterday: 7500,
  },
];

// Initial Rates (အချို့သီးနှံ ဈေးဖွင့်ပြီး၊ အချို့သီးနှံ ဈေးမဖွင့်ရသေး အခြေအနေ)
const INITIAL_RATES: CommodityRate[] = [
  {
    id: "RATE-001",
    commodityId: "C-01",
    commodityName: "မတ်ပဲ (FAQ)",
    category: "beans",
    unit: "တင်း",
    vissPerTin: 20,
    session: "MORNING",
    date: "၂၀၂၆-၁၁-၁၇",
    isSet: true,
    currentRate: 90000,
    yesterdayRate: 88500,
    openingRate: 89000,
    priceChange: 1500,
    trend: "UP",
    remarks: "ရန်ကုန်ဝယ်လက် အဝယ်သွက်သဖြင့် ဈေးမာလာသည်။",
    updatedAt: "မနက် ၉:၁၅",
  },
  {
    id: "RATE-002",
    commodityId: "C-02",
    commodityName: "ပဲစင်းငုံ နီ (RC)",
    category: "beans",
    unit: "တင်း",
    vissPerTin: 20,
    session: "MORNING",
    date: "၂၀၂၆-၁၁-၁၇",
    isSet: true,
    currentRate: 96000,
    yesterdayRate: 97000,
    openingRate: 96500,
    priceChange: -1000,
    trend: "DOWN",
    remarks: "အိန္ဒိယသတင်းကြောင့် အနည်းငယ် အရောင်းအေးသည်။",
    updatedAt: "မနက် ၉:၂၀",
  },
  {
    id: "RATE-003",
    commodityId: "C-03",
    commodityName: "နှမ်းနက် (စမုံ)",
    category: "oilseed",
    unit: "တင်း",
    vissPerTin: 15,
    session: "MORNING",
    date: "၂၀၂၆-၁၁-၁၇",
    isSet: true,
    currentRate: 142000,
    yesterdayRate: 140000,
    openingRate: 141000,
    priceChange: 2000,
    trend: "UP",
    remarks: "တရုတ်လိုင်း အဝယ်လိုက်၍ ဈေးဆက်တက်နေသည်။",
    updatedAt: "မနက် ၉:၃၀",
  },
  {
    id: "RATE-004",
    commodityId: "C-04",
    commodityName: "ပဲတီစိမ်း (ရွှေဝါ)",
    category: "beans",
    unit: "တင်း",
    vissPerTin: 20,
    session: "MORNING",
    date: "၂၀၂၆-၁၁-၁၇",
    isSet: true,
    currentRate: 78000,
    yesterdayRate: 78000,
    openingRate: 78000,
    priceChange: 0,
    trend: "STABLE",
    remarks: "ဈေးငြိမ်ပြီး ပုံမှန်အရောင်းအဝယ်ဖြစ်နေသည်။",
    updatedAt: "မနက် ၉:၃၅",
  },
  {
    id: "RATE-005",
    commodityId: "C-05",
    commodityName: "စပါး (ရွှေဘိုပေါ်ဆန်း)",
    category: "rice",
    unit: "တင်း",
    vissPerTin: 20,
    session: "MORNING",
    date: "၂၀၂၆-၁၁-၁၇",
    isSet: false, // ⚠️ ယနေ့အတွက် ဈေးမသတ်မှတ်ရသေးပါ
    currentRate: 0,
    yesterdayRate: 123000,
    priceChange: 0,
    trend: "NONE",
    remarks: "ဆန်စက်သမားများ ဈေးတန်းညှိဆဲ (ပေါက်ဈေးမထွက်သေး)",
  },
  {
    id: "RATE-006",
    commodityId: "C-06",
    commodityName: "မြေပဲဆံ (လုံးဆံ)",
    category: "oilseed",
    unit: "ပိဿာ",
    vissPerTin: 1,
    session: "MORNING",
    date: "၂၀၂၆-၁၁-၁၇",
    isSet: false, // ⚠️ ယနေ့အတွက် ဈေးမသတ်မှတ်ရသေးပါ
    currentRate: 0,
    yesterdayRate: 7500,
    priceChange: 0,
    trend: "NONE",
    remarks: "ဆီစက်လိုင်း ဈေးဖွင့်ရန် စောင့်ဆိုင်းဆဲ",
  },
];

// Mock Price History
const MOCK_HISTORIES: Record<string, RateHistoryEntry[]> = {
  "C-01": [
    {
      date: "၂၀၂၆-၁၁-၁၇",
      session: "MORNING",
      rate: 90000,
      change: 1500,
      trend: "UP",
      remarks: "ဝယ်လက်သွက်",
    },
    {
      date: "၂၀၂၆-၁၁-၁၆",
      session: "EVENING",
      rate: 88500,
      change: 500,
      trend: "UP",
      remarks: "ဈေးပိတ်မာ",
    },
    {
      date: "၂၀၂၆-၁၁-၁၆",
      session: "MORNING",
      rate: 88000,
      change: 0,
      trend: "STABLE",
      remarks: "ဈေးဖွင့်ပုံမှန်",
    },
    {
      date: "၂၀၂၆-၁၁-၁၅",
      session: "ALL_DAY",
      rate: 88000,
      change: -1000,
      trend: "DOWN",
      remarks: "အရောင်းများ",
    },
  ],
  "C-03": [
    {
      date: "၂၀၂၆-၁၁-၁၇",
      session: "MORNING",
      rate: 142000,
      change: 2000,
      trend: "UP",
      remarks: "တရုတ်လိုင်းသွက်",
    },
    {
      date: "၂၀၂၆-၁၁-၁၆",
      session: "EVENING",
      rate: 140000,
      change: 1000,
      trend: "UP",
      remarks: "ဈေးပိတ်အမြင့်",
    },
  ],
};

export const DailyMarketRates: React.FC = () => {
  // ================= STATE =================
  const [rates, setRates] = useState<CommodityRate[]>(INITIAL_RATES);
  const [activeSessionTab, setActiveSessionTab] = useState<
    "ALL" | PriceSession
  >("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  // Modal 1: Bulk Set/Update All Rates Modal
  const [isBulkRateModalOpen, setIsBulkRateModalOpen] = useState(false);
  const [bulkModalDate, setBulkModalDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [bulkModalSession, setBulkModalSession] =
    useState<PriceSession>("MORNING");
  const [bulkCommentary, setBulkCommentary] = useState("");
  const [bulkInputRates, setBulkInputRates] = useState<Record<string, number>>(
    {}
  );

  // Modal 2: Single Commodity Quick Edit Modal
  const [editingRate, setEditingRate] = useState<CommodityRate | null>(null);
  const [singleRateInput, setSingleRateInput] = useState<number>(0);
  const [singleSession, setSingleSession] = useState<PriceSession>("MORNING");
  const [singleRemarks, setSingleRemarks] = useState("");

  // Modal 3: History Viewer Modal
  const [historyCommodity, setHistoryCommodity] =
    useState<CommodityRate | null>(null);

  // Modal 4: Print Rate Sheet Preview
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // ================= COMPUTED METRICS =================
  const pendingRates = useMemo(() => rates.filter((r) => !r.isSet), [rates]);
  const completedRates = useMemo(() => rates.filter((r) => r.isSet), [rates]);

  const kpiStats = useMemo(() => {
    const totalCount = rates.length;
    const completedCount = completedRates.length;
    const pendingCount = pendingRates.length;
    const upCount = completedRates.filter((r) => r.trend === "UP").length;
    const downCount = completedRates.filter((r) => r.trend === "DOWN").length;

    const sorted = [...completedRates].sort(
      (a, b) => b.currentRate - a.currentRate
    );
    const topCommodity = sorted[0];

    return {
      totalCount,
      completedCount,
      pendingCount,
      upCount,
      downCount,
      topCommodity,
    };
  }, [rates, completedRates, pendingRates]);

  // Filtered List
  const filteredRates = useMemo(() => {
    return rates.filter((item) => {
      const matchSession =
        activeSessionTab === "ALL" || item.session === activeSessionTab;
      const matchSearch =
        item.commodityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.remarks &&
          item.remarks.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchSession && matchSearch;
    });
  }, [rates, activeSessionTab, searchTerm]);

  // ================= HANDLERS =================
  // Open Bulk Modal
  const handleOpenBulkModal = () => {
    setBulkModalDate(new Date().toISOString().slice(0, 10));
    setBulkModalSession("MORNING");
    setBulkCommentary("");
    const initial: Record<string, number> = {};
    rates.forEach((r) => {
      initial[r.commodityId] = r.isSet ? r.currentRate : r.yesterdayRate;
    });
    setBulkInputRates(initial);
    setIsBulkRateModalOpen(true);
  };

  // Quick Action: Pre-fill all with Yesterday's Rates in Bulk Modal
  const handleCopyYesterdayInBulk = () => {
    const copy: Record<string, number> = {};
    rates.forEach((r) => {
      copy[r.commodityId] = r.yesterdayRate;
    });
    setBulkInputRates(copy);
  };

  // 1-Click Proactive Action from Banner: Auto-Confirm all Pending with Yesterday's Rates
  const handleAutoConfirmAllWithYesterday = () => {
    if (
      confirm(
        "မသတ်မှတ်ရသေးသော သီးနှံများအားလုံးကို မနေ့က ပေါက်ဈေးများအတိုင်း ချက်ချင်းအတည်ပြု သတ်မှတ်မည် ဖြစ်ပါသလား?"
      )
    ) {
      setRates((prev) =>
        prev.map((r) => {
          if (!r.isSet) {
            return {
              ...r,
              isSet: true,
              currentRate: r.yesterdayRate,
              priceChange: 0,
              trend: "STABLE",
              remarks: "မနေ့ကပေါက်ဈေးအတိုင်း ဈေးငြိမ် အတည်ပြုထားသည်။",
              updatedAt: "ယခုချက်ချင်း",
            };
          }
          return r;
        })
      );
    }
  };

  // Save Bulk Rates
  const handleSubmitBulkRates = (e: React.FormEvent) => {
    e.preventDefault();
    setRates((prev) =>
      prev.map((r) => {
        const newRate =
          Number(bulkInputRates[r.commodityId]) || r.yesterdayRate;
        const diff = newRate - r.yesterdayRate;
        let trend: PriceTrend = "STABLE";
        if (diff > 0) trend = "UP";
        if (diff < 0) trend = "DOWN";

        return {
          ...r,
          isSet: true,
          session: bulkModalSession,
          date: bulkModalDate,
          currentRate: newRate,
          priceChange: diff,
          trend: trend,
          remarks: bulkCommentary.trim() || r.remarks || "သတ်မှတ်ပြီး",
          updatedAt: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      })
    );
    setIsBulkRateModalOpen(false);
  };

  // Single Rate Edit
  const handleOpenSingleEdit = (rate: CommodityRate) => {
    setEditingRate(rate);
    setSingleRateInput(rate.isSet ? rate.currentRate : rate.yesterdayRate);
    setSingleSession(rate.session);
    setSingleRemarks(rate.remarks || "");
  };

  const handleSaveSingleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRate) return;

    const rateVal = Number(singleRateInput) || 0;
    const diff = rateVal - editingRate.yesterdayRate;
    let trend: PriceTrend = "STABLE";
    if (diff > 0) trend = "UP";
    if (diff < 0) trend = "DOWN";

    setRates((prev) =>
      prev.map((r) => {
        if (r.id === editingRate.id) {
          return {
            ...r,
            isSet: true,
            currentRate: rateVal,
            session: singleSession,
            priceChange: diff,
            trend: trend,
            remarks: singleRemarks.trim() || undefined,
            updatedAt: "မကြာမီက",
          };
        }
        return r;
      })
    );
    setEditingRate(null);
  };

  // Single Rate Delete / Reset to Unset
  const handleDeleteRate = (rate: CommodityRate) => {
    if (
      confirm(
        `${rate.commodityName} ၏ ယနေ့ပေါက်ဈေးအား ပယ်ဖျက်ပြီး "မသတ်မှတ်ရသေး" သို့ ပြန်လည်ပြောင်းလဲမည် သေချာပါသလား?`
      )
    ) {
      setRates((prev) =>
        prev.map((r) => {
          if (r.id === rate.id) {
            return {
              ...r,
              isSet: false,
              currentRate: 0,
              priceChange: 0,
              trend: "NONE",
              remarks: "ပေါက်ဈေး ပြန်လည်ပယ်ဖျက်ထားသည်",
              updatedAt: undefined,
            };
          }
          return r;
        })
      );
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 select-none pb-3">
      {/* ================= 1. GREETING & HEADER ================= */}
      <div className="relative overflow-hidden py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">
          နေ့စဉ် သီးနှံပေါက်ဈေး စီမံခန့်ခွဲမှု (Daily Market Rates)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 sm:mt-3 max-w-xl leading-relaxed">
          မနက်ပိုင်း၊ ညနေပိုင်းနှင့် တစ်နေကုန် ပွဲရုံသီးနှံပေါက်ဈေးများ
          သတ်မှတ်ခြင်း၊ ပြင်ဆင်/ပယ်ဖျက်ခြင်းနှင့် နေ့စဉ်ပေါက်ဈေးလွှာ
          မှတ်တမ်းများ
        </p>
      </div>

      {/* ================= 2. 4 KPI SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {/* Card 1: ဈေးနှုန်းသတ်မှတ်ပြီး သီးနှံ */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              ပေါက်ဈေး သတ်မှတ်ပြီး
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Package size={18} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {kpiStats.completedCount} / {kpiStats.totalCount}{" "}
              <span className="text-xs font-normal text-slate-500">မျိုး</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              သတ်မှတ်ပြီး{" "}
              {Math.round(
                (kpiStats.completedCount / kpiStats.totalCount) * 100
              )}
              %
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
            <span>ပွဲရုံသတ်မှတ်ပေါက်ဈေး</span>
            <span className="text-[11px] text-slate-400 font-normal truncate ml-2">
              ယနေ့အတွက်
            </span>
          </div>
        </div>

        {/* Card 2: ဈေးမသတ်မှတ်ရသေးသည့် သီးနှံ (Pending Warning) */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              ဈေးမသတ်မှတ်ရသေး
            </span>
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                kpiStats.pendingCount > 0
                  ? "bg-rose-50 text-rose-600"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3
              className={`text-xl sm:text-2xl font-black tracking-tight ${
                kpiStats.pendingCount > 0 ? "text-rose-600" : "text-emerald-600"
              }`}
            >
              {kpiStats.pendingCount}{" "}
              <span className="text-xs font-normal text-slate-500">
                မျိုး ကျန်ရှိ
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              {kpiStats.pendingCount > 0
                ? "ပေါက်ဈေးသတ်မှတ်ရန် လိုအပ်ဆဲ"
                : "သီးနှံအားလုံး သတ်မှတ်ပြီးပါပြီ"}
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
            <span
              className={
                kpiStats.pendingCount > 0 ? "text-rose-600" : "text-emerald-600"
              }
            >
              {kpiStats.pendingCount > 0
                ? "အရေးကြီး သတိပေးချက်"
                : "ပြီးပြည့်စုံမှု အခြေအနေ"}
            </span>
            <span className="text-[11px] text-slate-400 font-normal truncate ml-2">
              {kpiStats.pendingCount > 0 ? "ဈေးဖွင့်ရန်လို" : "အဆင်သင့်"}
            </span>
          </div>
        </div>

        {/* Card 3: ယနေ့ ဈေးအမြင့်ဆုံး သီးနှံ */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              ယနေ့ ဈေးအမြင့်ဆုံး
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {kpiStats.topCommodity
                ? `${kpiStats.topCommodity.currentRate.toLocaleString()} ကျပ်`
                : "---"}
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              {kpiStats.topCommodity
                ? `${kpiStats.topCommodity.commodityName} (၁ ${kpiStats.topCommodity.unit})`
                : "သတ်မှတ်ဆဲ"}
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-bold">
            <span>
              +{kpiStats.topCommodity?.priceChange.toLocaleString() || 0} ကျပ်
            </span>
            <span className="text-[11px] text-slate-400 font-normal truncate ml-2">
              မနေ့ကထက်
            </span>
          </div>
        </div>

        {/* Card 4: ဈေးကွက် လားရာ */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              ဈေးကွက် လားရာ
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <span className="text-emerald-600">{kpiStats.upCount} တက်</span>
              <span className="text-slate-300">/</span>
              <span className="text-rose-600">{kpiStats.downCount} ကျ</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              သတ်မှတ်ပြီး {kpiStats.completedCount} မျိုးအနက်
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-600 font-bold">
            <span>အရောင်းအဝယ် သွက်</span>
            <span className="text-[11px] text-slate-400 font-normal truncate ml-2">
              ဝယ်လိုအားကောင်း
            </span>
          </div>
        </div>
      </div>

      {/* ================= 3. PROACTIVE ALERT BANNER (If prices are pending) ================= */}
      {kpiStats.pendingCount > 0 && (
        <div className="p-3.5 sm:p-4 bg-amber-50/90 rounded-3xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-amber-900">
            <AlertTriangle size={18} className="text-amber-700 shrink-0" />
            <div>
              <span className="font-bold text-xs sm:text-sm block">
                သတိပြုရန်: ယနေ့အတွက် ပေါက်ဈေး မသတ်မှတ်ရသေးသော သီးနှံ (
                {kpiStats.pendingCount}) မျိုး ရှိနေပါသည်
              </span>
              <span className="text-[11px] text-amber-700">
                တောင်သူများနှင့် ဝယ်လက်များ ကုန်အဝင်/အရောင်း ဖွင့်လှစ်ရာတွင်
                အဆင်ပြေစေရန် ပေါက်ဈေး ဖြည့်သွင်းပေးပါ
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleAutoConfirmAllWithYesterday}
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="မနေ့ကပေါက်ဈေးအတိုင်း တစ်ချက်တည်းဖြင့် အလိုအလျောက် သတ်မှတ်မည်"
            >
              <Copy size={13} />
              <span>မနေ့ကဈေးဖြင့် အားလုံးအတည်ပြုမည်</span>
            </button>

            <button
              type="button"
              onClick={handleOpenBulkModal}
              className="px-4 py-1.5 rounded-full bg-btn-color hover:bg-btn-hover text-white text-xs font-bold cursor-pointer"
            >
              ယခုချက်ချင်း ဈေးသတ်မှတ်မည်
            </button>
          </div>
        </div>
      )}

      {/* ================= 4. SESSION TABS & ACTION STRIP ================= */}
      <div className="space-y-4">
        {/* Buttons ၄ ခု (အားလုံး / မနက်ပိုင်း / ညနေပိုင်း / တစ်နေကုန်) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              type="button"
              onClick={() => setActiveSessionTab("ALL")}
              className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer shrink-0 border ${
                activeSessionTab === "ALL"
                  ? "bg-btn-color text-white border-btn-color"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              အားလုံး ({rates.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveSessionTab("MORNING")}
              className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer shrink-0 border ${
                activeSessionTab === "MORNING"
                  ? "bg-btn-color text-white border-btn-color"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              မနက်ပိုင်း ဈေး (
              {rates.filter((r) => r.session === "MORNING").length})
            </button>

            <button
              type="button"
              onClick={() => setActiveSessionTab("EVENING")}
              className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer shrink-0 border ${
                activeSessionTab === "EVENING"
                  ? "bg-btn-color text-white border-btn-color"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              ညနေပိုင်း ဈေး (
              {rates.filter((r) => r.session === "EVENING").length})
            </button>

            <button
              type="button"
              onClick={() => setActiveSessionTab("ALL_DAY")}
              className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer shrink-0 border ${
                activeSessionTab === "ALL_DAY"
                  ? "bg-btn-color text-white border-btn-color"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              တစ်နေကုန် ပေါက်ဈေး (
              {rates.filter((r) => r.session === "ALL_DAY").length})
            </button>
          </div>

          <div className="text-xs text-slate-500 font-semibold px-1 shrink-0">
            လက်ရှိဖော်ပြစာရင်း:{" "}
            <span className="font-bold text-slate-800">
              {filteredRates.length} မျိုး
            </span>
          </div>
        </div>

        {/* Search + Date Picker + Print + Bulk Set Rates Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 sm:p-4 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="သီးနှံအမည်၊ အမျိုးအစား၊ မှတ်ချက်ဖြင့် ရှာပါ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium focus:outline-hidden"
              />
            </div>

            {/* Date Picker Filter */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-full px-3.5 py-1.5 shrink-0">
              <Calendar size={13} className="text-slate-500" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
              />
            </div>
          </div>

          {/* Action Buttons: Print Sheet & Bulk Set Rates */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-full shadow-2xs cursor-pointer"
              title="နေ့စဉ် ပေါက်ဈေးလွှာ ပရင့်ထုတ်မည်"
            >
              <Printer size={15} />
              <span>ပေါက်ဈေးလွှာ ထုတ်မည်</span>
            </button>

            <button
              type="button"
              onClick={handleOpenBulkModal}
              className="flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 text-xs text-white bg-btn-color hover:bg-btn-hover rounded-full shadow-sm cursor-pointer"
            >
              <Plus size={16} />
              <span>ပေါက်ဈေး အားလုံးသတ်မှတ်မည်</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= 5. RESPONSIVE CARDS & TABLE VIEW ================= */}
      {/* A. Mobile & Tablet Cards View (< lg) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 lg:hidden">
        {filteredRates.length === 0 ? (
          <div className="col-span-full bg-card rounded-3xl p-10 text-center border border-slate-200/80 shadow-xs">
            <p className="text-sm font-bold text-slate-500">
              ရှာဖွေမှုနှင့် ကိုက်ညီသော ပေါက်ဈေးစာရင်း မတွေ့ရှိပါ
            </p>
          </div>
        ) : (
          filteredRates.map((rate) => (
            <div
              key={rate.id}
              className={`bg-card rounded-3xl p-4 sm:p-5 border shadow-xs flex flex-col justify-between ${
                !rate.isSet
                  ? "border-amber-200/80 bg-amber-50/20"
                  : "border-slate-200/80"
              }`}
            >
              <div>
                {/* Header: Commodity Name & Status / Session Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 leading-tight">
                      {rate.commodityName}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      ၁ {rate.unit}{" "}
                      {rate.vissPerTin > 1 ? `(${rate.vissPerTin} ပိဿာ)` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!rate.isSet ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        ⚠️ ဈေးမဖွင့်သေး
                      </span>
                    ) : (
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          rate.session === "MORNING"
                            ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                            : rate.session === "EVENING"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {rate.session === "MORNING"
                          ? "မနက်ပိုင်း"
                          : rate.session === "EVENING"
                          ? "ညနေပိုင်း"
                          : "တစ်နေကုန်"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price Display Box */}
                <div className="mt-3.5 bg-slate-50 p-3 rounded-2xl space-y-2">
                  {rate.isSet ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium">
                          ယနေ့ ပေါက်ဈေး:
                        </span>
                        <span className="text-base font-black text-slate-900 font-mono">
                          {rate.currentRate.toLocaleString()} ကျပ်
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/60">
                        <span className="text-slate-500">မနေ့က ဈေးနှုန်း:</span>
                        <span className="font-bold text-slate-600 font-mono">
                          {rate.yesterdayRate.toLocaleString()} ကျပ်
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-slate-500">
                          ဈေးနှုန်း အတက်/အကျ:
                        </span>
                        <div className="flex items-center gap-1 font-bold">
                          {rate.trend === "UP" ? (
                            <span className="text-emerald-600 flex items-center gap-0.5 font-mono">
                              <ArrowUpRight size={14} /> +
                              {rate.priceChange.toLocaleString()} ကျပ်
                            </span>
                          ) : rate.trend === "DOWN" ? (
                            <span className="text-rose-600 flex items-center gap-0.5 font-mono">
                              <ArrowDownRight size={14} />{" "}
                              {rate.priceChange.toLocaleString()} ကျပ်
                            </span>
                          ) : (
                            <span className="text-slate-500 flex items-center gap-0.5">
                              <Minus size={14} /> ဈေးငြိမ်
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    /* ဈေးမသတ်မှတ်ရသေးသော အခြေအနေ */
                    <div className="py-2 text-center space-y-2">
                      <div className="text-xs font-bold text-rose-600">
                        ဒီနေ့အတွက် ပေါက်ဈေး မသတ်မှတ်ရသေးပါ
                      </div>
                      <div className="text-[11px] text-slate-500">
                        မနေ့က ပေါက်ဈေး:{" "}
                        <b className="font-mono">
                          {rate.yesterdayRate.toLocaleString()} ကျပ်
                        </b>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenSingleEdit(rate)}
                        className="px-4 py-1.5 rounded-full bg-btn-color hover:bg-btn-hover text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1"
                      >
                        <Plus size={13} />
                        <span>ယခု ဈေးထည့်မည်</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Remarks */}
                {rate.remarks && (
                  <p className="text-[11px] text-slate-500 mt-2.5 px-1 italic truncate">
                    မှတ်ချက်: {rate.remarks}
                  </p>
                )}
              </div>

              {/* Card Footer: Edit, Delete, History Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  {rate.updatedAt ? `ပြင်ဆင်: ${rate.updatedAt}` : rate.date}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenSingleEdit(rate)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                    title="ဈေးနှုန်း ပြင်ဆင်မည်"
                  >
                    <Edit3 size={15} />
                  </button>

                  {rate.isSet && (
                    <button
                      type="button"
                      onClick={() => handleDeleteRate(rate)}
                      className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="ဈေးနှုန်း ပယ်ဖျက်မည်"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setHistoryCommodity(rate)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                    title="ကာလပေါက်ဈေး မှတ်တမ်း"
                  >
                    <History size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* B. Desktop Table View (>= lg) */}
      <div className="hidden lg:block bg-card rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-[11px] font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">သီးနှံအမည်</th>
                <th className="px-5 py-3.5">အချိန်ပိုင်း (Session)</th>
                <th className="px-5 py-3.5">ရေတွက်ပုံ</th>
                <th className="px-5 py-3.5 text-right">ယနေ့ ပေါက်ဈေး (ကျပ်)</th>
                <th className="px-5 py-3.5 text-right">မနေ့က ဈေး</th>
                <th className="px-5 py-3.5 text-right">အတက်/အကျ</th>
                <th className="px-5 py-3.5">ဈေးကွက်သုံးသပ်ချက်/မှတ်ချက်</th>
                <th className="px-5 py-3.5 text-center">လုပ်ဆောင်ချက်</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredRates.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-10 text-center text-slate-400 font-bold"
                  >
                    ရှာဖွေမှုနှင့် ကိုက်ညီသော ပေါက်ဈေးစာရင်း မတွေ့ရှိပါ
                  </td>
                </tr>
              ) : (
                filteredRates.map((rate) => (
                  <tr
                    key={rate.id}
                    className={`hover:bg-slate-50/80 ${
                      !rate.isSet ? "bg-amber-50/30" : ""
                    }`}
                  >
                    {/* Commodity */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <span className="font-bold text-slate-900 block">
                            {rate.commodityName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {rate.updatedAt
                              ? `ပြင်ဆင်ချိန်: ${rate.updatedAt}`
                              : rate.date}
                          </span>
                        </div>
                        {!rate.isSet && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-700">
                            မသတ်မှတ်ရသေး
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Session Badge */}
                    <td className="px-5 py-4">
                      {rate.isSet ? (
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            rate.session === "MORNING"
                              ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                              : rate.session === "EVENING"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {rate.session === "MORNING"
                            ? "မနက်ပိုင်း"
                            : rate.session === "EVENING"
                            ? "ညနေပိုင်း"
                            : "တစ်နေကုန်"}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px] font-normal italic">
                          (စောင့်ဆိုင်းဆဲ)
                        </span>
                      )}
                    </td>

                    {/* Unit */}
                    <td className="px-5 py-4 text-slate-700 font-medium">
                      ၁ {rate.unit}{" "}
                      {rate.vissPerTin > 1 ? `(${rate.vissPerTin} ပိဿာ)` : ""}
                    </td>

                    {/* Today's Rate */}
                    <td className="px-5 py-4 text-right font-mono font-black text-sm">
                      {rate.isSet ? (
                        <span className="text-slate-900">
                          {rate.currentRate.toLocaleString()}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenSingleEdit(rate)}
                          className="px-2.5 py-1 rounded-full bg-btn-color hover:bg-btn-hover text-white text-[11px] font-bold cursor-pointer inline-flex items-center gap-1"
                        >
                          <Plus size={12} />
                          <span>ဈေးထည့်မည်</span>
                        </button>
                      )}
                    </td>

                    {/* Yesterday's Rate */}
                    <td className="px-5 py-4 text-right font-mono font-bold text-slate-500">
                      {rate.yesterdayRate.toLocaleString()}
                    </td>

                    {/* Price Difference */}
                    <td className="px-5 py-4 text-right font-mono font-bold">
                      {!rate.isSet ? (
                        <span className="text-slate-400 font-sans font-normal text-[11px]">
                          -
                        </span>
                      ) : rate.trend === "UP" ? (
                        <span className="text-emerald-600 inline-flex items-center gap-0.5">
                          <ArrowUpRight size={13} /> +
                          {rate.priceChange.toLocaleString()}
                        </span>
                      ) : rate.trend === "DOWN" ? (
                        <span className="text-rose-600 inline-flex items-center gap-0.5">
                          <ArrowDownRight size={13} />{" "}
                          {rate.priceChange.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-400 inline-flex items-center gap-0.5 font-sans font-normal">
                          <Minus size={13} /> ငြိမ်
                        </span>
                      )}
                    </td>

                    {/* Remarks */}
                    <td className="px-5 py-4 text-slate-600 text-[11px] max-w-xs truncate">
                      {rate.remarks || "-"}
                    </td>

                    {/* Actions: Edit, Delete, History */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenSingleEdit(rate)}
                          className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                          title="ပြင်ဆင်မည်"
                        >
                          <Edit3 size={15} />
                        </button>

                        {rate.isSet && (
                          <button
                            type="button"
                            onClick={() => handleDeleteRate(rate)}
                            className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="ပယ်ဖျက်မည်"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setHistoryCommodity(rate)}
                          className="p-1.5 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                          title="ကာလပေါက်ဈေး မှတ်တမ်း"
                        >
                          <History size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= 6. MODAL 1: BULK SET RATES (With Copy Yesterday's Rates) ================= */}
      {isBulkRateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-card w-full max-w-3xl rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xl max-h-[92vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-btn-color text-white flex items-center justify-center font-bold">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    ပေါက်ဈေး အားလုံး တစ်ပြိုင်နက် သတ်မှတ်/ပြင်ဆင်ခြင်း
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    မနက်ပိုင်း၊ ညနေပိုင်း သို့မဟုတ် တစ်နေကုန် ဈေးနှုန်းများ
                    အားလုံးအား တစ်ကြိမ်တည်း ထည့်သွင်းနိုင်ပါသည်
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkRateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmitBulkRates}
              className="space-y-4 mt-4 text-xs font-semibold"
            >
              {/* Session Selector & Date */}
              <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                    ဈေးဖွင့်မည့် အချိန်ပိုင်း (Session) ရွေးချယ်ပါ
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setBulkModalSession("MORNING")}
                      className={`py-2 rounded-full text-xs font-bold cursor-pointer border ${
                        bulkModalSession === "MORNING"
                          ? "bg-btn-color text-white border-btn-color"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      မနက်ပိုင်း
                    </button>
                    <button
                      type="button"
                      onClick={() => setBulkModalSession("EVENING")}
                      className={`py-2 rounded-full text-xs font-bold cursor-pointer border ${
                        bulkModalSession === "EVENING"
                          ? "bg-btn-color text-white border-btn-color"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      ညနေပိုင်း
                    </button>
                    <button
                      type="button"
                      onClick={() => setBulkModalSession("ALL_DAY")}
                      className={`py-2 rounded-full text-xs font-bold cursor-pointer border ${
                        bulkModalSession === "ALL_DAY"
                          ? "bg-btn-color text-white border-btn-color"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      တစ်နေကုန်
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    ပေါက်ဈေး ထုတ်ပြန်မည့် ရက်စွဲ
                  </label>
                  <input
                    type="date"
                    required
                    value={bulkModalDate}
                    onChange={(e) => setBulkModalDate(e.target.value)}
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                  />
                </div>
              </div>

              {/* Commodities Rates Table Container with Quick Copy Feature */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Scale size={15} className="text-slate-500" />
                    သီးနှံအလိုက် ပေါက်ဈေးများ:
                  </span>

                  {/* ⭐ UX Superpower: Copy Yesterday's Rates Button */}
                  <button
                    type="button"
                    onClick={handleCopyYesterdayInBulk}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer border border-slate-200"
                    title="မနေ့က သတ်မှတ်ထားသော ဈေးနှုန်းများကို အလိုအလျောက် ကူးယူဖြည့်သွင်းပါမည်"
                  >
                    <Copy size={13} className="text-slate-600" />
                    <span>မနေ့က ဈေးနှုန်းများ အားလုံးကူးယူမည်</span>
                  </button>
                </div>

                <div className="bg-slate-50/70 rounded-2xl border border-slate-200/90 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/80 text-slate-700 text-[11px] font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">သီးနှံအမည်</th>
                        <th className="p-3">ရေတွက်ပုံ</th>
                        <th className="p-3 text-right">မနေ့က ဈေး</th>
                        <th className="p-3 text-right">
                          ယနေ့ ပေါက်ဈေး (ကျပ်) *
                        </th>
                        <th className="p-3 text-center">ကွာဟချက်</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/60 font-semibold">
                      {COMMODITY_TEMPLATES.map((comm) => {
                        const currentVal = bulkInputRates[comm.id] || 0;
                        const diff = currentVal - comm.defaultYesterday;

                        return (
                          <tr key={comm.id} className="hover:bg-white/80">
                            <td className="p-3">
                              <span className="font-bold text-slate-900 block">
                                {comm.name}
                              </span>
                              <span className="text-[10px] text-slate-400 uppercase">
                                {comm.category}
                              </span>
                            </td>

                            <td className="p-3 text-slate-600">
                              ၁ {comm.unit}{" "}
                              {comm.vissPerTin > 1
                                ? `(${comm.vissPerTin} ပိဿာ)`
                                : ""}
                            </td>

                            <td className="p-3 text-right font-mono text-slate-500">
                              {comm.defaultYesterday.toLocaleString()}
                            </td>

                            <td className="p-3 text-right">
                              <input
                                type="number"
                                min="0"
                                required
                                value={currentVal || ""}
                                onChange={(e) =>
                                  setBulkInputRates({
                                    ...bulkInputRates,
                                    [comm.id]: Number(e.target.value),
                                  })
                                }
                                className="w-36 text-xs font-bold p-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white text-right font-mono"
                                placeholder="0"
                              />
                            </td>

                            <td className="p-3 text-center font-mono text-[11px]">
                              {diff > 0 ? (
                                <span className="text-emerald-600 font-bold">
                                  +{diff.toLocaleString()}
                                </span>
                              ) : diff < 0 ? (
                                <span className="text-rose-600 font-bold">
                                  {diff.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-sans font-normal">
                                  ငြိမ်
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Market Commentary */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  ဈေးကွက် သုံးသပ်ချက် / နေ့စဉ် မှတ်ချက်
                </label>
                <textarea
                  rows={2}
                  placeholder="ဥပမာ - ရန်ကုန်ဝယ်လက်များ အဝယ်သွက်၍ ပဲဈေးမာသည်၊ စပါးအဝင်နည်းပြီး ဈေးအနည်းငယ်တက်သည် စသည်..."
                  value={bulkCommentary}
                  onChange={(e) => setBulkCommentary(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 sm:pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBulkRateModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-btn-color hover:bg-btn-hover text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  ပေါက်ဈေးများ အတည်ပြုသိမ်းဆည်းမည်
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= 7. MODAL 2: SINGLE COMMODITY QUICK EDIT MODAL ================= */}
      {editingRate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-card w-full max-w-md rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xl max-h-[92vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-btn-color text-white flex items-center justify-center font-bold">
                  <Edit3 size={15} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    {editingRate.commodityName} ဈေးနှုန်းပြင်ဆင်ခြင်း
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    ၁ {editingRate.unit} ({editingRate.vissPerTin} ပိဿာ)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingRate(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSaveSingleEdit}
              className="space-y-4 mt-4 text-xs font-semibold"
            >
              {/* Yesterday Rate Reference & Copy Shortcut */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">
                    မနေ့က ပေါက်ဈေး
                  </span>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {editingRate.yesterdayRate.toLocaleString()} ကျပ်
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSingleRateInput(editingRate.yesterdayRate)}
                  className="px-3 py-1 rounded-full bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer flex items-center gap-1"
                >
                  <Copy size={12} />
                  <span>မနေ့ကဈေး ယူမည်</span>
                </button>
              </div>

              {/* New Rate Input */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  ယနေ့ ပေါက်ဈေး အသစ် (ကျပ်) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={singleRateInput || ""}
                  onChange={(e) => setSingleRateInput(Number(e.target.value))}
                  className="w-full text-sm font-mono font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white text-right"
                  placeholder="0"
                />
              </div>

              {/* Session Switcher */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                  အချိန်ပိုင်း (Session)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["MORNING", "EVENING", "ALL_DAY"] as PriceSession[]).map(
                    (sess) => (
                      <button
                        key={sess}
                        type="button"
                        onClick={() => setSingleSession(sess)}
                        className={`py-1.5 rounded-full text-xs font-bold cursor-pointer border ${
                          singleSession === sess
                            ? "bg-btn-color text-white border-btn-color"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {sess === "MORNING"
                          ? "မနက်"
                          : sess === "EVENING"
                          ? "ညနေ"
                          : "တစ်နေကုန်"}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  မှတ်ချက်
                </label>
                <input
                  type="text"
                  placeholder="ဥပမာ - ဝယ်လိုအားများ၊ အရောင်းအေး စသည်..."
                  value={singleRemarks}
                  onChange={(e) => setSingleRemarks(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRate(null)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-btn-color hover:bg-btn-hover text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  သိမ်းဆည်းမည်
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= 8. MODAL 3: COMMODITY RATE HISTORY VIEWER ================= */}
      {historyCommodity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-card w-full max-w-xl rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xl max-h-[92vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
                  <History size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    {historyCommodity.commodityName} - ကာလပေါက်ဈေး မှတ်တမ်း
                  </h3>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    ၁ {historyCommodity.unit} ({historyCommodity.vissPerTin}{" "}
                    ပိဿာ) ဈေးနှုန်းပြောင်းလဲမှုများ
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHistoryCommodity(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Current Rate Highlight Box */}
            <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">
                  ယနေ့ ပေါက်ဈေး
                </span>
                <span className="text-xl font-black text-slate-900 font-mono">
                  {historyCommodity.isSet
                    ? `${historyCommodity.currentRate.toLocaleString()} ကျပ်`
                    : "သတ်မှတ်ဆဲ"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  မနေ့ကထက်
                </span>
                <span
                  className={`text-sm font-bold font-mono inline-flex items-center gap-0.5 ${
                    historyCommodity.trend === "UP"
                      ? "text-emerald-600"
                      : historyCommodity.trend === "DOWN"
                      ? "text-rose-600"
                      : "text-slate-500"
                  }`}
                >
                  {historyCommodity.trend === "UP" && (
                    <ArrowUpRight size={14} />
                  )}
                  {historyCommodity.trend === "DOWN" && (
                    <ArrowDownRight size={14} />
                  )}
                  {historyCommodity.priceChange > 0 ? "+" : ""}
                  {historyCommodity.priceChange.toLocaleString()} ကျပ်
                </span>
              </div>
            </div>

            {/* History Table */}
            <div className="mt-4 border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold text-[11px]">
                  <tr>
                    <th className="p-3">ရက်စွဲ</th>
                    <th className="p-3">အချိန်ပိုင်း</th>
                    <th className="p-3 text-right">ပေါက်ဈေး (ကျပ်)</th>
                    <th className="p-3 text-right">အတက်/အကျ</th>
                    <th className="p-3">မှတ်ချက်</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold">
                  {(
                    MOCK_HISTORIES[historyCommodity.commodityId] || [
                      {
                        date: historyCommodity.date,
                        session: historyCommodity.session,
                        rate: historyCommodity.currentRate,
                        change: historyCommodity.priceChange,
                        trend: historyCommodity.trend,
                        remarks: historyCommodity.remarks || "ပုံမှန်",
                      },
                    ]
                  ).map((h, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-slate-700">{h.date}</td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {h.session === "MORNING"
                            ? "မနက်"
                            : h.session === "EVENING"
                            ? "ညနေ"
                            : "တစ်နေကုန်"}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        {h.rate.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-mono text-[11px]">
                        {h.change > 0 ? (
                          <span className="text-emerald-600 font-bold">
                            +{h.change.toLocaleString()}
                          </span>
                        ) : h.change < 0 ? (
                          <span className="text-rose-600 font-bold">
                            {h.change.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">
                            ငြိမ်
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-[11px] text-slate-500 max-w-[120px] truncate">
                        {h.remarks || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => setHistoryCommodity(null)}
                className="px-5 py-2 rounded-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                ပိတ်မည်
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 9. MODAL 4: PRINT RATE SHEET PREVIEW ================= */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-card w-full max-w-xl rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xl max-h-[92vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
                  <Printer size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    နေ့စဉ် ပွဲရုံပေါက်ဈေးလွှာ (Rate Sheet Preview)
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    ရက်စွဲ: {filterDate}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 p-5 bg-white border border-slate-200 rounded-2xl space-y-4 text-xs font-semibold">
              <div className="text-center pb-3 border-b border-slate-200 space-y-1">
                <h2 className="text-base font-black text-slate-900">
                  ရွှေစပါးနှင့် သီးနှံစုံ ကုန်စည်ဒိုင်/ပွဲရုံ
                </h2>
                <p className="text-[11px] text-slate-500">
                  နေ့စဉ် သီးနှံပေါက်ဈေး ကြေညာလွှာ
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  ထုတ်ပြန်ရက်: {filterDate}
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold text-[11px]">
                    <tr>
                      <th className="p-2.5">သီးနှံအမည်</th>
                      <th className="p-2.5">ရေတွက်ပုံ</th>
                      <th className="p-2.5 text-right">ပေါက်ဈေး (ကျပ်)</th>
                      <th className="p-2.5 text-right">အတက်/အကျ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rates.map((r) => (
                      <tr key={r.id}>
                        <td className="p-2.5 font-bold text-slate-800">
                          {r.commodityName}
                        </td>
                        <td className="p-2.5 text-slate-600">၁ {r.unit}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                          {r.isSet
                            ? r.currentRate.toLocaleString()
                            : "စောင့်ဆိုင်းဆဲ"}
                        </td>
                        <td className="p-2.5 text-right font-mono text-[11px]">
                          {r.isSet && r.priceChange > 0 ? (
                            <span className="text-emerald-600 font-bold">
                              +{r.priceChange.toLocaleString()}
                            </span>
                          ) : r.isSet && r.priceChange < 0 ? (
                            <span className="text-rose-600 font-bold">
                              {r.priceChange.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">
                              ငြိမ်
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-[10px] text-slate-400 italic text-center pt-2">
                * အထက်ပါပေါက်ဈေးသည် ပွဲရုံ၏ သတ်မှတ်စံချိန်စံညွှန်း အစိုဓာတ်နှင့်
                အရည်အသွေးအပေါ် အခြေခံထားပါသည် *
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
              >
                ပိတ်မည်
              </button>
              <button
                type="button"
                onClick={() =>
                  alert("ပရင်တာ သို့မဟုတ် PDF အဖြစ် ထုတ်ယူနေပါသည်...")
                }
                className="px-5 py-2 rounded-full bg-btn-color hover:bg-btn-hover text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
              >
                <Printer size={14} />
                <span>ပရင့်ထုတ်မည် / PDF ယူမည်</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyMarketRates;
