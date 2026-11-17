import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  HandCoins,
  Search,
  Plus,
  Phone,
  MapPin,
  Printer,
  Trash2,
  X,
  Scale,
  CreditCard,
  Coins,
  DollarSign,
  Layers,
} from "lucide-react";

// ================= TYPES =================
export type SettlementType = "SOLD_CONSIGNMENT" | "BUYOUT_UNSOLD";
export type SettlementStatus = "completed" | "pending";
export type PaymentMethod =
  | "CASH"
  | "KPAY"
  | "WAVE"
  | "AYA_PAY"
  | "BANK_TRANSFER";

export interface SettlementVoucher {
  id: string;
  voucherNo: string; // ဥပမာ - STL-2026-101
  type: SettlementType;
  farmerId: string;
  farmerName: string;
  phone: string;
  township: string;
  commodityName: string;
  lotNumber: string; // အပ်ကုန် Lot နံပါတ်
  warehouseName: string;
  bagsCount: number;
  tinsCount: number;
  unitPrice: number; // ရောင်းထွက်ဈေး သို့မဟုတ် ဖြတ်ဝယ်ဈေး
  grossSaleAmount: number; // စုစုပေါင်းရောင်းရငွေ / ဖြတ်ဝယ်ငွေ

  // Deductions (နုတ်ပယ်စရိတ်များ)
  commissionFee: number; // ပွဲခ
  laborFee: number; // ကုန်ချ/အလုပ်သမားခ
  gunnyBagFee: number; // အိတ်ခွံဖိုး/သိုလှောင်ခ
  advanceDeducted: number; // ကြိုထုတ်ငွေ ခုနှိမ်ငွေ
  totalDeductions: number; // စုစုပေါင်း နုတ်ပယ်ငွေ

  netPayableToFarmer: number; // တောင်သူသို့ အသားတင် ပေးချေငွေ
  paymentMethod: PaymentMethod;
  date: string;
  status: SettlementStatus;
  notes?: string;
}

interface FarmerOption {
  id: string;
  name: string;
  phone: string;
  township: string;
  advanceBalance: number; // လက်ရှိ ကြိုထုတ်ငွေ ကျန်ငွေ
}

interface ConsignmentLotForSettlement {
  id: string;
  lotNumber: string;
  farmerId: string;
  farmerName: string;
  commodityId: string;
  commodityName: string;
  warehouseName: string;
  remainingBags: number;
  vissPerTin: number;
  totalViss: number;
  tinsCount: number;
  commissionRatePerBag: number;
  marketPricePerTin: number;
  soldStatus: "SOLD" | "UNSOLD"; // ရောင်းထွက်ပြီး သို့မဟုတ် မရောင်းရသေး
  soldPricePerTin?: number;
}

// ================= MOCK DATA =================
const MOCK_FARMERS: FarmerOption[] = [
  {
    id: "FAR-101",
    name: "ဦးလှမောင်",
    phone: "09-450011223",
    township: "ကျောက်ဆည် (အေးမြရွာ)",
    advanceBalance: 1500000,
  },
  {
    id: "FAR-102",
    name: "ဦးဘကြည်",
    phone: "09-790088990",
    township: "ဒေးဒရဲမြို့နယ်",
    advanceBalance: 2500000,
  },
  {
    id: "FAR-103",
    name: "ဦးအေးမောင်",
    phone: "09-420011223",
    township: "ရွှေဘိုမြို့နယ်",
    advanceBalance: 0,
  },
  {
    id: "FAR-104",
    name: "ဦးတင်ဝင်း",
    phone: "09-400123456",
    township: "ဖျာပုံမြို့နယ်",
    advanceBalance: 800000,
  },
];

// ငွေရှင်းရန် အဆင်သင့်ရှိသော အပ်ကုန် Lots များ
const MOCK_CONSIGNMENT_LOTS: ConsignmentLotForSettlement[] = [
  {
    id: "LOT-001",
    lotNumber: "LOT-2603-01",
    farmerId: "FAR-101",
    farmerName: "ဦးလှမောင်",
    commodityId: "C-01",
    commodityName: "မတ်ပဲ (FAQ)",
    warehouseName: "WH-02 (ပဲသိုလှောင်ရုံ)",
    remainingBags: 60,
    vissPerTin: 20,
    totalViss: 1200,
    tinsCount: 60,
    commissionRatePerBag: 500,
    marketPricePerTin: 90000,
    soldStatus: "SOLD", // ဝယ်လက်ထံ ရောင်းထွက်ပြီး
    soldPricePerTin: 90000,
  },
  {
    id: "LOT-002",
    lotNumber: "LOT-2603-02",
    farmerId: "FAR-102",
    farmerName: "ဦးဘကြည်",
    commodityId: "C-03",
    commodityName: "နှမ်းနက် (စမုံ)",
    warehouseName: "WH-02 (ပဲသိုလှောင်ရုံ)",
    remainingBags: 40,
    vissPerTin: 15,
    totalViss: 600,
    tinsCount: 40,
    commissionRatePerBag: 800,
    marketPricePerTin: 140000,
    soldStatus: "UNSOLD", // မရောင်းရသေး (ဒိုင်မှ ဖြတ်ဝယ်နိုင်သည်)
  },
  {
    id: "LOT-003",
    lotNumber: "LOT-2603-03",
    farmerId: "FAR-103",
    farmerName: "ဦးအေးမောင်",
    commodityId: "C-05",
    commodityName: "စပါး (ရွှေဘိုပေါ်ဆန်း)",
    warehouseName: "WH-01 (ပင်မစပါးကျီ)",
    remainingBags: 100,
    vissPerTin: 20,
    totalViss: 2000,
    tinsCount: 100,
    commissionRatePerBag: 600,
    marketPricePerTin: 122000,
    soldStatus: "SOLD",
    soldPricePerTin: 125000,
  },
];

// Initial Settlement Records
const INITIAL_SETTLEMENTS: SettlementVoucher[] = [
  {
    id: "STL-001",
    voucherNo: "STL-2026-101",
    type: "SOLD_CONSIGNMENT",
    farmerId: "FAR-101",
    farmerName: "ဦးလှမောင်",
    phone: "09-450011223",
    township: "ကျောက်ဆည် (အေးမြရွာ)",
    commodityName: "မတ်ပဲ (FAQ)",
    lotNumber: "LOT-2603-01",
    warehouseName: "WH-02 (ပဲသိုလှောင်ရုံ)",
    bagsCount: 60,
    tinsCount: 60,
    unitPrice: 90000,
    grossSaleAmount: 5400000,
    commissionFee: 30000, // ၆၀ အိတ် x ၅၀၀
    laborFee: 18000, // ၆၀ အိတ် x ၃၀၀
    gunnyBagFee: 60000,
    advanceDeducted: 1000000,
    totalDeductions: 1108000,
    netPayableToFarmer: 4292000,
    paymentMethod: "KPAY",
    date: "၂၀၂၆-၁၁-၁၅",
    status: "completed",
    notes:
      "မတ်ပဲ ၆၀ အိတ် ရောင်းချငွေမှ ပွဲခနှင့် ကြိုထုတ်ငွေ ၁၀ သိန်း ခုနှိမ်ပြီး KPay ဖြင့် ရှင်းပြီး။",
  },
  {
    id: "STL-002",
    voucherNo: "STL-2026-102",
    type: "BUYOUT_UNSOLD",
    farmerId: "FAR-102",
    farmerName: "ဦးဘကြည်",
    phone: "09-790088990",
    township: "ဒေးဒရဲမြို့နယ်",
    commodityName: "နှမ်းနက် (စမုံ)",
    lotNumber: "LOT-2603-02",
    warehouseName: "WH-02 (ပဲသိုလှောင်ရုံ)",
    bagsCount: 40,
    tinsCount: 40,
    unitPrice: 138000,
    grossSaleAmount: 5520000,
    commissionFee: 0, // ဒိုင်ပြတ်တန်းဝယ်သဖြင့် ပွဲခမယူ
    laborFee: 20000,
    gunnyBagFee: 40000,
    advanceDeducted: 2000000,
    totalDeductions: 2060000,
    netPayableToFarmer: 3460000,
    paymentMethod: "BANK_TRANSFER",
    date: "၂၀၂၆-၁၁-၁၄",
    status: "completed",
    notes:
      "တောင်သူငွေအရေးပေါ်လို၍ ပွဲရုံမှ ၁၃၈,၀၀၀ ဖြင့် အပြတ်ဖြတ်ဝယ်ပြီး ကြိုထုတ်ငွေ ၂၀ သိန်း နုတ်ယူရှင်းလင်း။",
  },
];

export const FarmerSettlements: React.FC = () => {
  // ================= STATE =================
  const [settlements, setSettlements] =
    useState<SettlementVoucher[]>(INITIAL_SETTLEMENTS);
  const [activeTab, setActiveTab] = useState<"ALL" | SettlementType>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Modal State
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [settlementType, setSettlementType] =
    useState<SettlementType>("SOLD_CONSIGNMENT");
  const [selectedFarmerId, setSelectedFarmerId] = useState("");
  const [selectedLotId, setSelectedLotId] = useState("");
  const [voucherDate, setVoucherDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  // Pricing & Deduction State
  const [settlementUnitPrice, setSettlementUnitPrice] = useState<number>(0);
  const [commissionRate, setCommissionRate] = useState<number>(500);
  const [laborFeeAmount, setLaborFeeAmount] = useState<number>(18000);
  const [gunnyBagFeeAmount, setGunnyBagFeeAmount] = useState<number>(40000);
  const [advanceDeductionAmount, setAdvanceDeductionAmount] =
    useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [remarks, setRemarks] = useState("");

  // Selected Farmer
  const currentFarmer = useMemo(() => {
    return MOCK_FARMERS.find((f) => f.id === selectedFarmerId) || null;
  }, [selectedFarmerId]);

  // Filter Lots applicable to selected farmer and settlement type
  const availableLots = useMemo(() => {
    return MOCK_CONSIGNMENT_LOTS.filter((lot) => {
      const matchFarmer = selectedFarmerId
        ? lot.farmerId === selectedFarmerId
        : true;
      if (settlementType === "SOLD_CONSIGNMENT") {
        return matchFarmer && lot.soldStatus === "SOLD";
      } else {
        return matchFarmer && lot.soldStatus === "UNSOLD";
      }
    });
  }, [selectedFarmerId, settlementType]);

  // Selected Lot
  const currentLot = useMemo(() => {
    return (
      availableLots.find((l) => l.id === selectedLotId) ||
      availableLots[0] ||
      null
    );
  }, [availableLots, selectedLotId]);

  // Synchronize Lot change
  useEffect(() => {
    if (currentLot) {
      setSelectedLotId(currentLot.id);
      if (settlementType === "SOLD_CONSIGNMENT") {
        setSettlementUnitPrice(
          currentLot.soldPricePerTin || currentLot.marketPricePerTin
        );
        setCommissionRate(currentLot.commissionRatePerBag);
      } else {
        setSettlementUnitPrice(currentLot.marketPricePerTin);
        setCommissionRate(0); // Buyout typically takes 0 commission or standard discount
      }
      setLaborFeeAmount(currentLot.remainingBags * 300);
      setGunnyBagFeeAmount(currentLot.remainingBags * 1000);
    }
  }, [currentLot, settlementType]);

  // Auto-fill advance deduction default
  useEffect(() => {
    if (currentFarmer && currentFarmer.advanceBalance > 0) {
      setAdvanceDeductionAmount(currentFarmer.advanceBalance);
    } else {
      setAdvanceDeductionAmount(0);
    }
  }, [currentFarmer]);

  // Financial Calculations
  const calculations = useMemo(() => {
    const bags = currentLot?.remainingBags || 0;
    const tins = currentLot?.tinsCount || 0;
    const grossAmount = tins * (Number(settlementUnitPrice) || 0);

    const commissionTotal =
      settlementType === "SOLD_CONSIGNMENT"
        ? bags * (Number(commissionRate) || 0)
        : 0;
    const labor = Number(laborFeeAmount) || 0;
    const gunny = Number(gunnyBagFeeAmount) || 0;
    const maxAdvanceDeductible = currentFarmer
      ? currentFarmer.advanceBalance
      : 0;
    const advance = Math.min(
      Number(advanceDeductionAmount) || 0,
      maxAdvanceDeductible
    );

    const totalDeductions = commissionTotal + labor + gunny + advance;
    const netPayable = Math.max(0, grossAmount - totalDeductions);

    return {
      bags,
      tins,
      grossAmount,
      commissionTotal,
      labor,
      gunny,
      advance,
      totalDeductions,
      netPayable,
    };
  }, [
    currentLot,
    settlementUnitPrice,
    settlementType,
    commissionRate,
    laborFeeAmount,
    gunnyBagFeeAmount,
    advanceDeductionAmount,
    currentFarmer,
  ]);

  // Outside click for filter popover
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

  // Open Modal
  const handleOpenModal = () => {
    setSettlementType("SOLD_CONSIGNMENT");
    setSelectedFarmerId(MOCK_FARMERS[0].id);
    setVoucherDate(new Date().toISOString().slice(0, 10));
    setPaymentMethod("CASH");
    setRemarks("");
    setIsOpenModal(true);
  };

  // Submit Settlement
  const handleSubmitSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFarmer || !currentLot) {
      alert("ကျေးဇူးပြု၍ တောင်သူနှင့် အပ်ကုန် Lot အား ရွေးချယ်ပေးပါ");
      return;
    }

    const newRecord: SettlementVoucher = {
      id: `STL-${Date.now()}`,
      voucherNo: `STL-2026-${Math.floor(100 + Math.random() * 900)}`,
      type: settlementType,
      farmerId: currentFarmer.id,
      farmerName: currentFarmer.name,
      phone: currentFarmer.phone,
      township: currentFarmer.township,
      commodityName: currentLot.commodityName,
      lotNumber: currentLot.lotNumber,
      warehouseName: currentLot.warehouseName,
      bagsCount: calculations.bags,
      tinsCount: calculations.tins,
      unitPrice: Number(settlementUnitPrice) || 0,
      grossSaleAmount: calculations.grossAmount,
      commissionFee: calculations.commissionTotal,
      laborFee: calculations.labor,
      gunnyBagFee: calculations.gunny,
      advanceDeducted: calculations.advance,
      totalDeductions: calculations.totalDeductions,
      netPayableToFarmer: calculations.netPayable,
      paymentMethod: paymentMethod,
      date: voucherDate,
      status: "completed",
      notes:
        remarks.trim() ||
        (settlementType === "SOLD_CONSIGNMENT"
          ? "ရောင်းထွက်ပြီး အပ်ကုန် ငွေရှင်းပြီး"
          : "မရောင်းရသေးသည့် အပ်ကုန် ပွဲရုံမှ အပြတ်ဖြတ်ဝယ်ပြီး စာရင်းရှင်းပြီး"),
    };

    setSettlements([newRecord, ...settlements]);
    setIsOpenModal(false);
  };

  // KPI Calculations
  const kpiStats = useMemo(() => {
    const totalCount = settlements.length;
    const totalPaidToFarmers = settlements.reduce(
      (sum, s) => sum + s.netPayableToFarmer,
      0
    );
    const totalCommissionsEarned = settlements.reduce(
      (sum, s) => sum + s.commissionFee + s.laborFee + s.gunnyBagFee,
      0
    );
    const totalAdvanceDeducted = settlements.reduce(
      (sum, s) => sum + s.advanceDeducted,
      0
    );

    return {
      totalCount,
      totalPaidToFarmers,
      totalCommissionsEarned,
      totalAdvanceDeducted,
    };
  }, [settlements]);

  // Filtered Settlement List
  const filteredSettlements = useMemo(() => {
    setStatusFilter("all");
    return settlements.filter((item) => {
      const matchType = activeTab === "ALL" || item.type === activeTab;
      const matchStatus =
        statusFilter === "all" || item.status === statusFilter;
      const matchSearch =
        item.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.commodityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.township.toLowerCase().includes(searchTerm.toLowerCase());

      return matchType && matchStatus && matchSearch;
    });
  }, [settlements, activeTab, statusFilter, searchTerm]);

  return (
    <div className="space-y-4 sm:space-y-6 select-none pb-3">
      {/* ================= 1. GREETING & HEADER ================= */}
      <div className="relative overflow-hidden py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">
          တောင်သူ ငွေရှင်းတမ်း စီမံခန့်ခွဲမှု (Farmer Settlements)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 sm:mt-3 max-w-xl leading-relaxed">
          ရောင်းထွက်ပြီး အပ်ကုန်ငွေရှင်းခြင်း (Sold Consignment) နှင့်
          မရောင်းရသေးသည့် အပ်ကုန်အား ပွဲရုံမှ တန်းဖြတ်ဝယ်ငွေရှင်းခြင်း
          (Consignment Buyout) စာရင်းချုပ်
        </p>
      </div>

      {/* ================= 2. 4 KPI SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {/* Card 1: စုစုပေါင်း ငွေရှင်းဘောက်ချာ */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              စုစုပေါင်း ငွေရှင်းဘောက်ချာ
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <HandCoins size={18} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {kpiStats.totalCount}{" "}
              <span className="text-xs font-normal text-slate-500">စောင်</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              ရောင်းထွက်ရှင်း{" "}
              {settlements.filter((s) => s.type === "SOLD_CONSIGNMENT").length}{" "}
              • ဖြတ်ဝယ်ရှင်း{" "}
              {settlements.filter((s) => s.type === "BUYOUT_UNSOLD").length}
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
            <span>ငွေရှင်းလင်းမှု စံချိန်</span>
            <span className="text-[11px] text-slate-400 font-normal truncate ml-2">
              ယနေ့အထိ
            </span>
          </div>
        </div>

        {/* Card 2: တောင်သူသို့ ပေးချေငွေ စုစုပေါင်း */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              တောင်သူသို့ ပေးချေငွေ
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Coins size={18} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {(kpiStats.totalPaidToFarmers / 100000).toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-500">
                သိန်း ကျပ်
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              {kpiStats.totalPaidToFarmers.toLocaleString()} ကျပ်
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-bold">
            <span>အသားတင်ပေးချေပြီး</span>
            <span className="text-[11px] text-slate-400 font-normal truncate ml-2">
              တောင်သူလက်ရောက်
            </span>
          </div>
        </div>

        {/* Card 3: ပွဲရုံ ရရှိပွဲခ/စရိတ် စုစုပေါင်း */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              ပွဲရုံရရှိ ပွဲခ/စရိတ်ငွေ
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {(kpiStats.totalCommissionsEarned / 100000).toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-500">
                သိန်း ကျပ်
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              {kpiStats.totalCommissionsEarned.toLocaleString()} ကျပ်
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-purple-700 font-bold">
            <span>ပွဲခစားဝင်ငွေ</span>
            <span className="text-[11px] text-slate-400 font-normal truncate ml-2">
              ပွဲရုံအကျိုး
            </span>
          </div>
        </div>

        {/* Card 4: ကြိုထုတ်ငွေ ခုနှိမ်ရှင်းလင်းငွေ */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              ကြိုတင်ထုတ်ငွေ ခုနှိမ်ပြီး
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <CreditCard size={18} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {(kpiStats.totalAdvanceDeducted / 100000).toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-500">
                သိန်း ကျပ်
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              {kpiStats.totalAdvanceDeducted.toLocaleString()} ကျပ်
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-600 font-bold">
            <span>ပြန်လည်ခုနှိမ်ငွေ</span>
            <span className="text-[11px] text-slate-400 font-normal truncate ml-2">
              ကြိုထုတ်ငွေမှ
            </span>
          </div>
        </div>
      </div>

      {/* ================= 3. TYPE SELECTOR & ACTION STRIP ================= */}
      <div className="space-y-4">
        {/* Buttons ၂ ခု + အားလုံး (Sold Consignment vs Buyout) */}
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
              အားလုံး ({settlements.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("SOLD_CONSIGNMENT")}
              className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer shrink-0 border ${
                activeTab === "SOLD_CONSIGNMENT"
                  ? "bg-btn-color text-white border-btn-color"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              ရှင်းပြီးရှင်းတမ်းမှတ်တမ်းများ (
              {settlements.filter((s) => s.type === "SOLD_CONSIGNMENT").length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("BUYOUT_UNSOLD")}
              className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer shrink-0 border ${
                activeTab === "BUYOUT_UNSOLD"
                  ? "bg-btn-color text-white border-btn-color"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              ငွေရှင်းပေးရန်စောင့်ဆိုင်းနေသောအပ်ကုန်များ (
              {settlements.filter((s) => s.type === "BUYOUT_UNSOLD").length})
            </button>
          </div>

          <div className="text-xs text-slate-500 font-semibold px-1 shrink-0">
            လက်ရှိဖော်ပြစာရင်း:{" "}
            <span className="font-bold text-slate-800">
              {filteredSettlements.length} စောင်
            </span>
          </div>
        </div>

        {/* Search + Status Popover Filter + New Voucher Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 sm:p-4 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-1 ">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="ဘောက်ချာအမှတ်၊ တောင်သူအမည်၊ ကုန်စည်၊ Lot အမှတ် ရှာရန်..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium focus:outline-hidden"
              />
            </div>
          </div>

          {/* New Settlement Button */}
          <button
            type="button"
            onClick={handleOpenModal}
            className="flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 text-xs text-white bg-btn-color hover:bg-btn-hover rounded-full shadow-sm cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>ငွေရှင်းဘောက်ချာ ဖွင့်မည်</span>
          </button>
        </div>
      </div>

      {/* ================= 4. RESPONSIVE CARDS & TABLE VIEW ================= */}
      {/* A. Mobile & Tablet Cards View (< lg) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 lg:hidden">
        {filteredSettlements.length === 0 ? (
          <div className="col-span-full bg-card rounded-3xl p-10 text-center border border-slate-200/80 shadow-xs">
            <p className="text-sm font-bold text-slate-500">
              ရှာဖွေမှုနှင့် ကိုက်ညီသော ငွေရှင်းမှတ်တမ်း မတွေ့ရှိပါ
            </p>
          </div>
        ) : (
          filteredSettlements.map((stl) => (
            <div
              key={stl.id}
              className="bg-card rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Header: Voucher No & Type Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                      {stl.voucherNo}
                    </span>
                    <h3 className="text-sm font-bold text-slate-800 mt-2 leading-tight">
                      {stl.farmerName}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <MapPin size={11} /> {stl.township}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      stl.type === "SOLD_CONSIGNMENT"
                        ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                        : "bg-purple-50 text-purple-700 border border-purple-200/60"
                    }`}
                  >
                    {stl.type === "SOLD_CONSIGNMENT"
                      ? "ရောင်းထွက်ရှင်း"
                      : "ဖြတ်ဝယ်ရှင်း"}
                  </span>
                </div>

                {/* Lot & Financial Summary Box */}
                <div className="mt-3.5 bg-slate-50 p-3 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      သီးနှံနှင့် Lot အမှတ်:
                    </span>
                    <span className="font-bold text-slate-800">
                      {stl.commodityName} ({stl.lotNumber})
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      အရေအတွက်:
                    </span>
                    <span className="font-black font-mono text-sm text-slate-900">
                      {stl.bagsCount} အိတ် ({stl.tinsCount} တင်း)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/60">
                    <span className="text-slate-500 font-medium">
                      ရောင်းရငွေ/ဖြတ်ဝယ်ငွေ:
                    </span>
                    <span className="font-bold text-slate-800">
                      {stl.grossSaleAmount.toLocaleString()} ကျပ်
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-rose-600 font-medium">
                    <span>နုတ်ပယ်စရိတ်နှင့် ကြိုထုတ်ငွေ:</span>
                    <span>-{stl.totalDeductions.toLocaleString()} ကျပ်</span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/60">
                    <span className="font-bold text-emerald-700">
                      တောင်သူသို့ ပေးချေငွေ:
                    </span>
                    <span className="font-black font-mono text-sm text-emerald-600">
                      {stl.netPayableToFarmer.toLocaleString()} ကျပ်
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>နည်းလမ်း: {stl.paymentMethod}</span>
                    <span className="font-mono">{stl.date}</span>
                  </div>
                </div>

                {/* Notes */}
                {stl.notes && (
                  <p className="text-[11px] text-slate-400 mt-2 px-1 italic truncate">
                    မှတ်ချက်: {stl.notes}
                  </p>
                )}
              </div>

              {/* Card Footer: Phone & Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={`tel:${stl.phone}`}
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Phone size={12} />
                  <span>{stl.phone}</span>
                </a>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                    title="ဘောက်ချာ ထုတ်ယူမည်"
                  >
                    <Printer size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        confirm(`${stl.voucherNo} အား ဖျက်ပစ်ရန် သေချာပါသလား?`)
                      ) {
                        setSettlements((prev) =>
                          prev.filter((s) => s.id !== stl.id)
                        );
                      }
                    }}
                    className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="ဖျက်မည်"
                  >
                    <Trash2 size={14} />
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
                <th className="px-5 py-3.5">ဘောက်ချာ အမှတ်</th>
                <th className="px-5 py-3.5">အမျိုးအစား</th>
                <th className="px-5 py-3.5">တောင်သူ အမည် / ဒေသ</th>
                <th className="px-5 py-3.5">သီးနှံနှင့် Lot</th>
                <th className="px-5 py-3.5 text-right">အရေအတွက်</th>
                <th className="px-5 py-3.5 text-right">ရောင်းရ/ဖြတ်ဝယ်ငွေ</th>
                <th className="px-5 py-3.5 text-right">နုတ်ပယ်စရိတ်/ကြိုငွေ</th>
                <th className="px-5 py-3.5 text-right">
                  တောင်သူသို့ ပေးချေငွေ
                </th>
                <th className="px-5 py-3.5 text-center">လုပ်ဆောင်ချက်</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredSettlements.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-10 text-center text-slate-400 font-bold"
                  >
                    ရှာဖွေမှုနှင့် ကိုက်ညီသော စာရင်း မတွေ့ရှိပါ
                  </td>
                </tr>
              ) : (
                filteredSettlements.map((stl) => (
                  <tr key={stl.id} className="hover:bg-slate-50/80">
                    {/* Voucher No & Date */}
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-slate-900 block">
                        {stl.voucherNo}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {stl.date}
                      </span>
                    </td>

                    {/* Type Badge */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          stl.type === "SOLD_CONSIGNMENT"
                            ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                            : "bg-purple-50 text-purple-700 border border-purple-200/60"
                        }`}
                      >
                        {stl.type === "SOLD_CONSIGNMENT"
                          ? "ရောင်းထွက်ရှင်း"
                          : "ဖြတ်ဝယ်ရှင်း"}
                      </span>
                    </td>

                    {/* Farmer */}
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800 text-xs">
                        {stl.farmerName}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {stl.township} &bull; {stl.phone}
                      </p>
                    </td>

                    {/* Commodity & Lot */}
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-800 block">
                        {stl.commodityName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {stl.lotNumber} ({stl.warehouseName})
                      </span>
                    </td>

                    {/* Quantity */}
                    <td className="px-5 py-4 text-right font-mono font-bold text-slate-900 text-sm">
                      {stl.bagsCount}{" "}
                      <span className="text-xs font-normal text-slate-500 font-sans">
                        အိတ်
                      </span>
                    </td>

                    {/* Gross Sale */}
                    <td className="px-5 py-4 text-right font-mono font-bold text-slate-800">
                      {stl.grossSaleAmount.toLocaleString()}
                    </td>

                    {/* Deductions */}
                    <td className="px-5 py-4 text-right font-mono font-bold text-rose-600">
                      -{stl.totalDeductions.toLocaleString()}
                    </td>

                    {/* Net Payout to Farmer */}
                    <td className="px-5 py-4 text-right font-mono font-black text-emerald-600 text-sm">
                      {stl.netPayableToFarmer.toLocaleString()}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                          title="ဘောက်ချာ ထုတ်ယူမည်"
                        >
                          <Printer size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              confirm(
                                `${stl.voucherNo} အား ဖျက်ပစ်ရန် သေချာပါသလား?`
                              )
                            ) {
                              setSettlements((prev) =>
                                prev.filter((s) => s.id !== stl.id)
                              );
                            }
                          }}
                          className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="ဖျက်မည်"
                        >
                          <Trash2 size={15} />
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

      {/* ================= 5. MODAL: CREATE FARMER SETTLEMENT VOUCHER ================= */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-card w-full max-w-3xl rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xl max-h-[92vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-btn-color text-white flex items-center justify-center font-bold">
                  <HandCoins size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    တောင်သူ ငွေရှင်းဘောက်ချာ အသစ်ဖွင့်လှစ်ခြင်း
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    ရောင်းထွက်ပြီး အပ်ကုန်ငွေရှင်းတမ်း သို့မဟုတ် မရောင်းရသေးသည့်
                    အပ်ကုန် ဖြတ်ဝယ်ငွေရှင်းတမ်း
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpenModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmitSettlement}
              className="space-y-4 mt-4 text-xs font-semibold"
            >
              {/* Type Switcher: Sold Consignment vs Consignment Buyout */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                  ငွေရှင်းလင်းမှု ပုံစံ ရွေးချယ်ပါ
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSettlementType("SOLD_CONSIGNMENT")}
                    className={`py-2 rounded-full text-xs font-bold cursor-pointer border ${
                      settlementType === "SOLD_CONSIGNMENT"
                        ? "bg-btn-color text-white border-btn-color"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    ရောင်းထွက်ပြီး အပ်ကုန် ရှင်းမည်
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettlementType("BUYOUT_UNSOLD")}
                    className={`py-2 rounded-full text-xs font-bold cursor-pointer border ${
                      settlementType === "BUYOUT_UNSOLD"
                        ? "bg-btn-color text-white border-btn-color"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    မရောင်းရသေး အပ်ကုန် ဖြတ်ဝယ်ရှင်းမည်
                  </button>
                </div>
              </div>

              {/* Farmer & Voucher Date Selection */}
              <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    ငွေရှင်းမည့် တောင်သူ ရွေးချယ်ပါ *
                  </label>
                  <select
                    value={selectedFarmerId}
                    onChange={(e) => setSelectedFarmerId(e.target.value)}
                    required
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white cursor-pointer"
                  >
                    {MOCK_FARMERS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.township}){" "}
                        {f.advanceBalance > 0
                          ? `[ကြိုထုတ်ငွေ: ${f.advanceBalance.toLocaleString()} ကျပ်]`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    ငွေရှင်း ရက်စွဲ *
                  </label>
                  <input
                    type="date"
                    required
                    value={voucherDate}
                    onChange={(e) => setVoucherDate(e.target.value)}
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                  />
                </div>
              </div>

              {/* Lot Selection Section */}
              <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Layers size={14} className="text-slate-500" />
                    ရှင်းလင်းမည့် အပ်ကုန် Lot ရွေးချယ်ပါ *
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {settlementType === "SOLD_CONSIGNMENT"
                      ? "ရောင်းထွက်ပြီး Lot များသာ ပြသထားပါသည်"
                      : "ဂိုဒေါင်ရှိ မရောင်းရသေးသည့် Lot များ"}
                  </span>
                </div>

                {availableLots.length === 0 ? (
                  <div className="p-4 bg-white rounded-xl border border-slate-200 text-center text-slate-400 font-semibold">
                    ဤတောင်သူအတွက် ရှင်းလင်းရန် အပ်ကုန် Lot မရှိသေးပါ
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-8">
                      <select
                        value={selectedLotId}
                        onChange={(e) => setSelectedLotId(e.target.value)}
                        className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white cursor-pointer"
                      >
                        {availableLots.map((lot) => (
                          <option key={lot.id} value={lot.id}>
                            {lot.lotNumber} - {lot.commodityName} [
                            {lot.remainingBags} အိတ် ({lot.tinsCount} တင်း) -{" "}
                            {lot.warehouseName}]
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-4">
                      <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                        {settlementType === "SOLD_CONSIGNMENT"
                          ? "ရောင်းထွက်ဈေး (၁ တင်း/ကျပ်)"
                          : "ဒိုင်ဖြတ်ဝယ်ဈေး (၁ တင်း/ကျပ်)"}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={settlementUnitPrice || ""}
                        onChange={(e) =>
                          setSettlementUnitPrice(Number(e.target.value))
                        }
                        className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white text-right"
                      />
                    </div>
                  </div>
                )}

                {currentLot && (
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      စုစုပေါင်း တန်ဖိုး ({calculations.tins} တင်း x{" "}
                      {Number(settlementUnitPrice).toLocaleString()} ကျပ်):
                    </span>
                    <span className="font-black text-slate-900 text-sm">
                      {calculations.grossAmount.toLocaleString()} ကျပ်
                    </span>
                  </div>
                )}
              </div>

              {/* Deductions Breakdown (နုတ်ပယ်စရိတ်များ) */}
              <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 space-y-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 pb-1 border-b border-slate-200/80">
                  <Scale size={14} className="text-slate-500" />
                  နုတ်ပယ်စရိတ်များနှင့် ကြိုတင်ငွေ ခုနှိမ်မှု တွက်ချက်ခြင်း
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Commission */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      {settlementType === "SOLD_CONSIGNMENT"
                        ? "ပွဲခနှုန်း (၁ အိတ်/ကျပ်)"
                        : "ပွဲခ (ဖြတ်ဝယ်တွင် မရှိ)"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      disabled={settlementType === "BUYOUT_UNSOLD"}
                      value={
                        settlementType === "BUYOUT_UNSOLD"
                          ? 0
                          : commissionRate || ""
                      }
                      onChange={(e) =>
                        setCommissionRate(Number(e.target.value))
                      }
                      className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white disabled:bg-slate-100"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      စုစုပေါင်းပွဲခ:{" "}
                      {calculations.commissionTotal.toLocaleString()} ကျပ်
                    </span>
                  </div>

                  {/* Labor */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      ကုန်ချ / အလုပ်သမားခ (ကျပ်)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={laborFeeAmount || ""}
                      onChange={(e) =>
                        setLaborFeeAmount(Number(e.target.value))
                      }
                      className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                    />
                  </div>

                  {/* Gunny / Storage */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      အိတ်ခွံဖိုး / သိုလှောင်ခ (ကျပ်)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={gunnyBagFeeAmount || ""}
                      onChange={(e) =>
                        setGunnyBagFeeAmount(Number(e.target.value))
                      }
                      className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                    />
                  </div>
                </div>

                {/* Cash Advance Deduction */}
                {currentFarmer && currentFarmer.advanceBalance > 0 && (
                  <div className="pt-2 border-t border-slate-200/80">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-amber-50/80 rounded-xl border border-amber-200">
                      <div className="text-amber-900 text-[11px]">
                        <span className="font-bold">
                          တောင်သူ ကြိုထုတ်ငွေ ကျန်ရှိနေပါသည်:{" "}
                        </span>
                        <span className="font-black text-rose-600">
                          {currentFarmer.advanceBalance.toLocaleString()} ကျပ်
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-amber-900">
                          ယခုရှင်းတမ်းမှ ခုနှိမ်ငွေ:
                        </span>
                        <input
                          type="number"
                          min="0"
                          max={currentFarmer.advanceBalance}
                          value={advanceDeductionAmount || ""}
                          onChange={(e) =>
                            setAdvanceDeductionAmount(Number(e.target.value))
                          }
                          className="w-32 text-xs font-bold p-1.5 rounded-lg border border-amber-300 focus:outline-hidden bg-white text-right"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Settlement Summary Card */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-3">
                <div className="text-xs font-bold text-slate-800 border-b border-slate-200/80 pb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CreditCard size={15} className="text-slate-600" />
                    တောင်သူသို့ ပေးချေငွေ အပြီးသတ် စာရင်းချုပ်
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {settlementType === "SOLD_CONSIGNMENT"
                      ? "ရောင်းရငွေရှင်းတမ်း"
                      : "ဒိုင်ပြတ်ဖြတ်ဝယ်ငွေ"}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>စုစုပေါင်း ရောင်းရငွေ/ဖြတ်ဝယ်ငွေ:</span>
                    <span className="font-bold text-slate-900">
                      {calculations.grossAmount.toLocaleString()} ကျပ်
                    </span>
                  </div>

                  <div className="flex justify-between text-rose-600">
                    <span>
                      (-) နုတ်ပယ်စရိတ် စုစုပေါင်း (ပွဲခ + အလုပ်သမားခ +
                      အိတ်ခွံဖိုး + ကြိုငွေ):
                    </span>
                    <span className="font-bold">
                      -{calculations.totalDeductions.toLocaleString()} ကျပ်
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-2 text-sm">
                    <span className="text-emerald-800 font-bold">
                      တောင်သူသို့ အသားတင် ပေးချေငွေ:
                    </span>
                    <span className="font-black text-emerald-600 text-base">
                      {calculations.netPayable.toLocaleString()} ကျပ်
                    </span>
                  </div>
                </div>

                {/* Payment Method Select Only */}
                <div className="pt-2 border-t border-slate-200/80">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    ငွေပေးချေသည့် နည်းလမ်း ရွေးချယ်ပါ
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value as PaymentMethod)
                    }
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white cursor-pointer"
                  >
                    <option value="CASH">လက်ငင်း ငွေသား (Cash)</option>
                    <option value="KPAY">KPay</option>
                    <option value="WAVE">Wave Pay</option>
                    <option value="AYA_PAY">AYA Pay</option>
                    <option value="BANK_TRANSFER">
                      ဘဏ်စာရင်းလွှဲ (Bank Transfer)
                    </option>
                  </select>
                </div>
              </div>

              {/* Remarks Textarea */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  မှတ်ချက် / အထူးမှာကြားချက်
                </label>
                <textarea
                  rows={2}
                  placeholder="ငွေရှင်းတမ်း သဘောတူညီချက်၊ ဘဏ်ပြေစာ အမှတ် စသည်..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 sm:pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpenModal(false)}
                  className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-btn-color hover:bg-btn-hover text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  ငွေရှင်းဘောက်ချာ အတည်ပြုသိမ်းဆည်းမည်
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerSettlements;
