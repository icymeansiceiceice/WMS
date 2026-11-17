import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Warehouse,
  Package,
  Search,
  ChevronDown,
  X,
  Scale,
  ArrowLeftRight,
  Eye,
  Tractor,
  Droplets,
  Boxes,
} from "lucide-react";

// ================= TYPES =================
export type StockType = "CONSIGNMENT" | "DEPOT_STOCK";
export type LotStatus = "ACTIVE" | "LOW_STOCK" | "DEPLETED";

export interface InventoryLot {
  id: string;
  lotNumber: string; // ဥပမာ - LOT-2603-01
  stockType: StockType;
  commodityId: string;
  commodityName: string;
  farmerId?: string;
  farmerName?: string;
  farmerPhone?: string;
  farmerTownship?: string;
  warehouseId: string;
  warehouseName: string;
  bayLocation: string; // ဥပမာ - Bay A-2
  initialBags: number; // အဝင်အိတ်ရေ
  currentBags: number; // လက်ကျန်အိတ်ရေ
  netWeightViss: number; // အသားတင် ပိဿာ
  tinsCount: number; // တင်းအရေအတွက်
  moisturePercent: number; // အစိုဓာတ် (%)
  inwardDate: string; // အဝင်ရက်စွဲ
  status: LotStatus;
  notes?: string;
}

export interface WarehouseLocation {
  id: string;
  name: string;
  code: string;
  capacityBags: number;
  currentBags: number;
  managerName: string;
  phone: string;
}

// ================= MOCK DATA =================
const MOCK_WAREHOUSES: WarehouseLocation[] = [
  {
    id: "WH-01",
    name: "WH-01 (ပင်မစပါးကျီ)",
    code: "WH-A",
    capacityBags: 20000,
    currentBags: 14200,
    managerName: "ဦးတင်မောင်",
    phone: "09-450011223",
  },
  {
    id: "WH-02",
    name: "WH-02 (ပဲသိုလှောင်ရုံ)",
    code: "WH-B",
    capacityBags: 15000,
    currentBags: 10850,
    managerName: "ဦးလှဝင်း",
    phone: "09-250088991",
  },
  {
    id: "WH-03",
    name: "WH-03 (အလယ်ရုံ)",
    code: "WH-C",
    capacityBags: 10000,
    currentBags: 5400,
    managerName: "ကိုဝင်းနိုင်",
    phone: "09-790044556",
  },
  {
    id: "WH-COLD",
    name: "WH-COLD (အအေးခန်း ကုန်လှောင်ရုံ)",
    code: "WH-D",
    capacityBags: 5000,
    currentBags: 2100,
    managerName: "ဒေါ်အေးသီတာ",
    phone: "09-420066778",
  },
];

const INITIAL_LOTS: InventoryLot[] = [
  {
    id: "LOT-001",
    lotNumber: "LOT-2603-01",
    stockType: "CONSIGNMENT",
    commodityId: "C-01",
    commodityName: "မတ်ပဲ (FAQ)",
    farmerId: "FAR-101",
    farmerName: "ဦးလှမောင်",
    farmerPhone: "09-450011223",
    farmerTownship: "ကျောက်ဆည် (အေးမြရွာ)",
    warehouseId: "WH-02",
    warehouseName: "WH-02 (ပဲသိုလှောင်ရုံ)",
    bayLocation: "Bay B-01",
    initialBags: 100,
    currentBags: 60,
    netWeightViss: 1200,
    tinsCount: 60,
    moisturePercent: 12.5,
    inwardDate: "၂၀၂၆-၁၁-၁၀",
    status: "ACTIVE",
    notes: "တောင်သူအပ်ကုန် ဈေးစောင့်ဆဲ။ အစိုဓာတ်ပုံမှန်။",
  },
  {
    id: "LOT-002",
    lotNumber: "LOT-2603-02",
    stockType: "CONSIGNMENT",
    commodityId: "C-03",
    commodityName: "နှမ်းနက် (စမုံ)",
    farmerId: "FAR-102",
    farmerName: "ဦးဘကြည်",
    farmerPhone: "09-790088990",
    farmerTownship: "ဒေးဒရဲမြို့နယ်",
    warehouseId: "WH-02",
    warehouseName: "WH-02 (ပဲသိုလှောင်ရုံ)",
    bayLocation: "Bay B-04",
    initialBags: 80,
    currentBags: 45,
    netWeightViss: 675,
    tinsCount: 45,
    moisturePercent: 11.0,
    inwardDate: "၂၀၂၆-၁၁-၁၁",
    status: "ACTIVE",
    notes: "အစိုဓာတ်ကောင်း၊ အိတ်သန့်။",
  },
  {
    id: "LOT-003",
    lotNumber: "LOT-2603-03",
    stockType: "CONSIGNMENT",
    commodityId: "C-05",
    commodityName: "စပါး (ရွှေဘိုပေါ်ဆန်း)",
    farmerId: "FAR-103",
    farmerName: "ဦးအေးမောင်",
    farmerPhone: "09-420011223",
    farmerTownship: "ရွှေဘိုမြို့နယ်",
    warehouseId: "WH-01",
    warehouseName: "WH-01 (ပင်မစပါးကျီ)",
    bayLocation: "Bay A-03",
    initialBags: 200,
    currentBags: 120,
    netWeightViss: 2400,
    tinsCount: 120,
    moisturePercent: 13.8,
    inwardDate: "၂၀၂၆-၁၁-၁၂",
    status: "ACTIVE",
    notes: "တောင်သူပိုင် အပ်ကုန် စပါးကျီ အမှတ် ၃ တွင် ထားရှိ။",
  },
  {
    id: "LOT-004",
    lotNumber: "LOT-DEPOT-101",
    stockType: "DEPOT_STOCK",
    commodityId: "C-04",
    commodityName: "ပဲတီစိမ်း (ရွှေဝါ)",
    warehouseId: "WH-02",
    warehouseName: "WH-02 (ပဲသိုလှောင်ရုံ)",
    bayLocation: "Bay B-08",
    initialBags: 150,
    currentBags: 150,
    netWeightViss: 3000,
    tinsCount: 150,
    moisturePercent: 12.0,
    inwardDate: "၂၀၂၆-၁၁-၁၄",
    status: "ACTIVE",
    notes: "ပွဲရုံပိုင် ဒိုင်ပြတ်တန်းဝယ်ယူထားသော စတော့။",
  },
  {
    id: "LOT-005",
    lotNumber: "LOT-DEPOT-102",
    stockType: "DEPOT_STOCK",
    commodityId: "C-02",
    commodityName: "ပဲစင်းငုံ နီ (RC)",
    warehouseId: "WH-03",
    warehouseName: "WH-03 (အလယ်ရုံ)",
    bayLocation: "Bay C-02",
    initialBags: 80,
    currentBags: 15,
    netWeightViss: 300,
    tinsCount: 15,
    moisturePercent: 11.5,
    inwardDate: "၂၀၂၆-၁၁-၀၈",
    status: "LOW_STOCK",
    notes: "လက်ကျန်နည်းနေပြီ ဖြစ်သည်။",
  },
  {
    id: "LOT-006",
    lotNumber: "LOT-2603-04",
    stockType: "CONSIGNMENT",
    commodityId: "C-06",
    commodityName: "မြေပဲဆံ (လုံးဆံ)",
    farmerId: "FAR-104",
    farmerName: "ဦးတင်ဝင်း",
    farmerPhone: "09-400123456",
    farmerTownship: "ဖျာပုံမြို့နယ်",
    warehouseId: "WH-COLD",
    warehouseName: "WH-COLD (အအေးခန်း ကုန်လှောင်ရုံ)",
    bayLocation: "Cold-Room 1",
    initialBags: 50,
    currentBags: 50,
    netWeightViss: 1500,
    tinsCount: 0,
    moisturePercent: 9.5,
    inwardDate: "၂၀၂၆-၁၁-၁၅",
    status: "ACTIVE",
    notes: "အအေးခန်းတွင် သိုလှောင်ထားသော မြေပဲဆန်လုံးဆန်။",
  },
];

export const WarehouseInventory: React.FC = () => {
  // ================= STATE =================
  const [lots, setLots] = useState<InventoryLot[]>(INITIAL_LOTS);
  const [warehouses, setWarehouses] =
    useState<WarehouseLocation[]>(MOCK_WAREHOUSES);
  const [activeTab, setActiveTab] = useState<"ALL" | StockType>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("ALL");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Modal 1: Stock Transfer Modal (ဂိုဒေါင်ကူးပြောင်းခြင်း)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferLotId, setTransferLotId] = useState("");
  const [targetWarehouseId, setTargetWarehouseId] = useState("");
  const [targetBay, setTargetBay] = useState("");
  const [transferBagCount, setTransferBagCount] = useState<number>(0);
  const [transferNotes, setTransferNotes] = useState("");

  // Modal 2: Lot Detail / Inspection Modal
  const [selectedLotDetail, setSelectedLotDetail] =
    useState<InventoryLot | null>(null);

  // Selected Lot for Transfer
  const selectedTransferLot = useMemo(() => {
    return lots.find((l) => l.id === transferLotId) || lots[0] || null;
  }, [lots, transferLotId]);

  // Click outside listener for warehouse filter popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    if (isFilterOpen)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFilterOpen]);

  // Open Transfer Modal
  const handleOpenTransferModal = (lot?: InventoryLot) => {
    const defaultLot = lot || lots[0];
    setTransferLotId(defaultLot?.id || "");
    // Default target warehouse different from source
    const otherWh =
      warehouses.find((w) => w.id !== defaultLot?.warehouseId) || warehouses[0];
    setTargetWarehouseId(otherWh.id);
    setTargetBay("");
    setTransferBagCount(defaultLot?.currentBags || 10);
    setTransferNotes("");
    setIsTransferModalOpen(true);
  };

  // Submit Stock Transfer
  const handleSubmitTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransferLot) return;

    const count = Number(transferBagCount) || 0;
    if (count <= 0 || count > selectedTransferLot.currentBags) {
      alert("ရွှေ့ပြောင်းမည့် အိတ်အရေအတွက် မှန်ကန်မှု မရှိပါ");
      return;
    }

    const targetWh = warehouses.find((w) => w.id === targetWarehouseId);
    if (!targetWh) return;

    // Update Lot location & bag counts
    setLots((prev) =>
      prev.map((lot) => {
        if (lot.id !== selectedTransferLot.id) return lot;
        return {
          ...lot,
          warehouseId: targetWh.id,
          warehouseName: targetWh.name,
          bayLocation: targetBay.trim() || lot.bayLocation,
          notes: transferNotes.trim()
            ? `${lot.notes || ""} [${
                targetWh.code
              } သို့ ${count} အိတ် ကူးပြောင်း]`
            : lot.notes,
        };
      })
    );

    // Update warehouse totals
    setWarehouses((prev) =>
      prev.map((wh) => {
        if (wh.id === selectedTransferLot.warehouseId) {
          return { ...wh, currentBags: Math.max(0, wh.currentBags - count) };
        }
        if (wh.id === targetWarehouseId) {
          return { ...wh, currentBags: wh.currentBags + count };
        }
        return wh;
      })
    );

    setIsTransferModalOpen(false);
  };

  // ================= COMPUTED METRICS =================
  const kpiStats = useMemo(() => {
    const totalBags = lots.reduce((sum, l) => sum + l.currentBags, 0);
    const consignmentBags = lots
      .filter((l) => l.stockType === "CONSIGNMENT")
      .reduce((sum, l) => sum + l.currentBags, 0);
    const depotBags = lots
      .filter((l) => l.stockType === "DEPOT_STOCK")
      .reduce((sum, l) => sum + l.currentBags, 0);

    const totalCapacity = warehouses.reduce(
      (sum, w) => sum + w.capacityBags,
      0
    );
    const overallUtilizationPercent =
      totalCapacity > 0 ? Math.round((totalBags / totalCapacity) * 100) : 0;

    return {
      totalBags,
      consignmentBags,
      depotBags,
      totalCapacity,
      overallUtilizationPercent,
    };
  }, [lots, warehouses]);

  // Filtered Lots
  const filteredLots = useMemo(() => {
    return lots.filter((item) => {
      const matchType = activeTab === "ALL" || item.stockType === activeTab;
      const matchWarehouse =
        warehouseFilter === "ALL" || item.warehouseId === warehouseFilter;
      const matchSearch =
        item.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.commodityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.warehouseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.bayLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.farmerName &&
          item.farmerName.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchType && matchWarehouse && matchSearch;
    });
  }, [lots, activeTab, warehouseFilter, searchTerm]);

  return (
    <div className="space-y-4 sm:space-y-6 select-none pb-3">
      {/* ================= 1. GREETING & HEADER ================= */}
      <div className="relative overflow-hidden py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">
          ဂိုဒေါင် ကုန်လက်ကျန်နှင့် အပ်ကုန် Lot များ (Warehouse Inventory &
          Lots)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 sm:mt-3 max-w-xl leading-relaxed">
          တောင်သူ့အပ်ကုန် Lot များ၊ ပွဲရုံပိုင် ကုန်လက်ကျန်များနှင့်
          သိုလှောင်ရုံအလိုက် နေရာယူထားမှု အခြေအနေများ
        </p>
      </div>

      {/* ================= 2. 4 KPI SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {/* Card 1: စုစုပေါင်း ကုန်လက်ကျန်အိတ် */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              စုစုပေါင်း ကုန်လက်ကျန်
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Boxes size={18} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {kpiStats.totalBags.toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-500">အိတ်</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              ဂိုဒေါင် ၄ လုံးရှိ စုစုပေါင်းလက်ကျန်
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
            <span>စတော့လက်ကျန် စစ်ဆေးပြီး</span>
            <span className="text-[11px] text-slate-400 font-normal truncate ml-2">
              ယနေ့အထိ
            </span>
          </div>
        </div>

        {/* Card 2: တောင်သူ့အပ်ကုန် စတော့ */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              တောင်သူ့အပ်ကုန် (Lots)
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Tractor size={18} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {kpiStats.consignmentBags.toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-500">အိတ်</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              စုစုပေါင်း၏{" "}
              {Math.round(
                (kpiStats.consignmentBags / (kpiStats.totalBags || 1)) * 100
              )}
              % (တောင်သူပိုင်)
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-purple-700 font-bold">
            <span>ဈေးစောင့် ကုန်စည်များ</span>
            <span className="text-[11px] text-slate-400 font-normal truncate ml-2">
              ပွဲခစား
            </span>
          </div>
        </div>

        {/* Card 3: ပွဲရုံပိုင် လက်ကျန်စတော့ */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              ပွဲရုံပိုင် စတော့ (Free Stock)
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Package size={18} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {kpiStats.depotBags.toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-500">အိတ်</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              ဒိုင်ပြတ်ဝယ်ယူထားသော ပွဲရုံပိုင်
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-bold">
            <span>ချက်ချင်းရောင်းချနိုင်</span>
            <span className="text-[11px] text-slate-400 font-normal truncate ml-2">
              ပွဲရုံအရောင်း
            </span>
          </div>
        </div>

        {/* Card 4: ဂိုဒေါင် ဆံ့ဝင်ဆံ့နှုန်း */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              ဂိုဒေါင် ဆံ့ဝင်ဆံ့နှုန်း
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Warehouse size={18} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {kpiStats.overallUtilizationPercent}%{" "}
              <span className="text-xs font-normal text-slate-500">
                နေရာယူပြီး
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              စုစုပေါင်းဆံ့ဝင်နိုင်စွမ်း ၅၀,၀၀၀ အိတ်
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-600 font-bold">
            <span>လက်ခံနိုင်ဆဲ နေရာလွတ်</span>
            <span className="text-[11px] text-slate-400 font-normal truncate ml-2">
              {(kpiStats.totalCapacity - kpiStats.totalBags).toLocaleString()}{" "}
              အိတ်
            </span>
          </div>
        </div>
      </div>

      {/* ================= 2.1 WAREHOUSES CAPACITY BARS STRIP ================= */}
      <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Warehouse size={15} className="text-slate-500" />
            ဂိုဒေါင်တစ်ခုချင်းစီအလိုက် သိုလှောင်ထားရှိမှု အခြေအနေ:
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            ဂိုဒေါင် ၄ လုံး
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {warehouses.map((wh) => {
            const percent = Math.round(
              (wh.currentBags / wh.capacityBags) * 100
            );
            return (
              <div
                key={wh.id}
                className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {wh.name}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-600">
                    {percent}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      percent > 85
                        ? "bg-rose-500"
                        : percent > 65
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{wh.currentBags.toLocaleString()} အိတ်</span>
                  <span className="text-slate-400">
                    / {wh.capacityBags.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= 3. FILTER & ACTION STRIP ================= */}
      <div className="space-y-4">
        {/* Buttons ၃ ခု (အားလုံး / တောင်သူ့အပ်ကုန် / ပွဲရုံပိုင်စတော့) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer shrink-0 border ${
                activeTab === "ALL"
                  ? "bg-btn-color text-white border-btn-color"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              အားလုံး ({lots.length} Lots)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("CONSIGNMENT")}
              className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer shrink-0 border ${
                activeTab === "CONSIGNMENT"
                  ? "bg-btn-color text-white border-btn-color"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              တောင်သူ့အပ်ကုန် Lots (
              {lots.filter((l) => l.stockType === "CONSIGNMENT").length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("DEPOT_STOCK")}
              className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer shrink-0 border ${
                activeTab === "DEPOT_STOCK"
                  ? "bg-btn-color text-white border-btn-color"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              ပွဲရုံပိုင် စတော့ (
              {lots.filter((l) => l.stockType === "DEPOT_STOCK").length})
            </button>
          </div>

          <div className="text-xs text-slate-500 font-semibold px-1 shrink-0">
            လက်ရှိဖော်ပြစာရင်း:{" "}
            <span className="font-bold text-slate-800">
              {filteredLots.length} Lots
            </span>
          </div>
        </div>

        {/* Search + Warehouse Dropdown + Stock Transfer Button */}
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
                placeholder="Lot အမှတ်၊ သီးနှံအမည်၊ တောင်သူ၊ Bay ဖြင့် ရှာပါ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium focus:outline-hidden"
              />
            </div>

            {/* Warehouse Dropdown Filter */}
            <div className="relative shrink-0" ref={filterRef}>
              <button
                type="button"
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className="h-9 px-3.5 rounded-full bg-slate-50 border border-slate-200/90 text-xs font-bold text-slate-700 flex items-center justify-between gap-2 cursor-pointer w-full sm:w-auto"
              >
                <div className="flex items-center gap-2">
                  <Warehouse size={13} className="text-slate-500" />
                  <span>
                    {warehouseFilter === "ALL"
                      ? "ဂိုဒေါင်အားလုံး"
                      : warehouses.find((w) => w.id === warehouseFilter)
                          ?.name || warehouseFilter}
                  </span>
                </div>
                <ChevronDown size={13} className="text-slate-400" />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-1.5 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    ဂိုဒေါင်အလိုက် စစ်ထုတ်ပါ
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setWarehouseFilter("ALL");
                      setIsFilterOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold cursor-pointer text-left ${
                      warehouseFilter === "ALL"
                        ? "bg-btn-color text-white"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span>ဂိုဒေါင်အားလုံး</span>
                  </button>
                  {warehouses.map((wh) => (
                    <button
                      key={wh.id}
                      type="button"
                      onClick={() => {
                        setWarehouseFilter(wh.id);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold cursor-pointer text-left ${
                        warehouseFilter === wh.id
                          ? "bg-btn-color text-white"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span className="truncate">{wh.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Transfer Action Button */}
          <button
            type="button"
            onClick={() => handleOpenTransferModal()}
            className="flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 text-xs text-white bg-btn-color hover:bg-btn-hover rounded-full shadow-sm cursor-pointer shrink-0"
          >
            <ArrowLeftRight size={15} />
            <span>ဂိုဒေါင်ကူးပြောင်း / ရွှေ့မည်</span>
          </button>
        </div>
      </div>

      {/* ================= 4. RESPONSIVE CARDS & TABLE VIEW ================= */}
      {/* A. Mobile & Tablet Cards View (< lg) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 lg:hidden">
        {filteredLots.length === 0 ? (
          <div className="col-span-full bg-card rounded-3xl p-10 text-center border border-slate-200/80 shadow-xs">
            <p className="text-sm font-bold text-slate-500">
              ရှာဖွေမှုနှင့် ကိုက်ညီသော ကုန်စည် Lot မတွေ့ရှိပါ
            </p>
          </div>
        ) : (
          filteredLots.map((lot) => (
            <div
              key={lot.id}
              className="bg-card rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Header: Lot No & Type Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                      {lot.lotNumber}
                    </span>
                    <h3 className="text-sm font-bold text-slate-800 mt-2 leading-tight">
                      {lot.commodityName}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {lot.stockType === "CONSIGNMENT" ? (
                        <span>တောင်သူ: {lot.farmerName}</span>
                      ) : (
                        <span className="text-purple-700 font-semibold">
                          🏢 ပွဲရုံပိုင် စတော့
                        </span>
                      )}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      lot.stockType === "CONSIGNMENT"
                        ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                        : "bg-purple-50 text-purple-700 border border-purple-200/60"
                    }`}
                  >
                    {lot.stockType === "CONSIGNMENT"
                      ? "တောင်သူ့အပ်ကုန်"
                      : "ပွဲရုံပိုင်"}
                  </span>
                </div>

                {/* Stock Details Box */}
                <div className="mt-3.5 bg-slate-50 p-3 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      လက်ကျန် အိတ်အရေအတွက်:
                    </span>
                    <span className="font-black font-mono text-base text-slate-900">
                      {lot.currentBags.toLocaleString()} အိတ်
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500">အသားတင် အလေးချိန်:</span>
                    <span className="font-bold text-slate-800 font-mono">
                      {lot.netWeightViss.toLocaleString()} ပိဿာ{" "}
                      {lot.tinsCount > 0 ? `(${lot.tinsCount} တင်း)` : ""}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Warehouse size={12} className="text-slate-400" />
                      {lot.warehouseName} ({lot.bayLocation})
                    </span>
                    <span className="flex items-center gap-1 font-mono text-slate-600">
                      <Droplets size={12} className="text-blue-500" /> အစိုဓာတ်{" "}
                      {lot.moisturePercent}%
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {lot.notes && (
                  <p className="text-[11px] text-slate-400 mt-2 px-1 italic truncate">
                    မှတ်ချက်: {lot.notes}
                  </p>
                )}
              </div>

              {/* Card Footer: Transfer & View */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  အဝင်: {lot.inwardDate}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenTransferModal(lot)}
                    className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeftRight size={12} />
                    <span>ဂိုဒေါင်ကူး</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedLotDetail(lot)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                    title="အသေးစိတ် ကြည့်မည်"
                  >
                    <Eye size={15} />
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
                <th className="px-5 py-3.5">Lot အမှတ်</th>
                <th className="px-5 py-3.5">ပိုင်ဆိုင်မှု ပုံစံ</th>
                <th className="px-5 py-3.5">သီးနှံအမည်</th>
                <th className="px-5 py-3.5">တောင်သူ / မူရင်း</th>
                <th className="px-5 py-3.5 text-right">လက်ကျန် (အိတ်)</th>
                <th className="px-5 py-3.5 text-right">အလေးချိန် / တင်း</th>
                <th className="px-5 py-3.5">သိုလှောင်ရာ ဂိုဒေါင် / Bay</th>
                <th className="px-5 py-3.5 text-center">အစိုဓာတ်</th>
                <th className="px-5 py-3.5 text-center">လုပ်ဆောင်ချက်</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLots.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-10 text-center text-slate-400 font-bold"
                  >
                    ရှာဖွေမှုနှင့် ကိုက်ညီသော ကုန်စည် Lot မတွေ့ရှိပါ
                  </td>
                </tr>
              ) : (
                filteredLots.map((lot) => (
                  <tr key={lot.id} className="hover:bg-slate-50/80">
                    {/* Lot Number */}
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-slate-900 block">
                        {lot.lotNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        အဝင်: {lot.inwardDate}
                      </span>
                    </td>

                    {/* Stock Type Badge */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          lot.stockType === "CONSIGNMENT"
                            ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                            : "bg-purple-50 text-purple-700 border border-purple-200/60"
                        }`}
                      >
                        {lot.stockType === "CONSIGNMENT"
                          ? "တောင်သူ့အပ်ကုန်"
                          : "ပွဲရုံပိုင်"}
                      </span>
                    </td>

                    {/* Commodity */}
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-800 block">
                        {lot.commodityName}
                      </span>
                    </td>

                    {/* Farmer */}
                    <td className="px-5 py-4">
                      {lot.farmerName ? (
                        <>
                          <p className="font-bold text-slate-800 text-xs">
                            {lot.farmerName}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {lot.farmerTownship}
                          </p>
                        </>
                      ) : (
                        <span className="text-slate-400 font-normal italic">
                          (ပွဲရုံတန်းဝယ် စတော့)
                        </span>
                      )}
                    </td>

                    {/* Remaining Bags */}
                    <td className="px-5 py-4 text-right font-mono font-black text-slate-900 text-sm">
                      {lot.currentBags.toLocaleString()}{" "}
                      <span className="text-xs font-normal text-slate-500 font-sans">
                        အိတ်
                      </span>
                    </td>

                    {/* Weight & Tins */}
                    <td className="px-5 py-4 text-right font-mono font-bold text-slate-700">
                      <div>{lot.netWeightViss.toLocaleString()} ပိဿာ</div>
                      {lot.tinsCount > 0 && (
                        <div className="text-[11px] text-slate-400">
                          {lot.tinsCount} တင်း
                        </div>
                      )}
                    </td>

                    {/* Warehouse & Bay Location */}
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-800 block">
                        {lot.warehouseName}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        တည်နေရာ: {lot.bayLocation}
                      </span>
                    </td>

                    {/* Moisture % */}
                    <td className="px-5 py-4 text-center font-mono">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          lot.moisturePercent > 13.5
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        <Droplets size={11} /> {lot.moisturePercent}%
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenTransferModal(lot)}
                          className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          title="အခြားဂိုဒေါင်သို့ ကူးပြောင်းမည်"
                        >
                          <ArrowLeftRight size={12} />
                          <span>ဂိုဒေါင်ကူး</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedLotDetail(lot)}
                          className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                          title="အသေးစိတ် စစ်ဆေးမည်"
                        >
                          <Eye size={15} />
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

      {/* ================= 5. MODAL: STOCK TRANSFER (ဂိုဒေါင်ကူးပြောင်းခြင်း) ================= */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-card w-full max-w-2xl rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xl max-h-[92vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-btn-color text-white flex items-center justify-center font-bold">
                  <ArrowLeftRight size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    ဂိုဒေါင်အချင်းချင်း ကုန်စည်ရွှေ့ပြောင်းခြင်း (Stock
                    Transfer)
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    သီးနှံ Lot အား အခြားဂိုဒေါင် သို့မဟုတ် Bay သို့
                    ကူးပြောင်းသိမ်းဆည်းခြင်း
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmitTransfer}
              className="space-y-4 mt-4 text-xs font-semibold"
            >
              {/* Select Lot to Transfer */}
              <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    ရွှေ့ပြောင်းမည့် သီးနှံ Lot ရွေးချယ်ပါ *
                  </label>
                  <select
                    value={transferLotId}
                    onChange={(e) => setTransferLotId(e.target.value)}
                    required
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white cursor-pointer"
                  >
                    {lots.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.lotNumber} - {l.commodityName} [{l.warehouseName} (
                        {l.bayLocation})] - လက်ကျန် {l.currentBags} အိတ်
                      </option>
                    ))}
                  </select>
                </div>

                {selectedTransferLot && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">
                        လက်ရှိ ထားရှိရာ:
                      </span>
                      <span className="font-bold text-slate-800">
                        {selectedTransferLot.warehouseName} (
                        {selectedTransferLot.bayLocation})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">
                        လက်ရှိ လက်ကျန်အိတ်:
                      </span>
                      <span className="font-black text-slate-900 font-mono">
                        {selectedTransferLot.currentBags} အိတ်
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Target Warehouse & Target Bay */}
              <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    ပြောင်းရွှေ့မည့် ပန်းတိုင် ဂိုဒေါင် *
                  </label>
                  <select
                    value={targetWarehouseId}
                    onChange={(e) => setTargetWarehouseId(e.target.value)}
                    required
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white cursor-pointer"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} (နေရာလွတ်:{" "}
                        {(w.capacityBags - w.currentBags).toLocaleString()}{" "}
                        အိတ်)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    အသစ်ထားရှိမည့် Bay / တည်နေရာ
                  </label>
                  <input
                    type="text"
                    placeholder="ဥပမာ - Bay B-05"
                    value={targetBay}
                    onChange={(e) => setTargetBay(e.target.value)}
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                  />
                </div>
              </div>

              {/* Bags count to transfer */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  ရွှေ့ပြောင်းမည့် အိတ်အရေအတွက် (အိတ်) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedTransferLot?.currentBags || 100}
                  required
                  value={transferBagCount || ""}
                  onChange={(e) => setTransferBagCount(Number(e.target.value))}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                  placeholder="0"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  အများဆုံး ရွှေ့ပြောင်းနိုင်သော အရေအတွက်:{" "}
                  {selectedTransferLot?.currentBags || 0} အိတ်
                </span>
              </div>

              {/* Transfer Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  ကူးပြောင်းမှု အကြောင်းပြချက် / မှတ်ချက်
                </label>
                <textarea
                  rows={2}
                  placeholder="ဥပမာ - မိုးတွင်းအစိုဓာတ်လွတ်ရန် အအေးခန်းသို့ ရွှေ့ခြင်း၊ အိတ်နေရာလွတ်ညှိခြင်း စသည်..."
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 sm:pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-btn-color hover:bg-btn-hover text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  ဂိုဒေါင်ကူးပြောင်း အတည်ပြုမည်
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= 6. MODAL: LOT DETAIL & QUALITY INSPECTION ================= */}
      {selectedLotDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-card w-full max-w-xl rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xl max-h-[92vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
                  <Package size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    {selectedLotDetail.lotNumber} - Lot အသေးစိတ်
                  </h3>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    အဝင်ရက်စွဲ: {selectedLotDetail.inwardDate}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLotDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs font-semibold">
              {/* Ownership & Location Banner */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[11px]">
                    သီးနှံနှင့် ပိုင်ဆိုင်မှု:
                  </span>
                  <span className="text-slate-900 font-black text-sm block">
                    {selectedLotDetail.commodityName}
                  </span>
                  <span className="text-slate-600 block text-[11px] mt-0.5">
                    {selectedLotDetail.stockType === "CONSIGNMENT"
                      ? `တောင်သူ: ${selectedLotDetail.farmerName} (${selectedLotDetail.farmerTownship})`
                      : "ပွဲရုံပိုင် စတော့ (ဒိုင်ပြတ်ဝယ်ယူ)"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">
                    သိုလှောင်ရာ တည်နေရာ:
                  </span>
                  <span className="text-slate-800 font-bold block">
                    {selectedLotDetail.warehouseName}
                  </span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    Bay: {selectedLotDetail.bayLocation}
                  </span>
                </div>
              </div>

              {/* Quantity Breakdown Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 uppercase block">
                    လက်ကျန်အိတ်
                  </span>
                  <span className="text-base font-black text-slate-900 font-mono">
                    {selectedLotDetail.currentBags}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    / မူရင်း {selectedLotDetail.initialBags}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 uppercase block">
                    အသားတင်ပိဿာ
                  </span>
                  <span className="text-base font-black text-slate-900 font-mono">
                    {selectedLotDetail.netWeightViss.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 block">ပိဿာ</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 uppercase block">
                    အစိုဓာတ်
                  </span>
                  <span className="text-base font-black text-emerald-600 font-mono">
                    {selectedLotDetail.moisturePercent}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    အရည်အသွေးကောင်း
                  </span>
                </div>
              </div>

              {/* Quality & Storage Inspection Card */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 pb-1 border-b border-slate-200">
                  <Scale size={14} className="text-slate-500" />
                  ကုန်စည် ထိန်းသိမ်းမှု စစ်ဆေးချက် မှတ်တမ်း
                </span>
                <div className="text-slate-600 text-xs leading-relaxed">
                  {selectedLotDetail.notes ||
                    "သိုလှောင်ထားရှိမှု အခြေအနေ ကောင်းမွန်ပါသည်။ ပိုးကျမှုမရှိ။"}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLotDetail(null);
                    handleOpenTransferModal(selectedLotDetail);
                  }}
                  className="px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeftRight size={13} />
                  <span>ဂိုဒေါင်ကူးမည်</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLotDetail(null)}
                  className="px-5 py-2 rounded-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer"
                >
                  ပိတ်မည်
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseInventory;
