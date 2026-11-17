import React, { useState } from "react";
import {
  Wallet,
  Receipt,
  Search,
  Plus,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  TrendingUp,
  Printer,
  Edit3,
  Trash2,
  UserCheck,
} from "lucide-react";

// ================= TYPES =================
export interface RegularFarmer {
  id: string;
  name: string;
  phone: string;
  township: string;
  address: string;
  currentAdvanceBalance: number;
  creditLimit: number;
}

export interface AdvanceRecord {
  id: string;
  voucherNo: string;
  farmerId?: string;
  farmerName: string;
  phone: string;
  township: string;
  address: string;
  issueDate: string;
  principalAmount: number;
  repaidAmount: number;
  remainingBalance: number;
  expectedSettlementDate: string;
  status: "pending" | "partial" | "settled" | "overdue";
  notes?: string;
}

export const CashAdvances: React.FC = () => {
  // ================= ပွဲရုံတွင် ပုံမှန်လာရောင်းနေကြ တောင်သူများစာရင်း =================
  const regularFarmers: RegularFarmer[] = [
    {
      id: "FAR-101",
      name: "ဦးအေးမောင်",
      phone: "09-420011223",
      township: "ရွှေဘိုမြို့နယ်",
      address: "သခွတ်တောကျေးရွာ",
      currentAdvanceBalance: 1500000,
      creditLimit: 5000000,
    },
    {
      id: "FAR-102",
      name: "ဒေါ်လှကြည်",
      phone: "09-250033445",
      township: "ဝက်လက်မြို့နယ်",
      address: "ရွာသာအေးကျေးရွာ",
      currentAdvanceBalance: 4500000,
      creditLimit: 5000000,
    },
    {
      id: "FAR-103",
      name: "ဦးဘကြည်",
      phone: "09-790088990",
      township: "ဒေးဒရဲမြို့နယ်",
      address: "ဆိပ်ကြီးကျေးရွာ",
      currentAdvanceBalance: 0,
      creditLimit: 3000000,
    },
    {
      id: "FAR-104",
      name: "ဦးစိုးဝင်း",
      phone: "09-450077661",
      township: "ဟင်္သာတမြို့နယ်",
      address: "နတ်မော်ကျေးရွာ",
      currentAdvanceBalance: 800000,
      creditLimit: 2000000,
    },
    {
      id: "FAR-105",
      name: "ဦးမောင်မောင်သန်း",
      phone: "09-260119933",
      township: "မြောင်းမြမြို့နယ်",
      address: "ကွမ်းခြံကျေးရွာ",
      currentAdvanceBalance: 6000000,
      creditLimit: 8000000,
    },
    {
      id: "FAR-106",
      name: "ဦးတင်ဝင်း",
      phone: "09-400123456",
      township: "ဖျာပုံမြို့နယ်",
      address: "ချောင်းဖျားကျေးရွာ",
      currentAdvanceBalance: 0,
      creditLimit: 5000000,
    },
  ];

  // ================= MOCK ADVANCE DATA =================
  const [advances, setAdvances] = useState<AdvanceRecord[]>([
    {
      id: "ADV-001",
      voucherNo: "ADV-2026-081",
      farmerId: "FAR-101",
      farmerName: "ဦးအေးမောင်",
      phone: "09-420011223",
      township: "ရွှေဘိုမြို့နယ်",
      address: "သခွတ်တောကျေးရွာ",
      issueDate: "၂၀၂၆-၀၉-၁၂",
      principalAmount: 5000000,
      repaidAmount: 3500000,
      remainingBalance: 1500000,
      expectedSettlementDate: "၂၀၂၆-၁၂-၃၀",
      status: "partial",
      notes: "စပါးပေါ်ချိန် ကုန်ဖြင့် စာရင်းရှင်းရန်",
    },
    {
      id: "ADV-002",
      voucherNo: "ADV-2026-082",
      farmerId: "FAR-102",
      farmerName: "ဒေါ်လှကြည်",
      phone: "09-250033445",
      township: "ဝက်လက်မြို့နယ်",
      address: "ရွာသာအေးကျေးရွာ",
      issueDate: "၂၀၂၆-၁၀-၀၅",
      principalAmount: 4500000,
      repaidAmount: 0,
      remainingBalance: 4500000,
      expectedSettlementDate: "၂၀၂၆-၁၁-၁၅",
      status: "overdue",
      notes: "ရက်လွန်သတိပေးစာ ပေးပို့ပြီး",
    },
    {
      id: "ADV-003",
      voucherNo: "ADV-2026-083",
      farmerId: "FAR-103",
      farmerName: "ဦးဘကြည်",
      phone: "09-790088990",
      township: "ဒေးဒရဲမြို့နယ်",
      address: "ဆိပ်ကြီးကျေးရွာ",
      issueDate: "၂၀၂၆-၀၈-၂၀",
      principalAmount: 3000000,
      repaidAmount: 3000000,
      remainingBalance: 0,
      expectedSettlementDate: "၂၀၂၆-၁၀-၂၅",
      status: "settled",
      notes: "ကုန်သွင်းပြီး စာရင်းရှင်းပြီး",
    },
    {
      id: "ADV-004",
      voucherNo: "ADV-2026-084",
      farmerId: "FAR-104",
      farmerName: "ဦးစိုးဝင်း",
      phone: "09-450077661",
      township: "ဟင်္သာတမြို့နယ်",
      address: "နတ်မော်ကျေးရွာ",
      issueDate: "၂၀၂၆-၁၀-၁၈",
      principalAmount: 2000000,
      repaidAmount: 1200000,
      remainingBalance: 800000,
      expectedSettlementDate: "၂၀၂၆-၁၂-၁၅",
      status: "partial",
      notes: "တစ်စိတ်တစ်ပိုင်း ရှင်းပြီး",
    },
    {
      id: "ADV-005",
      voucherNo: "ADV-2026-085",
      farmerId: "FAR-105",
      farmerName: "ဦးမောင်မောင်သန်း",
      phone: "09-260119933",
      township: "မြောင်းမြမြို့နယ်",
      address: "ကွမ်းခြံကျေးရွာ",
      issueDate: "၂၀၂၆-၁၁-၀၁",
      principalAmount: 6000000,
      repaidAmount: 0,
      remainingBalance: 6000000,
      expectedSettlementDate: "၂၀၂၇-၀၁-၁၀",
      status: "pending",
      notes: "စိုက်ပျိုးစရိတ် ဓာတ်မြေဩဇာဖိုး ကြိုထုတ်",
    },
  ]);

  // ================= STATE FOR SEARCH & FILTERS =================
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFarmerId, setSelectedFarmerId] = useState("");
  const [newAdvance, setNewAdvance] = useState({
    principalAmount: "",
    expectedSettlementDate: "",
    notes: "",
  });

  const currentSelectedFarmer = regularFarmers.find(
    (f) => f.id === selectedFarmerId
  );

  // ================= COMPUTED SUMMARY METRICS =================
  const totalOutstanding = advances.reduce(
    (acc, curr) => acc + curr.remainingBalance,
    0
  );
  const totalIssued = advances.reduce(
    (acc, curr) => acc + curr.principalAmount,
    0
  );
  const totalRepaid = advances.reduce(
    (acc, curr) => acc + curr.repaidAmount,
    0
  );
  const overdueCount = advances.filter((a) => a.status === "overdue").length;

  // Filtered List
  const filteredAdvances = advances.filter((item) => {
    const matchesSearch =
      item.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.township.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleAddAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSelectedFarmer || !newAdvance.principalAmount) return;

    const amount = Number(newAdvance.principalAmount) || 0;
    const newRecord: AdvanceRecord = {
      id: `ADV-${Math.floor(100 + Math.random() * 900)}`,
      voucherNo: `ADV-2026-${Math.floor(100 + Math.random() * 900)}`,
      farmerId: currentSelectedFarmer.id,
      farmerName: currentSelectedFarmer.name,
      phone: currentSelectedFarmer.phone,
      township: currentSelectedFarmer.township,
      address: currentSelectedFarmer.address,
      issueDate: new Date().toISOString().split("T")[0],
      principalAmount: amount,
      repaidAmount: 0,
      remainingBalance: amount,
      expectedSettlementDate: newAdvance.expectedSettlementDate || "၂၀၂၆-၁၂-၃၁",
      status: "pending",
      notes: newAdvance.notes.trim() || "စိုက်ပျိုးစရိတ် ကြိုထုတ်ငွေ",
    };

    setAdvances([newRecord, ...advances]);
    setIsAddModalOpen(false);
    setSelectedFarmerId("");
    setNewAdvance({
      principalAmount: "",
      expectedSettlementDate: "",
      notes: "",
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 select-none pb-3">
      {/* ================= 1. GREETING & HEADER ================= */}
      <div className="relative overflow-hidden py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">
          တောင်သူ ကြိုထုတ်ငွေ စာရင်းများ (Cash Advances)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 sm:mt-3 max-w-xl leading-relaxed">
          စပါးနှင့် ပဲမျိုးစုံ စိုက်ပျိုးချိန် ကြိုတင်ထုတ်ပေးထားသော
          စိုက်ပျိုးစရိတ်များနှင့် ကုန်စည်ပေါ်ချိန် ပြန်လည်ခုနှိမ်ရှင်းလင်းမှု
          စာရင်းချုပ်
        </p>
      </div>

      {/* ================= 2. 4 KPI SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {/* Card 1: ကြိုထုတ်ငွေ လက်ကျန် စုစုပေါင်း */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              ကြိုထုတ်ငွေ လက်ကျန် စုစုပေါင်း
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Wallet size={18} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {(totalOutstanding / 100000).toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-500">
                သိန်း ကျပ်
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              တောင်သူ {advances.filter((a) => a.remainingBalance > 0).length} ဦး
              ထံမှ ကုန်ဖြင့် ရှင်းရန်ကျန်
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-600 font-bold">
            <span>စိုက်ပျိုးစရိတ် ကြိုထုတ်လက်ကျန်</span>
            <span className="text-[11px] text-slate-400 font-normal truncate ml-2">
              သီးနှံအာမခံရယူပြီး
            </span>
          </div>
        </div>

        {/* Card 2: စုစုပေါင်း ထုတ်ပေးငွေ မူရင်း */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              စုစုပေါင်း ထုတ်ပေးငွေ မူရင်း
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Receipt size={18} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {(totalIssued / 100000).toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-500">
                သိန်း ကျပ်
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              စုစုပေါင်း ဘောက်ချာ {advances.length} စောင်
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
            <span className="flex items-center">
              <TrendingUp size={14} className="mr-1 shrink-0" /> ထုတ်ပေးပြီးငွေ
            </span>
            <span className="text-[11px] text-slate-400 font-normal truncate ml-2">
              ရာသီအလိုက်
            </span>
          </div>
        </div>

        {/* Card 3: ကုန်ဖြင့် ခုနှိမ်ဆပ်ပြီးငွေ */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              ကုန်ဖြင့် ခုနှိမ်ဆပ်ပြီးငွေ
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {(totalRepaid / 100000).toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-500">
                သိန်း ကျပ်
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              စုစုပေါင်း မူရင်း၏ {Math.round((totalRepaid / totalIssued) * 100)}
              % ပြန်လည်ရရှိပြီး
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-bold">
            <span>ရှင်းပြီးငွေ စုစုပေါင်း</span>
            <span className="text-[11px] text-slate-400 font-normal truncate ml-2">
              ပုံမှန် ကုန်သွင်းဆဲ
            </span>
          </div>
        </div>

        {/* Card 4: ရက်လွန် သတိပေးစာရင်း */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              ရက်လွန် သတိပေးစာရင်း
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertCircle size={18} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {overdueCount}{" "}
              <span className="text-xs font-normal text-slate-500">ဦး</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              သတ်မှတ်ချိန်အတွင်း ကုန်မရောက်သေးသူများ
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-rose-600 font-bold">
            <span>အမြန်ဆက်သွယ်ရန်</span>
            <span className="text-[11px] text-slate-400 font-normal truncate ml-2">
              အာမခံစစ်ဆေးပါ
            </span>
          </div>
        </div>
      </div>

      {/* ================= 3. FILTER BUTTONS & ACTION BAR ================= */}
      <div className="space-y-4">
        {/* Standalone Status Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer shrink-0 ${
                statusFilter === "all"
                  ? "bg-btn-color text-white"
                  : "bg-card border border-slate-200 text-slate-600"
              }`}
            >
              အားလုံး ({advances.length})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("pending")}
              className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer shrink-0 ${
                statusFilter === "pending"
                  ? "bg-btn-color text-white"
                  : "bg-card border border-slate-200 text-slate-600"
              }`}
            >
              မဆပ်ရသေးသူများ (
              {advances.filter((a) => a.status === "pending").length})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("partial")}
              className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer shrink-0 ${
                statusFilter === "partial"
                  ? "bg-btn-color text-white"
                  : "bg-card border border-slate-200 text-slate-600"
              }`}
            >
              တစ်စိတ်တစ်ပိုင်းရှင်းပြီး (
              {advances.filter((a) => a.status === "partial").length})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("overdue")}
              className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer shrink-0 ${
                statusFilter === "overdue"
                  ? "bg-btn-color text-white"
                  : "bg-card border border-slate-200 text-slate-600"
              }`}
            >
              ရက်လွန် ({overdueCount})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("settled")}
              className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer shrink-0 ${
                statusFilter === "settled"
                  ? "bg-btn-color text-white"
                  : "bg-card border border-slate-200 text-slate-600"
              }`}
            >
              အပြေအကျေရှင်းပြီး (
              {advances.filter((a) => a.status === "settled").length})
            </button>
          </div>

          <div className="text-xs text-slate-500 font-semibold px-1 shrink-0">
            လက်ရှိ စာရင်း:{" "}
            <span className="font-bold text-slate-800">
              {filteredAdvances.length} စောင်
            </span>
          </div>
        </div>

        {/* Search + Add Voucher Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 sm:p-4 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="ဘောက်ချာအမှတ်၊ တောင်သူအမည်၊ မြို့နယ် (သို့) ဖုန်းနံပါတ်ဖြင့် ရှာပါ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium focus:outline-hidden"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 text-xs text-white bg-btn-color hover:bg-btn-hover rounded-full shadow-sm cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>ကြိုထုတ်ငွေသစ် ထုတ်ပေးမည်</span>
          </button>
        </div>
      </div>

      {/* ================= 4. RESPONSIVE CARDS & TABLE VIEW ================= */}
      {/* A. Mobile & Tablet Card View (< lg) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 lg:hidden">
        {filteredAdvances.length === 0 ? (
          <div className="col-span-full bg-card rounded-3xl p-10 text-center border border-slate-200/80 shadow-xs">
            <p className="text-sm font-bold text-slate-500">
              ရှာဖွေမှုနှင့် ကိုက်ညီသော ကြိုထုတ်ငွေစာရင်း မရှိပါ
            </p>
          </div>
        ) : (
          filteredAdvances.map((adv) => {
            const repaymentPercent = Math.min(
              100,
              Math.round((adv.repaidAmount / adv.principalAmount) * 100)
            );

            return (
              <div
                key={adv.id}
                className="bg-card rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                        {adv.voucherNo}
                      </span>
                      <h3 className="text-sm font-bold text-slate-800 mt-2 leading-tight">
                        {adv.farmerName}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <MapPin size={11} /> {adv.township} &bull; {adv.address}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        adv.status === "settled"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                          : adv.status === "partial"
                          ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                          : adv.status === "overdue"
                          ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                          : "bg-amber-50 text-amber-700 border border-amber-200/60"
                      }`}
                    >
                      {adv.status === "settled"
                        ? "ရှင်းပြီး"
                        : adv.status === "partial"
                        ? "တစ်စိတ်တစ်ပိုင်း"
                        : adv.status === "overdue"
                        ? "ရက်လွန်"
                        : "မဆပ်ရသေး"}
                    </span>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar size={12} className="text-slate-400" />{" "}
                      ထုတ်ပေးသည့်ရက်: {adv.issueDate}
                    </span>
                  </div>

                  <div className="mt-3 bg-slate-50 p-3 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        ကြိုထုတ်ငွေ မူရင်း:
                      </span>
                      <span className="font-bold font-mono text-slate-800">
                        {adv.principalAmount.toLocaleString()} ကျပ်
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        ကုန်ဖြင့် ရှင်းပြီးငွေ:
                      </span>
                      <span className="font-bold font-mono text-emerald-600">
                        {adv.repaidAmount.toLocaleString()} ကျပ်
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                      <span className="font-bold text-slate-700">
                        လက်ကျန်ငွေ:
                      </span>
                      <span
                        className={`font-black font-mono text-sm ${
                          adv.remainingBalance === 0
                            ? "text-emerald-600"
                            : adv.status === "overdue"
                            ? "text-rose-600"
                            : "text-amber-600"
                        }`}
                      >
                        {adv.remainingBalance.toLocaleString()} ကျပ်
                      </span>
                    </div>

                    <div className="pt-1.5">
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full ${
                            adv.status === "settled"
                              ? "bg-emerald-500"
                              : "bg-btn-color"
                          }`}
                          style={{ width: `${repaymentPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                        <span>ဆပ်ပြီး: {repaymentPercent}%</span>
                        <span>ရှင်းမည့်ရက်: {adv.expectedSettlementDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={`tel:${adv.phone}`}
                    className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Phone size={12} />
                    <span>{adv.phone}</span>
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
                      className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                      title="ပြင်ဆင်မည်"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          confirm(
                            `${adv.voucherNo} အား ဖျက်ပစ်ရန် သေချာပါသလား?`
                          )
                        ) {
                          setAdvances((prev) =>
                            prev.filter((a) => a.id !== adv.id)
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
            );
          })
        )}
      </div>

      {/* B. Desktop Table View (>= lg) */}
      <div className="hidden lg:block bg-card rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-[11px] font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">ဘောက်ချာ အမှတ်</th>
                <th className="px-5 py-3.5">တောင်သူ အမည် / ဒေသ</th>
                <th className="px-5 py-3.5">ထုတ်ပေးသည့်ရက်</th>
                <th className="px-5 py-3.5 text-right">ထုတ်ပေးငွေ (ကျပ်)</th>
                <th className="px-5 py-3.5 text-right">ဆပ်ပြီးငွေ (ကျပ်)</th>
                <th className="px-5 py-3.5 text-right">ကျန်ငွေ (ကျပ်)</th>
                <th className="px-5 py-3.5 text-center">အခြေအနေ</th>
                <th className="px-5 py-3.5 text-center">လုပ်ဆောင်ချက်</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredAdvances.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-10 text-center text-slate-400 font-bold"
                  >
                    ရှာဖွေမှုနှင့် ကိုက်ညီသော စာရင်း မတွေ့ရှိပါ
                  </td>
                </tr>
              ) : (
                filteredAdvances.map((adv) => {
                  const percent = Math.min(
                    100,
                    Math.round((adv.repaidAmount / adv.principalAmount) * 100)
                  );

                  return (
                    <tr key={adv.id} className="hover:bg-slate-50/80">
                      <td className="px-5 py-4 font-mono font-bold text-slate-900">
                        {adv.voucherNo}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-800 text-xs">
                          {adv.farmerName}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {adv.township} &bull; {adv.phone}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-mono text-slate-700">
                        {adv.issueDate}
                      </td>

                      <td className="px-5 py-4 text-right font-mono font-bold text-slate-800">
                        {adv.principalAmount.toLocaleString()}
                      </td>

                      <td className="px-5 py-4 text-right font-mono text-emerald-600">
                        {adv.repaidAmount.toLocaleString()}
                        <span className="text-[10px] text-slate-400 block font-sans">
                          ({percent}%)
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <span
                          className={`font-black font-mono text-sm ${
                            adv.remainingBalance === 0
                              ? "text-emerald-600"
                              : adv.status === "overdue"
                              ? "text-rose-600"
                              : "text-amber-600"
                          }`}
                        >
                          {adv.remainingBalance.toLocaleString()}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            adv.status === "settled"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              : adv.status === "partial"
                              ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                              : adv.status === "overdue"
                              ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                              : "bg-amber-50 text-amber-700 border border-amber-200/60"
                          }`}
                        >
                          {adv.status === "settled"
                            ? "ရှင်းပြီး"
                            : adv.status === "partial"
                            ? "တစ်စိတ်တစ်ပိုင်း"
                            : adv.status === "overdue"
                            ? "ရက်လွန်"
                            : "မဆပ်ရသေး"}
                        </span>
                      </td>

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
                            className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                            title="ပြင်ဆင်မည်"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                confirm(
                                  `${adv.voucherNo} အား ဖျက်ပစ်ရန် သေချာပါသလား?`
                                )
                              ) {
                                setAdvances((prev) =>
                                  prev.filter((a) => a.id !== adv.id)
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= 5. MODAL: CREATE NEW ADVANCE VOUCHER ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-card w-full max-w-lg rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xl max-h-[92vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-btn-color text-white flex items-center justify-center font-bold">
                  <Wallet size={17} />
                </div>
                <h3 className="font-bold text-slate-800 text-base">
                  စိုက်ပျိုးစရိတ် ကြိုထုတ်ငွေ ထုတ်ပေးခြင်း
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleAddAdvance}
              className="mt-4 space-y-3.5 text-xs font-semibold"
            >
              {/* တောင်သူ ရွေးချယ်ရန် Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    တောင်သူ ရွေးချယ်ပါ (ပုံမှန်အရောင်းအဝယ်ရှိသူများ)
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {regularFarmers.length} ဦး စာရင်းသွင်းပြီး
                  </span>
                </div>
                <select
                  value={selectedFarmerId}
                  onChange={(e) => setSelectedFarmerId(e.target.value)}
                  required
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden cursor-pointer"
                >
                  <option value="">-- တောင်သူ အမည် ရွေးချယ်ပါ --</option>
                  {regularFarmers.map((farmer) => (
                    <option key={farmer.id} value={farmer.id}>
                      {farmer.name} ({farmer.township})
                    </option>
                  ))}
                </select>
              </div>

              {/* ရွေးချယ်ထားသော တောင်သူ၏ Live အချက်အလက် Card */}
              {currentSelectedFarmer && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <UserCheck size={14} className="text-emerald-600" />
                      {currentSelectedFarmer.name}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {currentSelectedFarmer.phone}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>ဒေသ / လိပ်စာ:</span>
                    <span className="font-bold text-slate-700">
                      {currentSelectedFarmer.township} &bull;{" "}
                      {currentSelectedFarmer.address}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/60">
                    <span>လက်ရှိ ကြိုထုတ်ငွေကျန်:</span>
                    <span
                      className={`font-mono font-bold ${
                        currentSelectedFarmer.currentAdvanceBalance > 0
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {currentSelectedFarmer.currentAdvanceBalance > 0
                        ? `${currentSelectedFarmer.currentAdvanceBalance.toLocaleString()} ကျပ်`
                        : "ကျန်ငွေမရှိ"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span>အကြွေးကန့်သတ်ငွေ (Limit):</span>
                    <span className="font-mono font-bold text-slate-800">
                      {currentSelectedFarmer.creditLimit.toLocaleString()} ကျပ်
                    </span>
                  </div>
                </div>
              )}

              {/* ထုတ်ပေးငွေ & ရှင်းမည့်ရက် (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ထုတ်ပေးငွေ (ကျပ်)
                  </label>
                  <input
                    type="number"
                    min="10000"
                    required
                    placeholder="ဥပမာ - ၅,၀၀၀,၀၀၀"
                    value={newAdvance.principalAmount}
                    onChange={(e) =>
                      setNewAdvance({
                        ...newAdvance,
                        principalAmount: e.target.value,
                      })
                    }
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    သီးနှံသွင်းရှင်းမည့် ခန့်မှန်းရက်
                  </label>
                  <input
                    type="date"
                    value={newAdvance.expectedSettlementDate}
                    onChange={(e) =>
                      setNewAdvance({
                        ...newAdvance,
                        expectedSettlementDate: e.target.value,
                      })
                    }
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* မှတ်ချက် / အာမခံ (Textarea) */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  မှတ်ချက် / အာမခံ
                </label>
                <textarea
                  rows={2}
                  placeholder="ဥပမာ - စပါးပေါ်ချိန် ကုန်ဖြင့် စာရင်းရှင်းရန်၊ လယ် ၅ ဧက အထွက်ဖြင့် အာမခံထားပါသည်..."
                  value={newAdvance.notes}
                  onChange={(e) =>
                    setNewAdvance({ ...newAdvance, notes: e.target.value })
                  }
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-200 focus:outline-hidden resize-none leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-full sm:w-auto px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer text-center"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  disabled={!selectedFarmerId}
                  className="w-full sm:w-auto px-6 py-2 text-xs font-bold text-white bg-btn-color hover:bg-btn-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-full shadow-sm cursor-pointer text-center"
                >
                  ဘောက်ချာ သိမ်းဆည်းမည်
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
