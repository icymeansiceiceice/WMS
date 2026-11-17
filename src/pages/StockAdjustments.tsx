import React, { useState, useId, useRef, useEffect } from "react";
import {
  Boxes,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  X,
  UserCheck,
  ClipboardCheck,
  ArrowDownRight,
  ArrowUpRight,
  FileText,
  Warehouse,
  Info,
} from "lucide-react";

// Types
export type AdjustmentMode = "DEDUCT" | "ADD";
export type AdjustmentReasonType =
  | "DAMAGE" // ပိုးထိုး / ပျက်စီး
  | "LOSS" // သယ်ယူကိုင်တွယ်စဉ် လေလွင့်/အိတ်ပေါက်
  | "SHRINKAGE" // အစိုဓာတ်ကျ အလေးချိန်လျော့
  | "SURPLUS" // စာရင်းစစ်ဆေးစဉ် ပိုထွက်လာခြင်း
  | "RECOUNT"; // စာရင်းစစ်ဆေးမှု လက်ကျန်ညှိနှိုင်းခြင်း

export type StockCategory = "CONSIGNMENT" | "DEPOT_STOCK";

export interface StockAdjustmentRecord {
  id: string;
  adjustmentNo: string;
  date: string;
  stockCategory: StockCategory;
  lotNo: string;
  commodityName: string;
  ownerName: string; // တောင်သူအမည် သို့မဟုတ် "ပွဲရုံပိုင်"
  warehouseName: string;
  bayLocation: string;
  mode: AdjustmentMode;
  reasonType: AdjustmentReasonType;
  reasonDetail: string;
  previousBags: number;
  previousWeightViss: number;
  adjustedBags: number;
  adjustedWeightViss: number;
  resultingBags: number;
  resultingWeightViss: number;
  authorizedPerson: string;
  createdAt: string;
}

// Selectable Available Stock Option for adjustment
interface AvailableStockItem {
  id: string;
  lotNo: string;
  commodityName: string;
  stockCategory: StockCategory;
  ownerName: string;
  warehouseName: string;
  bayLocation: string;
  currentBags: number;
  currentWeightViss: number;
}

// Mock initial available stocks
const initialAvailableStocks: AvailableStockItem[] = [
  {
    id: "STK-001",
    lotNo: "LOT-2024-001",
    commodityName: "မတ်ပဲ (FAQ)",
    stockCategory: "CONSIGNMENT",
    ownerName: "ဦးစိုးနိုင် (ကျောက်ဆည်)",
    warehouseName: "ဂိုဒေါင် အမှတ် (၁)",
    bayLocation: "Zone A-01",
    currentBags: 120,
    currentWeightViss: 3600,
  },
  {
    id: "STK-002",
    lotNo: "LOT-2024-004",
    commodityName: "ပဲတီစိမ်း (အညာ ရွှေဝါ)",
    stockCategory: "CONSIGNMENT",
    ownerName: "ဒေါ်ခင်မာ (မြစ်သား)",
    warehouseName: "ဂိုဒေါင် အမှတ် (၂)",
    bayLocation: "Zone B-03",
    currentBags: 85,
    currentWeightViss: 2550,
  },
  {
    id: "STK-003",
    lotNo: "DPT-2024-012",
    commodityName: "နှမ်းနက် (စမုံနက်)",
    stockCategory: "DEPOT_STOCK",
    ownerName: "ပွဲရုံပိုင် စတော့",
    warehouseName: "ဂိုဒေါင် အမှတ် (၁)",
    bayLocation: "Zone A-04",
    currentBags: 160,
    currentWeightViss: 4800,
  },
  {
    id: "STK-004",
    lotNo: "LOT-2024-007",
    commodityName: "ပဲစင်းငုံနီ (သစ်)",
    stockCategory: "CONSIGNMENT",
    ownerName: "ဦးအုန်းမောင် (ဝမ်းတွင်း)",
    warehouseName: "ဂိုဒေါင် အမှတ် (၃)",
    bayLocation: "Zone C-01",
    currentBags: 45,
    currentWeightViss: 1350,
  },
  {
    id: "STK-005",
    lotNo: "DPT-2024-019",
    commodityName: "မြေပဲလုံးဆံ (အဖြူ)",
    stockCategory: "DEPOT_STOCK",
    ownerName: "ပွဲရုံပိုင် စတော့",
    warehouseName: "ဂိုဒေါင် အမှတ် (၂)",
    bayLocation: "Zone B-05",
    currentBags: 90,
    currentWeightViss: 2700,
  },
];

// Mock initial adjustment history
const initialAdjustments: StockAdjustmentRecord[] = [
  {
    id: "ADJ-001",
    adjustmentNo: "ADJ-2024-0032",
    date: "2024-11-16",
    stockCategory: "CONSIGNMENT",
    lotNo: "LOT-2024-001",
    commodityName: "မတ်ပဲ (FAQ)",
    ownerName: "ဦးစိုးနိုင် (ကျောက်ဆည်)",
    warehouseName: "ဂိုဒေါင် အမှတ် (၁)",
    bayLocation: "Zone A-01",
    mode: "DEDUCT",
    reasonType: "DAMAGE",
    reasonDetail:
      "အောက်ခံအိတ် ၂ အိတ် ပိုးထိုးပျက်စီး၍ စာရင်းမှ လျှော့ချနုတ်ပယ်",
    previousBags: 122,
    previousWeightViss: 3660,
    adjustedBags: 2,
    adjustedWeightViss: 60,
    resultingBags: 120,
    resultingWeightViss: 3600,
    authorizedPerson: "ဦးအောင်ကျော် (ဂိုဒေါင်မှူး)",
    createdAt: "10:30 AM",
  },
  {
    id: "ADJ-002",
    adjustmentNo: "ADJ-2024-0031",
    date: "2024-11-15",
    stockCategory: "DEPOT_STOCK",
    lotNo: "DPT-2024-012",
    commodityName: "နှမ်းနက် (စမုံနက်)",
    ownerName: "ပွဲရုံပိုင် စတော့",
    warehouseName: "ဂိုဒေါင် အမှတ် (၁)",
    bayLocation: "Zone A-04",
    mode: "DEDUCT",
    reasonType: "SHRINKAGE",
    reasonDetail:
      "သိုလှောင်သက်တမ်းကြာ၍ အစိုဓာတ်ကျကာ အလေးချိန်လျော့နည်းမှု ညှိနှိုင်းခြင်း",
    previousBags: 160,
    previousWeightViss: 4835,
    adjustedBags: 0,
    adjustedWeightViss: 35,
    resultingBags: 160,
    resultingWeightViss: 4800,
    authorizedPerson: "ဦးသန်းစိုး (မန်နေဂျာ)",
    createdAt: "03:15 PM",
  },
  {
    id: "ADJ-003",
    adjustmentNo: "ADJ-2024-0030",
    date: "2024-11-14",
    stockCategory: "CONSIGNMENT",
    lotNo: "LOT-2024-004",
    commodityName: "ပဲတီစိမ်း (အညာ ရွှေဝါ)",
    ownerName: "ဒေါ်ခင်မာ (မြစ်သား)",
    warehouseName: "ဂိုဒေါင် အမှတ် (၂)",
    bayLocation: "Zone B-03",
    mode: "ADD",
    reasonType: "SURPLUS",
    reasonDetail:
      "လစဉ် စာရင်းစစ်ဆေးစဉ် ဘေးပေါက်အိတ် ၁ အိတ် ပိုထွက်လာ၍ စတော့စာရင်း ဖြည့်စွက်",
    previousBags: 84,
    previousWeightViss: 2520,
    adjustedBags: 1,
    adjustedWeightViss: 30,
    resultingBags: 85,
    resultingWeightViss: 2550,
    authorizedPerson: "ဦးအောင်ကျော် (ဂိုဒေါင်မှူး)",
    createdAt: "11:45 AM",
  },
  {
    id: "ADJ-004",
    adjustmentNo: "ADJ-2024-0029",
    date: "2024-11-13",
    stockCategory: "DEPOT_STOCK",
    lotNo: "DPT-2024-019",
    commodityName: "မြေပဲလုံးဆံ (အဖြူ)",
    ownerName: "ပွဲရုံပိုင် စတော့",
    warehouseName: "ဂိုဒေါင် အမှတ် (၂)",
    bayLocation: "Zone B-05",
    mode: "DEDUCT",
    reasonType: "LOSS",
    reasonDetail:
      "အတွင်းပိုင်း ရွှေ့ပြောင်းသယ်ယူစဉ် အိတ်ပေါက်ထွက်ကျ အလေအလွင့်ဖြစ်မှု",
    previousBags: 91,
    previousWeightViss: 2730,
    adjustedBags: 1,
    adjustedWeightViss: 30,
    resultingBags: 90,
    resultingWeightViss: 2700,
    authorizedPerson: "ဦးသန်းစိုး (မန်နေဂျာ)",
    createdAt: "04:50 PM",
  },
];

export const StockAdjustments: React.FC = () => {
  // State
  const [adjustments, setAdjustments] =
    useState<StockAdjustmentRecord[]>(initialAdjustments);
  const [availableStocks] = useState<AvailableStockItem[]>(
    initialAvailableStocks
  );

  // Tabs & Filters
  const [activeTab, setActiveTab] = useState<"ALL" | "DEDUCT" | "ADD">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState("ALL");
  const [isWarehouseFilterOpen, setIsWarehouseFilterOpen] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState(
    initialAvailableStocks[0]?.id || ""
  );
  const [adjustmentMode, setAdjustmentMode] =
    useState<AdjustmentMode>("DEDUCT");
  const [reasonType, setReasonType] = useState<AdjustmentReasonType>("DAMAGE");
  const [reasonDetail, setReasonDetail] = useState("");
  const [adjustedBags, setAdjustedBags] = useState<number | "">(1);
  const [adjustedWeightViss, setAdjustedWeightViss] = useState<number | "">(30);
  const [authorizedPerson, setAuthorizedPerson] = useState(
    "ဦးအောင်ကျော် (ဂိုဒေါင်မှူး)"
  );
  const [errorMsg, setErrorMsg] = useState("");

  // Detail Modal State
  const [viewingRecord, setViewingRecord] =
    useState<StockAdjustmentRecord | null>(null);

  // Refs for outside click
  const filterRef = useRef<HTMLDivElement>(null);
  const searchInputId = useId();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsWarehouseFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Currently selected stock item for the modal
  const currentSelectedStock = availableStocks.find(
    (s) => s.id === selectedStockId
  );

  // Auto calculate new balance
  const numBags = typeof adjustedBags === "number" ? adjustedBags : 0;
  const numWeight =
    typeof adjustedWeightViss === "number" ? adjustedWeightViss : 0;

  const previewNewBags = currentSelectedStock
    ? adjustmentMode === "DEDUCT"
      ? Math.max(0, currentSelectedStock.currentBags - numBags)
      : currentSelectedStock.currentBags + numBags
    : 0;

  const previewNewWeight = currentSelectedStock
    ? adjustmentMode === "DEDUCT"
      ? Math.max(0, currentSelectedStock.currentWeightViss - numWeight)
      : currentSelectedStock.currentWeightViss + numWeight
    : 0;

  // Filter logic
  const filteredAdjustments = adjustments.filter((rec) => {
    // Tab filter
    if (activeTab === "DEDUCT" && rec.mode !== "DEDUCT") return false;
    if (activeTab === "ADD" && rec.mode !== "ADD") return false;

    // Warehouse filter
    if (
      selectedWarehouseFilter !== "ALL" &&
      rec.warehouseName !== selectedWarehouseFilter
    )
      return false;

    // Search query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchNo = rec.adjustmentNo.toLowerCase().includes(q);
      const matchLot = rec.lotNo.toLowerCase().includes(q);
      const matchCommodity = rec.commodityName.toLowerCase().includes(q);
      const matchOwner = rec.ownerName.toLowerCase().includes(q);
      const matchAuth = rec.authorizedPerson.toLowerCase().includes(q);
      const matchReason = rec.reasonDetail.toLowerCase().includes(q);
      return (
        matchNo ||
        matchLot ||
        matchCommodity ||
        matchOwner ||
        matchAuth ||
        matchReason
      );
    }

    return true;
  });

  // KPI Calculations
  const totalAdjustmentsCount = adjustments.length;
  const totalDeductedBags = adjustments
    .filter((a) => a.mode === "DEDUCT")
    .reduce((sum, a) => sum + a.adjustedBags, 0);
  const totalAddedBags = adjustments
    .filter((a) => a.mode === "ADD")
    .reduce((sum, a) => sum + a.adjustedBags, 0);
  const netVarianceBags = totalAddedBags - totalDeductedBags;

  // Unique warehouses for filter
  const warehousesList = Array.from(
    new Set(initialAvailableStocks.map((s) => s.warehouseName))
  );

  // Handle Create Adjustment
  const handleOpenModal = () => {
    setSelectedStockId(availableStocks[0]?.id || "");
    setAdjustmentMode("DEDUCT");
    setReasonType("DAMAGE");
    setReasonDetail("");
    setAdjustedBags(1);
    setAdjustedWeightViss(30);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleSubmitAdjustment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentSelectedStock) {
      setErrorMsg("ကျေးဇူးပြု၍ စတော့/Lot ရွေးချယ်ပေးပါ");
      return;
    }

    if (numBags < 0 || numWeight < 0) {
      setErrorMsg("အိတ်အရေအတွက်နှင့် ပိဿာချိန် မှန်ကန်စွာ ဖြည့်သွင်းပါ");
      return;
    }

    if (numBags === 0 && numWeight === 0) {
      setErrorMsg(
        "အနည်းဆုံး အိတ်ရေ (သို့) ပိဿာချိန် ပြောင်းလဲမှု ထည့်သွင်းပေးပါ"
      );
      return;
    }

    if (
      adjustmentMode === "DEDUCT" &&
      numBags > currentSelectedStock.currentBags
    ) {
      setErrorMsg(
        "နုတ်ပယ်လိုသော အိတ်အရေအတွက်သည် လက်ရှိရှိရင်းစွဲထက် မကျော်လွန်နိုင်ပါ"
      );
      return;
    }

    if (!reasonDetail.trim()) {
      setErrorMsg(
        "ကျေးဇူးပြု၍ ညှိနှိုင်းရသည့် အသေးစိတ် အကြောင်းပြချက် ထည့်သွင်းပါ"
      );
      return;
    }

    const newRecord: StockAdjustmentRecord = {
      id: `ADJ-${Date.now().toString().slice(-4)}`,
      adjustmentNo: `ADJ-2024-${String(adjustments.length + 33).padStart(
        4,
        "0"
      )}`,
      date: new Date().toISOString().split("T")[0],
      stockCategory: currentSelectedStock.stockCategory,
      lotNo: currentSelectedStock.lotNo,
      commodityName: currentSelectedStock.commodityName,
      ownerName: currentSelectedStock.ownerName,
      warehouseName: currentSelectedStock.warehouseName,
      bayLocation: currentSelectedStock.bayLocation,
      mode: adjustmentMode,
      reasonType,
      reasonDetail: reasonDetail.trim(),
      previousBags: currentSelectedStock.currentBags,
      previousWeightViss: currentSelectedStock.currentWeightViss,
      adjustedBags: numBags,
      adjustedWeightViss: numWeight,
      resultingBags: previewNewBags,
      resultingWeightViss: previewNewWeight,
      authorizedPerson: authorizedPerson.trim() || "ဂိုဒေါင်တာဝန်ခံ",
      createdAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setAdjustments([newRecord, ...adjustments]);
    setIsModalOpen(false);
  };

  const getReasonBadge = (type: AdjustmentReasonType) => {
    switch (type) {
      case "DAMAGE":
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            ပိုးထိုး/ပျက်စီး
          </span>
        );
      case "LOSS":
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            အိတ်ပေါက်/လေလွင့်
          </span>
        );
      case "SHRINKAGE":
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
            အစိုဓာတ်ကျ/လျော့
          </span>
        );
      case "SURPLUS":
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            စာရင်းပိုတွေ့ရှိ
          </span>
        );
      case "RECOUNT":
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            စာရင်းစစ်ညှိနှိုင်း
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="relative overflow-hidden py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
          ဂိုဒေါင် စတော့စာရင်း ညှိနှိုင်းပြင်ဆင်ခြင်း
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          သီးနှံအလေအလွင့်၊ ပျက်စီးမှုများ နုတ်ပယ်ခြင်း၊
          စာရင်းပိုဖြည့်စွက်ခြင်းနှင့် စာရင်းစစ် အိတ်ရေညှိနှိုင်းမှု
          စီမံခန့်ခွဲမှု
        </p>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Adjustments */}
        <div className="bg-card rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              စုစုပေါင်း ညှိနှိုင်းမှုမှတ်တမ်း
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
              <ClipboardCheck size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold text-slate-800 font-mono">
              {totalAdjustmentsCount.toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-500">ကြိမ်</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              လတ်တလော ညှိနှိုင်းပြင်ဆင်မှုများ
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>မှတ်တမ်းအပြည့်အစုံ</span>
            <span className="text-slate-700 font-bold">ပုံမှန်</span>
          </div>
        </div>

        {/* Card 2: Total Write-offs / Loss Bags */}
        <div className="bg-card rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              အလေအလွင့်/နုတ်ပယ် အိတ်
            </span>
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <TrendingDown size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold text-rose-600 font-mono">
              -{totalDeductedBags.toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-500">အိတ်</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              ပျက်စီး/လေလွင့်မှုကြောင့် လျှော့ချမှု
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-rose-600 font-medium">
            <span>နုတ်ပယ်စာရင်းစုစုပေါင်း</span>
            <span className="font-bold">Write-Off</span>
          </div>
        </div>

        {/* Card 3: Surplus / Additions */}
        <div className="bg-card rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              စာရင်းပို/ဖြည့်စွက် အိတ်
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold text-emerald-600 font-mono">
              +{totalAddedBags.toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-500">အိတ်</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              စာရင်းစစ် ပိုထွက်လာမှု ဖြည့်စွက်ခြင်း
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-600 font-medium">
            <span>ဖြည့်စွက်စာရင်းစုစုပေါင်း</span>
            <span className="font-bold">Surplus</span>
          </div>
        </div>

        {/* Card 4: Net Variance */}
        <div className="bg-card rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              အသားတင် အိတ်ရေ ပြောင်းလဲမှု
            </span>
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Boxes size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div
              className={`text-xl sm:text-2xl font-bold font-mono ${
                netVarianceBags < 0
                  ? "text-amber-600"
                  : netVarianceBags > 0
                  ? "text-emerald-600"
                  : "text-slate-800"
              }`}
            >
              {netVarianceBags > 0
                ? `+${netVarianceBags}`
                : netVarianceBags.toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-500">အိတ်</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              ဂိုဒေါင်လက်ကျန် စုစုပေါင်း ကွာဟချက်
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>ကွာဟချက် အခြေအနေ</span>
            <span className="text-slate-700 font-bold">Reconciled</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Action Strip */}
      <div className="space-y-3">
        {/* Top bar: Mode Tabs + Item count badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer ${
                activeTab === "ALL"
                  ? "bg-btn-color text-white border-btn-color"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              အားလုံး ({adjustments.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("DEDUCT")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer ${
                activeTab === "DEDUCT"
                  ? "bg-btn-color text-white border-btn-color"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              အလေအလွင့်/နုတ်ပယ် (
              {adjustments.filter((a) => a.mode === "DEDUCT").length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ADD")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer ${
                activeTab === "ADD"
                  ? "bg-btn-color text-white border-btn-color"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              စာရင်းပို/ဖြည့်စွက် (
              {adjustments.filter((a) => a.mode === "ADD").length})
            </button>
          </div>

          <div className="text-xs font-medium text-slate-500 self-end sm:self-auto">
            လက်ရှိဖော်ပြစာရင်း:{" "}
            <span className="font-bold text-slate-700">
              {filteredAdjustments.length}
            </span>{" "}
            စောင်
          </div>
        </div>

        {/* Card Container: Search, Warehouse Filter, New Adjustment Action */}
        <div className="bg-card p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <label htmlFor={searchInputId} className="sr-only">
                ရှာဖွေရန်
              </label>
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={15}
              />
              <input
                id={searchInputId}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ဘောက်ချာနံပါတ်၊ Lot နံပါတ်၊ သီးနှံ၊ တောင်သူ၊ အကြောင်းပြချက် ရှာရန်..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium focus:outline-hidden focus:border-[#547a95]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Warehouse Filter Popover */}
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => setIsWarehouseFilterOpen(!isWarehouseFilterOpen)}
                className={`w-full sm:w-auto px-3.5 py-2 rounded-full border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                  selectedWarehouseFilter !== "ALL"
                    ? "bg-slate-100 border-[#547a95] text-slate-800"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Filter size={14} />
                <span>
                  {selectedWarehouseFilter === "ALL"
                    ? "ဂိုဒေါင်အားလုံး"
                    : selectedWarehouseFilter}
                </span>
              </button>

              {isWarehouseFilterOpen && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl z-20 py-1.5 text-xs font-medium">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    ဂိုဒေါင်အလိုက် စစ်ထုတ်ရန်
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedWarehouseFilter("ALL");
                      setIsWarehouseFilterOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 cursor-pointer ${
                      selectedWarehouseFilter === "ALL"
                        ? "font-bold text-btn-color bg-slate-50"
                        : "text-slate-700"
                    }`}
                  >
                    ဂိုဒေါင်အားလုံး
                  </button>
                  {warehousesList.map((wh) => (
                    <button
                      key={wh}
                      type="button"
                      onClick={() => {
                        setSelectedWarehouseFilter(wh);
                        setIsWarehouseFilterOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 cursor-pointer ${
                        selectedWarehouseFilter === wh
                          ? "font-bold text-btn-color bg-slate-50"
                          : "text-slate-700"
                      }`}
                    >
                      {wh}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action: New Adjustment Button */}
          <button
            type="button"
            onClick={handleOpenModal}
            className="px-4 py-2 bg-btn-color hover:bg-btn-hover text-white rounded-full text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Plus size={16} />
            <span>စတော့ ညှိနှိုင်းမှုသစ် ပြုလုပ်မည်</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Responsive Dual View */}
      {filteredAdjustments.length === 0 ? (
        <div className="bg-card rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Boxes size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-700">
            ညှိနှိုင်းမှုမှတ်တမ်း ရှာမတွေ့ပါ
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            ရှာဖွေမှုစကားလုံး (သို့မဟုတ်) စစ်ထုတ်ထားမှုများကို ပြန်လည်စစ်ဆေးပါ
          </p>
        </div>
      ) : (
        <>
          {/* Mobile & Tablet Card View (< lg) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 lg:hidden">
            {filteredAdjustments.map((rec) => (
              <div
                key={rec.id}
                onClick={() => setViewingRecord(rec)}
                className="bg-card rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 cursor-pointer hover:border-slate-300"
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {rec.adjustmentNo}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({rec.date})
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5">
                      {rec.commodityName}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      Lot:{" "}
                      <span className="font-mono font-semibold">
                        {rec.lotNo}
                      </span>{" "}
                      ({rec.ownerName})
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {rec.mode === "DEDUCT" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <ArrowDownRight size={12} />
                        နုတ်ပယ်
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ArrowUpRight size={12} />
                        ဖြည့်စွက်
                      </span>
                    )}
                    {getReasonBadge(rec.reasonType)}
                  </div>
                </div>

                {/* Warehouse Location */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <Warehouse size={13} className="text-slate-400" />
                    <span>{rec.warehouseName}</span>
                  </div>
                  <span className="font-mono text-slate-500 font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                    {rec.bayLocation}
                  </span>
                </div>

                {/* Numbers calculation strip */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <div className="text-[10px] text-slate-400 font-medium">
                      မူလလက်ကျန်
                    </div>
                    <div className="font-mono font-bold text-slate-700">
                      {rec.previousBags} အိတ်
                    </div>
                    <div className="font-mono text-[10px] text-slate-400">
                      {rec.previousWeightViss.toLocaleString()} ပိဿာ
                    </div>
                  </div>
                  <div
                    className={`p-2 rounded-xl ${
                      rec.mode === "DEDUCT"
                        ? "bg-rose-50 text-rose-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    <div className="text-[10px] opacity-75 font-medium">
                      {rec.mode === "DEDUCT" ? "နုတ်ပယ်မှု" : "ဖြည့်စွက်မှု"}
                    </div>
                    <div className="font-mono font-bold">
                      {rec.mode === "DEDUCT"
                        ? `-${rec.adjustedBags}`
                        : `+${rec.adjustedBags}`}{" "}
                      အိတ်
                    </div>
                    <div className="font-mono text-[10px]">
                      {rec.mode === "DEDUCT"
                        ? `-${rec.adjustedWeightViss}`
                        : `+${rec.adjustedWeightViss}`}{" "}
                      ပိဿာ
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <div className="text-[10px] text-slate-400 font-medium">
                      ညှိပြီးလက်ကျန်
                    </div>
                    <div className="font-mono font-bold text-[#547a95]">
                      {rec.resultingBags} အိတ်
                    </div>
                    <div className="font-mono text-[10px] text-slate-400">
                      {rec.resultingWeightViss.toLocaleString()} ပိဿာ
                    </div>
                  </div>
                </div>

                {/* Footer Reason & Authorized Person */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div
                    className="truncate max-w-[200px]"
                    title={rec.reasonDetail}
                  >
                    {rec.reasonDetail}
                  </div>
                  <div className="flex items-center gap-1 font-medium text-slate-700">
                    <UserCheck size={12} className="text-slate-400" />
                    <span>{rec.authorizedPerson.split(" ")[0]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= lg) */}
          <div className="hidden lg:block bg-card rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">ဘောက်ချာ / ရက်စွဲ</th>
                    <th className="py-3 px-4">Lot & သီးနှံအမည်</th>
                    <th className="py-3 px-4">ဂိုဒေါင် & နေရာ</th>
                    <th className="py-3 px-4">အမျိုးအစား & အကြောင်းပြချက်</th>
                    <th className="py-3 px-4 text-right">မူလ လက်ကျန်</th>
                    <th className="py-3 px-4 text-right">
                      ညှိနှိုင်းမှု (အိတ်/ပိဿာ)
                    </th>
                    <th className="py-3 px-4 text-right">ညှိပြီး လက်ကျန်</th>
                    <th className="py-3 px-4 text-center">ခွင့်ပြုသူ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredAdjustments.map((rec) => (
                    <tr
                      key={rec.id}
                      onClick={() => setViewingRecord(rec)}
                      className="hover:bg-slate-50/70 cursor-pointer"
                    >
                      {/* Voucher & Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-800">
                          {rec.adjustmentNo}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {rec.date} ({rec.createdAt})
                        </div>
                      </td>

                      {/* Lot & Commodity */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">
                          {rec.commodityName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {rec.lotNo} •{" "}
                          <span className="font-sans font-medium">
                            {rec.ownerName}
                          </span>
                        </div>
                      </td>

                      {/* Warehouse & Bay */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-semibold">
                          {rec.warehouseName}
                        </div>
                        <div className="inline-block mt-0.5 font-mono text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {rec.bayLocation}
                        </div>
                      </td>

                      {/* Reason & Type */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 mb-1">
                          {rec.mode === "DEDUCT" ? (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <ArrowDownRight size={11} />
                              နုတ်ပယ်
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <ArrowUpRight size={11} />
                              ဖြည့်စွက်
                            </span>
                          )}
                          {getReasonBadge(rec.reasonType)}
                        </div>
                        <div
                          className="text-[11px] text-slate-500 max-w-[200px] truncate"
                          title={rec.reasonDetail}
                        >
                          {rec.reasonDetail}
                        </div>
                      </td>

                      {/* Previous */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-mono font-bold text-slate-700">
                          {rec.previousBags} အိတ်
                        </div>
                        <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                          {rec.previousWeightViss.toLocaleString()} ပိဿာ
                        </div>
                      </td>

                      {/* Adjustment */}
                      <td className="py-3.5 px-4 text-right">
                        <div
                          className={`font-mono font-bold ${
                            rec.mode === "DEDUCT"
                              ? "text-rose-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {rec.mode === "DEDUCT"
                            ? `-${rec.adjustedBags}`
                            : `+${rec.adjustedBags}`}{" "}
                          အိတ်
                        </div>
                        <div
                          className={`font-mono text-[11px] mt-0.5 ${
                            rec.mode === "DEDUCT"
                              ? "text-rose-500"
                              : "text-emerald-500"
                          }`}
                        >
                          {rec.mode === "DEDUCT"
                            ? `-${rec.adjustedWeightViss}`
                            : `+${rec.adjustedWeightViss}`}{" "}
                          ပိဿာ
                        </div>
                      </td>

                      {/* Resulting */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-mono font-bold text-[#547a95]">
                          {rec.resultingBags} အိတ်
                        </div>
                        <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                          {rec.resultingWeightViss.toLocaleString()} ပိဿာ
                        </div>
                      </td>

                      {/* Authorized Person */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-50 px-2 py-1 rounded-full border border-slate-200">
                          <UserCheck size={12} className="text-slate-400" />
                          <span>{rec.authorizedPerson}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* MODAL: New Stock Adjustment */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-card w-full max-w-2xl rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xl max-h-[92vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-btn-color text-white flex items-center justify-center font-bold">
                  <Boxes size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    စတော့စာရင်း ညှိနှိုင်းပြင်ဆင်ခြင်းအသစ်
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    အလေအလွင့်/ပျက်စီးမှု နုတ်ပယ်ခြင်း (သို့) စာရင်းစစ်ပိုထွက်မှု
                    ဖြည့်စွက်ခြင်း
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmitAdjustment}
              className="mt-4 space-y-4 text-xs font-semibold"
            >
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Adjustment Direction Switcher: Deduct vs Add */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                  ညှိနှိုင်းမှု ပုံစံ ရွေးချယ်ပါ *
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustmentMode("DEDUCT");
                      setReasonType("DAMAGE");
                    }}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer ${
                      adjustmentMode === "DEDUCT"
                        ? "bg-rose-700 text-white shadow-xs"
                        : "text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <ArrowDownRight size={15} />
                    <span>၁။ အလေအလွင့် / နုတ်ပယ်မည် (Write-Off)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustmentMode("ADD");
                      setReasonType("SURPLUS");
                    }}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer ${
                      adjustmentMode === "ADD"
                        ? "bg-emerald-700 text-white shadow-xs"
                        : "text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <ArrowUpRight size={15} />
                    <span>၂။ စာရင်းပို / ဖြည့်စွက်မည် (Surplus)</span>
                  </button>
                </div>
              </div>

              {/* Stock / Lot Selection */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    ပြင်ဆင်လိုသော သီးနှံစတော့ / Lot ရွေးချယ်ပါ *
                  </label>
                  <select
                    value={selectedStockId}
                    onChange={(e) => setSelectedStockId(e.target.value)}
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white cursor-pointer"
                  >
                    {availableStocks.map((stk) => (
                      <option key={stk.id} value={stk.id}>
                        [{stk.lotNo}] {stk.commodityName} - {stk.ownerName} (
                        {stk.warehouseName} / {stk.bayLocation}) - လက်ကျန်:{" "}
                        {stk.currentBags} အိတ် (
                        {stk.currentWeightViss.toLocaleString()} ပိဿာ)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Stock Summary Card */}
                {currentSelectedStock && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        စတော့ပိုင်ဆိုင်မှု
                      </span>
                      <span className="font-bold text-slate-800">
                        {currentSelectedStock.stockCategory === "CONSIGNMENT"
                          ? "တောင်သူ့အပ်ကုန်"
                          : "ပွဲရုံပိုင်"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        တည်နေရာ
                      </span>
                      <span className="font-bold text-slate-800">
                        {currentSelectedStock.bayLocation}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        လက်ရှိ အိတ်ရေ
                      </span>
                      <span className="font-mono font-bold text-slate-800">
                        {currentSelectedStock.currentBags} အိတ်
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        လက်ရှိ ပိဿာချိန်
                      </span>
                      <span className="font-mono font-bold text-slate-800">
                        {currentSelectedStock.currentWeightViss.toLocaleString()}{" "}
                        ပိဿာ
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Adjustment Reason & Quantity inputs */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Reason Type */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      အကြောင်းပြချက် အမျိုးအစား *
                    </label>
                    <select
                      value={reasonType}
                      onChange={(e) =>
                        setReasonType(e.target.value as AdjustmentReasonType)
                      }
                      className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white cursor-pointer"
                    >
                      {adjustmentMode === "DEDUCT" ? (
                        <>
                          <option value="DAMAGE">
                            ပိုးထိုး / ပျက်စီးခြင်း (Damage / Spoilage)
                          </option>
                          <option value="LOSS">
                            သယ်ယူကိုင်တွယ်စဉ် လေလွင့်/အိတ်ပေါက် (Handling Loss)
                          </option>
                          <option value="SHRINKAGE">
                            အစိုဓာတ်ကျ အလေးချိန်လျော့နည်းခြင်း (Moisture Loss)
                          </option>
                          <option value="RECOUNT">
                            စာရင်းစစ်ဆေးမှု လက်ကျန်လျော့နည်း (Recount Variance)
                          </option>
                        </>
                      ) : (
                        <>
                          <option value="SURPLUS">
                            စာရင်းစစ်ဆေးစဉ် ပိုထွက်လာခြင်း (Physical Count
                            Surplus)
                          </option>
                          <option value="RECOUNT">
                            စာရင်းစစ်ဆေးမှု လက်ကျန်ညှိနှိုင်းခြင်း (Recount
                            Reconciliation)
                          </option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Authorized Person */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      စစ်ဆေးခွင့်ပြုသူ အမည်/ရာထူး *
                    </label>
                    <input
                      type="text"
                      value={authorizedPerson}
                      onChange={(e) => setAuthorizedPerson(e.target.value)}
                      placeholder="ဥပမာ- ဦးအောင်ကျော် (ဂိုဒေါင်မှူး)"
                      className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                      required
                    />
                  </div>
                </div>

                {/* Adjusted Bags & Weight */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      {adjustmentMode === "DEDUCT"
                        ? "နုတ်ပယ်မည့် အိတ်အရေအတွက်"
                        : "ဖြည့်စွက်မည့် အိတ်အရေအတွက်"}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max={
                          adjustmentMode === "DEDUCT"
                            ? currentSelectedStock?.currentBags
                            : undefined
                        }
                        value={adjustedBags}
                        onChange={(e) =>
                          setAdjustedBags(
                            e.target.value === ""
                              ? ""
                              : Math.max(0, parseInt(e.target.value) || 0)
                          )
                        }
                        className="w-full text-xs font-bold font-mono p-2.5 pr-12 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                        placeholder="0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none">
                        အိတ်
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      {adjustmentMode === "DEDUCT"
                        ? "နုတ်ပယ်မည့် ပိဿာချိန်"
                        : "ဖြည့်စွက်မည့် ပိဿာချိန်"}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={adjustedWeightViss}
                        onChange={(e) =>
                          setAdjustedWeightViss(
                            e.target.value === ""
                              ? ""
                              : Math.max(0, parseFloat(e.target.value) || 0)
                          )
                        }
                        className="w-full text-xs font-bold font-mono p-2.5 pr-14 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                        placeholder="0.0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none">
                        ပိဿာ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reason detail textarea */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    အသေးစိတ် အကြောင်းပြချက် မှတ်ချက် *
                  </label>
                  <textarea
                    rows={2}
                    value={reasonDetail}
                    onChange={(e) => setReasonDetail(e.target.value)}
                    placeholder="ဥပမာ - မိုးတွင်း သိုလှောင်စဉ် အစိုဓာတ်ထိ၍ အောက်ခံအိတ် ၂ အိတ် ပျက်စီးသွားသဖြင့် စာရင်းမှ နုတ်ပယ်ခြင်း"
                    className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                    required
                  />
                </div>
              </div>

              {/* Dynamic Live Balance Preview Box */}
              <div className="p-3.5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Info size={14} className="text-[#547a95]" />
                    ညှိနှိုင်းပြီးနောက် စတော့လက်ကျန် အခြေအနေကြိုတင်ကြည့်ရှုခြင်း
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-semibold">
                      ရှိရင်းစွဲ လက်ကျန်
                    </div>
                    <div className="font-mono font-bold text-slate-700 mt-0.5">
                      {currentSelectedStock?.currentBags || 0} အိတ်
                    </div>
                    <div className="font-mono text-[10px] text-slate-400">
                      {(
                        currentSelectedStock?.currentWeightViss || 0
                      ).toLocaleString()}{" "}
                      ပိဿာ
                    </div>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border ${
                      adjustmentMode === "DEDUCT"
                        ? "bg-rose-50 border-rose-200 text-rose-700"
                        : "bg-emerald-50 border-emerald-200 text-emerald-700"
                    }`}
                  >
                    <div className="text-[10px] opacity-80 font-semibold">
                      {adjustmentMode === "DEDUCT"
                        ? "နုတ်ပယ်မည့် ပမာဏ"
                        : "ဖြည့်စွက်မည့် ပမာဏ"}
                    </div>
                    <div className="font-mono font-bold mt-0.5">
                      {adjustmentMode === "DEDUCT"
                        ? `-${numBags}`
                        : `+${numBags}`}{" "}
                      အိတ်
                    </div>
                    <div className="font-mono text-[10px]">
                      {adjustmentMode === "DEDUCT"
                        ? `-${numWeight}`
                        : `+${numWeight}`}{" "}
                      ပိဿာ
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-[#547a95] font-semibold">
                      ပြင်ဆင်ပြီး လက်ကျန်သစ်
                    </div>
                    <div className="font-mono font-bold text-[#547a95] mt-0.5">
                      {previewNewBags} အိတ်
                    </div>
                    <div className="font-mono text-[10px] text-slate-500">
                      {previewNewWeight.toLocaleString()} ပိဿာ
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer text-xs"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-btn-color hover:bg-btn-hover text-white font-bold cursor-pointer text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 size={15} />
                  <span>စတော့ညှိနှိုင်းမှု အတည်ပြုသိမ်းဆည်းမည်</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL: View Single Adjustment Record */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-card w-full max-w-lg rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="text-[#547a95]" size={18} />
                <h3 className="font-bold text-slate-800 text-base">
                  စတော့ညှိနှိုင်းမှု အသေးစိတ်မှတ်တမ်း
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">
                    ဘောက်ချာနံပါတ်
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {viewingRecord.adjustmentNo}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">
                    ရက်စွဲနှင့် အချိန်
                  </span>
                  <span className="font-mono font-medium text-slate-700">
                    {viewingRecord.date} ({viewingRecord.createdAt})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">သီးနှံအမည်</span>
                  <span className="font-bold text-slate-800">
                    {viewingRecord.commodityName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">
                    Lot / ပိုင်ဆိုင်မှု
                  </span>
                  <span className="font-mono text-slate-700 font-semibold">
                    {viewingRecord.lotNo} ({viewingRecord.ownerName})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">
                    ဂိုဒေါင် တည်နေရာ
                  </span>
                  <span className="text-slate-700 font-medium">
                    {viewingRecord.warehouseName} ({viewingRecord.bayLocation})
                  </span>
                </div>
              </div>

              {/* Adjustment Change Comparison */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">
                    ညှိနှိုင်းမှု အမျိုးအစား
                  </span>
                  {getReasonBadge(viewingRecord.reasonType)}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <div className="text-[10px] text-slate-400">မူလလက်ကျန်</div>
                    <div className="font-mono font-bold text-slate-700">
                      {viewingRecord.previousBags} အိတ်
                    </div>
                    <div className="font-mono text-[10px] text-slate-400">
                      {viewingRecord.previousWeightViss.toLocaleString()} ပိဿာ
                    </div>
                  </div>
                  <div
                    className={`p-2 rounded-xl ${
                      viewingRecord.mode === "DEDUCT"
                        ? "bg-rose-50 text-rose-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    <div className="text-[10px] opacity-80">
                      {viewingRecord.mode === "DEDUCT"
                        ? "နုတ်ပယ်မှု"
                        : "ဖြည့်စွက်မှု"}
                    </div>
                    <div className="font-mono font-bold">
                      {viewingRecord.mode === "DEDUCT"
                        ? `-${viewingRecord.adjustedBags}`
                        : `+${viewingRecord.adjustedBags}`}{" "}
                      အိတ်
                    </div>
                    <div className="font-mono text-[10px]">
                      {viewingRecord.mode === "DEDUCT"
                        ? `-${viewingRecord.adjustedWeightViss}`
                        : `+${viewingRecord.adjustedWeightViss}`}{" "}
                      ပိဿာ
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <div className="text-[10px] text-[#547a95]">
                      ညှိပြီးလက်ကျန်
                    </div>
                    <div className="font-mono font-bold text-[#547a95]">
                      {viewingRecord.resultingBags} အိတ်
                    </div>
                    <div className="font-mono text-[10px] text-slate-400">
                      {viewingRecord.resultingWeightViss.toLocaleString()} ပိဿာ
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes & Authority */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div>
                  <span className="text-slate-500 font-medium block mb-1">
                    အသေးစိတ် အကြောင်းပြချက်
                  </span>
                  <p className="text-slate-700 font-medium bg-white p-2.5 rounded-xl border border-slate-200 leading-relaxed">
                    {viewingRecord.reasonDetail}
                  </p>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500 font-medium">
                    စစ်ဆေးခွင့်ပြုသူ
                  </span>
                  <span className="font-bold text-slate-800">
                    {viewingRecord.authorizedPerson}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewingRecord(null)}
                className="px-5 py-2 rounded-full bg-btn-color hover:bg-btn-hover text-white text-xs font-bold cursor-pointer"
              >
                ပိတ်မည်
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockAdjustments;
