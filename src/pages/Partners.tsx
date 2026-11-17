import React, { useState, useRef, useEffect } from "react";
import {
  Users,
  UserCheck,
  Search,
  Plus,
  Phone,
  MapPin,
  Sliders,
  ChevronDown,
  Wallet,
  CreditCard,
  Edit3,
  Trash2,
  X,
  TrendingUp,
  Receipt,
  Building2,
  Tractor,
} from "lucide-react";

// ================= TYPES =================
export interface Partner {
  id: string;
  type: "farmer" | "buyer";
  name: string;
  phone: string;
  township: string;
  address: string;
  balance: number;
  consignmentBags?: number;
  creditLimit: number;
  status: "active" | "credit_warning" | "cleared";
}

export const Partners: React.FC = () => {
  const [partnerType, setPartnerType] = useState<"farmer" | "buyer">("farmer");

  // ================= MOCK PARTNERS DATA =================
  const [partners, setPartners] = useState<Partner[]>([
    {
      id: "FAR-101",
      type: "farmer",
      name: "ဦးအေးမောင်",
      phone: "09-420011223",
      township: "ရွှေဘိုမြို့နယ်",
      address: "သခွတ်တောကျေးရွာ",
      balance: 1500000,
      consignmentBags: 250,
      creditLimit: 5000000,
      status: "active",
    },
    {
      id: "FAR-102",
      type: "farmer",
      name: "ဒေါ်လှကြည်",
      phone: "09-250033445",
      township: "ဝက်လက်မြို့နယ်",
      address: "ရွာသာအေးကျေးရွာ",
      balance: 4500000,
      consignmentBags: 600,
      creditLimit: 5000000,
      status: "credit_warning",
    },
    {
      id: "FAR-103",
      type: "farmer",
      name: "ဦးဘကြည်",
      phone: "09-790088990",
      township: "ဒေးဒရဲမြို့နယ်",
      address: "ဆိပ်ကြီးကျေးရွာ",
      balance: 0,
      consignmentBags: 120,
      creditLimit: 3000000,
      status: "cleared",
    },
    {
      id: "FAR-104",
      type: "farmer",
      name: "ဦးစိုးဝင်း",
      phone: "09-450077661",
      township: "ဟင်္သာတမြို့နယ်",
      address: "နတ်မော်ကျေးရွာ",
      balance: 800000,
      consignmentBags: 80,
      creditLimit: 2000000,
      status: "active",
    },
    // Buyers
    {
      id: "BUY-201",
      type: "buyer",
      name: "ရွှေဝါ ဆန်စက်ကြီးနှင့် သီးနှံကုန်သည်",
      phone: "09-430099881",
      township: "ရန်ကုန် (ဘုရင့်နောင်)",
      address: "ဒိုင်လမ်းမကြီး၊ ရုံအမှတ် (ဂ-၁၄)",
      balance: 14500000,
      creditLimit: 30000000,
      status: "active",
    },
    {
      id: "BUY-202",
      type: "buyer",
      name: "မန္တလေး ပဲကုန်စည်ဒိုင် (ဦးကျော်ဇော)",
      phone: "09-20011447",
      township: "မန္တလေးမြို့",
      address: "သီရိမာလာ ကုန်စည်ဒိုင်တန်း",
      balance: 28000000,
      creditLimit: 25000000,
      status: "credit_warning",
    },
    {
      id: "BUY-203",
      type: "buyer",
      name: "အောင်သုခ ပေါင်းဆန်စက်",
      phone: "09-780011229",
      township: "မော်လမြိုင်ကျွန်း",
      address: "စက်မှုဇုန်ရပ်ကွက်",
      balance: 0,
      creditLimit: 15000000,
      status: "cleared",
    },
  ]);

  // ================= STATE FOR SEARCH & FILTER =================
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPartner, setNewPartner] = useState({
    type: "farmer" as "farmer" | "buyer",
    name: "",
    phone: "",
    township: "",
    address: "",
    creditLimit: 0,
  });

  // Click Outside Listener
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

  // ================= COMPUTED SUMMARY METRICS =================
  const farmersList = partners.filter((p) => p.type === "farmer");
  const buyersList = partners.filter((p) => p.type === "buyer");

  const totalFarmerAdvances = farmersList.reduce(
    (acc, f) => acc + f.balance,
    0
  );
  const totalBuyerReceivables = buyersList.reduce(
    (acc, b) => acc + b.balance,
    0
  );
  const totalConsignmentBags = farmersList.reduce(
    (acc, f) => acc + (f.consignmentBags || 0),
    0
  );

  // Filter definitions
  const filterOptions = [
    { id: "all", label: "အားလုံး" },
    { id: "active", label: "ပုံမှန်စာရင်း" },
    { id: "credit_warning", label: "အကြွေးသတိပေးအဆင့်" },
    { id: "cleared", label: "စာရင်းရှင်းပြီးသူများ" },
  ];

  const selectedFilterObj =
    filterOptions.find((f) => f.id === statusFilter) || filterOptions[0];

  const activeList = partners.filter((p) => p.type === partnerType);

  const filteredPartners = activeList.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.township.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleAddPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartner.name.trim()) return;

    const partner: Partner = {
      id: `${newPartner.type === "farmer" ? "FAR" : "BUY"}-${Math.floor(
        100 + Math.random() * 900
      )}`,
      type: newPartner.type,
      name: newPartner.name.trim(),
      phone: newPartner.phone.trim() || "-",
      township: newPartner.township.trim() || "ဒေသတွင်း",
      address: newPartner.address.trim() || "-",
      balance: 0,
      consignmentBags: 0,
      creditLimit: Number(newPartner.creditLimit) || 0,
      status: "active",
    };

    setPartners([partner, ...partners]);
    setIsAddModalOpen(false);
    setNewPartner({
      type: "farmer",
      name: "",
      phone: "",
      township: "",
      address: "",
      creditLimit: 0,
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 select-none pb-3">
      {/* ================= 1. GREETING & HEADER ================= */}
      <div className="relative overflow-hidden py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">
          တောင်သူနှင့် ဝယ်လက် မိတ်ဖက်များ စီမံခန့်ခွဲမှု
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 sm:mt-3 max-w-xl leading-relaxed">
          သီးနှံစိုက်ပျိုးတောင်သူများ၏ အပ်ကုန်နှင့် စိုက်ပျိုးစရိတ်
          ကြိုထုတ်ငွေများ၊ ဝယ်လက်ကုန်သည်ကြီးများ၏ ရရန်ရှိငွေနှင့်
          အရောင်းအဝယ်စာရင်းများ
        </p>
      </div>

      {/* ================= 2. 4 KPI SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {/* Card 1: တောင်သူ စုစုပေါင်း */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              စုစုပေါင်း မိတ်ဖက်တောင်သူ
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Tractor size={18} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {farmersList.length}{" "}
              <span className="text-xs font-normal text-slate-500">ဦး</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              အပ်ကုန်လက်ကျန်:{" "}
              <strong className="text-slate-700">
                {totalConsignmentBags.toLocaleString()}
              </strong>{" "}
              အိတ်
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
            <span className="flex items-center">
              <TrendingUp size={14} className="mr-1 shrink-0" />{" "}
              ပုံမှန်ကုန်သွင်းဆဲ
            </span>
            <span className="text-[11px] text-slate-400 font-normal truncate ml-2">
              စပါးနှင့် ပဲစိုက်တောင်သူများ
            </span>
          </div>
        </div>

        {/* Card 2: ဝယ်လက် စုစုပေါင်း */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              စုစုပေါင်း ဝယ်လက်ကုန်သည်
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Building2 size={18} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {buyersList.length}{" "}
              <span className="text-xs font-normal text-slate-500">
                ဦး/စက်ရုံ
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              ရန်ကုန်၊ မန္တလေး နှင့် ဒေသတွင်းစက်ပိုင်များ
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
            <span className="flex items-center">
              <UserCheck size={14} className="mr-1 shrink-0" />{" "}
              လက်ငင်း/အကြွေးဝယ်လက်
            </span>
            <span className="text-[11px] text-slate-400 font-normal truncate ml-2">
              ဒိုင်ကြီးများ
            </span>
          </div>
        </div>

        {/* Card 3: တောင်သူ ကြိုထုတ်ငွေ */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              တောင်သူ ကြိုထုတ်ငွေ လက်ကျန်
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Wallet size={18} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {(totalFarmerAdvances / 100000).toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-500">
                သိန်း ကျပ်
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              မတ်ပဲနှင့် စပါးပေါ်ချိန် ကုန်ဖြင့် စာရင်းရှင်းရန်
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-600 font-bold">
            <span>စိုက်ပျိုးစရိတ် ကြိုတင်ငွေ</span>
            <span className="text-[11px] text-slate-400 font-normal truncate ml-2">
              သီးနှံအာမခံရယူပြီး
            </span>
          </div>
        </div>

        {/* Card 4: ဝယ်လက် ရရန်ရှိငွေ */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              ဝယ်လက်များထံမှ ရရန်ရှိငွေ
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <CreditCard size={18} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {(totalBuyerReceivables / 100000).toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-500">
                သိန်း ကျပ်
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              အကြွေးဝယ်လက်များ၏ ပေးရန်ကျန်ငွေ
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-purple-700 font-bold">
            <span>အကြွေးရရန်စာရင်း</span>
            <span className="text-[11px] text-slate-400 font-normal truncate ml-2">
              ရက်လွန်သတိပေးမှုများ
            </span>
          </div>
        </div>
      </div>

      {/* ================= 3. PARTNER TYPE SELECTOR & ACTION STRIP ================= */}
      <div className="space-y-4">
        {/* Buttons ၂ ခု */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setPartnerType("farmer");
                setSearchTerm("");
              }}
              className={`px-4 py-3 rounded-full text-xs font-bold cursor-pointer ${
                partnerType === "farmer"
                  ? "bg-btn-color text-white"
                  : "bg-card border border-slate-200 text-slate-600"
              }`}
            >
              တောင်သူများ
            </button>

            <button
              type="button"
              onClick={() => {
                setPartnerType("buyer");
                setSearchTerm("");
              }}
              className={`px-4 py-3 rounded-full text-xs font-bold cursor-pointer ${
                partnerType === "buyer"
                  ? "bg-btn-color text-white"
                  : "bg-card border border-slate-200 text-slate-600"
              }`}
            >
              ဝယ်လက် / ကုန်သည်များ
            </button>
          </div>

          <div className="text-xs text-slate-500 font-semibold px-1">
            လက်ရှိဖော်ပြထားသော မိတ်ဖက်:{" "}
            <span className="font-bold text-slate-800">
              {filteredPartners.length} ဦး
            </span>
          </div>
        </div>

        {/* Search + Dropdown Filter + Create Button */}
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
                placeholder={
                  partnerType === "farmer"
                    ? "တောင်သူအမည်၊ မြို့နယ် (သို့) ဖုန်းနံပါတ်ဖြင့် ရှာပါ..."
                    : "ဝယ်လက်အမည်၊ ဆန်စက်၊ ဒိုင် (သို့) ဖုန်းဖြင့် ရှာပါ..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium focus:outline-hidden"
              />
            </div>

            {/* Dropdown Filter */}
            <div className="relative shrink-0" ref={filterRef}>
              <button
                type="button"
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className="h-9 px-3.5 rounded-full bg-slate-50 border border-slate-200/90 text-xs font-bold text-slate-700 flex items-center justify-between gap-2 cursor-pointer w-full sm:w-auto"
              >
                <div className="flex items-center gap-2">
                  <Sliders size={13} className="text-slate-500" />
                  <span>{selectedFilterObj.label}</span>
                </div>
                <ChevronDown size={13} className="text-slate-400" />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-1.5 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    အခြေအနေ စစ်ထုတ်ပါ
                  </div>
                  {filterOptions.map((opt) => {
                    const isSelected = statusFilter === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setStatusFilter(opt.id);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold cursor-pointer text-left ${
                          isSelected
                            ? "bg-btn-color text-white"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <span>{opt.label}</span>
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
            onClick={() => {
              setNewPartner((prev) => ({ ...prev, type: partnerType }));
              setIsAddModalOpen(true);
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 text-xs text-white bg-btn-color hover:bg-btn-hover rounded-full shadow-sm cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>
              {partnerType === "farmer"
                ? "တောင်သူအသစ် ထည့်မည်"
                : "ဝယ်လက်အသစ် ထည့်မည်"}
            </span>
          </button>
        </div>
      </div>

      {/* ================= 4. RESPONSIVE CARDS GRID ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {filteredPartners.length === 0 ? (
          <div className="col-span-full bg-card rounded-3xl p-10 text-center border border-slate-200/80 shadow-xs">
            <p className="text-sm font-bold text-slate-500">
              ရှာဖွေမှုနှင့် ကိုက်ညီသော စာရင်း မတွေ့ရှိပါ
            </p>
          </div>
        ) : (
          filteredPartners.map((partner) => (
            <div
              key={partner.id}
              className="bg-card rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Card Top Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border ${
                        partner.type === "farmer"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200/70"
                          : "bg-blue-50 text-blue-700 border-blue-200/70"
                      }`}
                    >
                      {partner.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 leading-tight">
                        {partner.name}
                      </h3>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 mt-1 inline-block">
                        {partner.id}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      partner.status === "active"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                        : partner.status === "credit_warning"
                        ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {partner.status === "active"
                      ? "ပုံမှန်"
                      : partner.status === "credit_warning"
                      ? "အကြွေးသတိပေး"
                      : "စာရင်းရှင်းပြီး"}
                  </span>
                </div>

                {/* Location */}
                <div className="mt-3.5 text-xs text-slate-500">
                  <p className="flex items-center gap-1.5 text-[11px]">
                    <MapPin size={12} className="text-slate-400 shrink-0" />
                    <span className="truncate">
                      {partner.township} &bull; {partner.address}
                    </span>
                  </p>
                </div>

                {/* Financial Balance Strip */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      {partner.type === "farmer"
                        ? "ကြိုထုတ်ငွေ လက်ကျန်:"
                        : "ရရန်ရှိငွေ (အကြွေး):"}
                    </span>
                    <span
                      className={`font-black font-mono text-sm ${
                        partner.balance > 0
                          ? partner.status === "credit_warning"
                            ? "text-rose-600"
                            : "text-amber-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {partner.balance > 0
                        ? `${partner.balance.toLocaleString()} ကျပ်`
                        : "ကျန်ငွေမရှိ (ရှင်းပြီး)"}
                    </span>
                  </div>

                  {/* အကြွေးကန့်သတ်ငွေ ဖော်ပြချက် */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>အကြွေးကန့်သတ်ငွေ:</span>
                    <span className="font-bold text-slate-800 font-mono">
                      {partner.creditLimit > 0
                        ? `${partner.creditLimit.toLocaleString()} ကျပ်`
                        : "မသတ်မှတ်ထားပါ"}
                    </span>
                  </div>

                  {partner.type === "farmer" &&
                    partner.consignmentBags !== undefined && (
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>ဂိုဒေါင်အပ်ကုန် လက်ကျန်:</span>
                        <span className="font-bold text-slate-800 font-mono">
                          {partner.consignmentBags} အိတ်
                        </span>
                      </div>
                    )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={`tel:${partner.phone}`}
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Phone size={12} />
                  <span>{partner.phone}</span>
                </a>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                    title="စာရင်းမှတ်တမ်း ကြည့်မည်"
                  >
                    <Receipt size={14} />
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
                          `${partner.name} အား စာရင်းမှ ဖျက်ပစ်ရန် သေချာပါသလား?`
                        )
                      ) {
                        setPartners((prev) =>
                          prev.filter((p) => p.id !== partner.id)
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

      {/* ================= 5. MODAL: ADD PARTNER (Scroll Bar ဖျောက်ထားပါသည်) ================= */}
      {/* ================= 5. MODAL: ADD PARTNER (Size ညှိပြီး) ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-card w-full max-w-lg rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xl max-h-[92vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-btn-color text-white flex items-center justify-center font-bold">
                  {newPartner.type === "farmer" ? (
                    <Tractor size={17} />
                  ) : (
                    <Building2 size={17} />
                  )}
                </div>
                <h3 className="font-bold text-slate-800 text-base">
                  {newPartner.type === "farmer"
                    ? "တောင်သူအသစ် စာရင်းသွင်းခြင်း"
                    : "ဝယ်လက်အသစ် စာရင်းသွင်းခြင်း"}
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
              onSubmit={handleAddPartner}
              className="mt-4 space-y-3.5 text-xs font-semibold"
            >
              {/* Type Switcher */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  မိတ်ဖက် အမျိုးအစား ရွေးချယ်ပါ
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setNewPartner({ ...newPartner, type: "farmer" })
                    }
                    className={`py-2 rounded-full text-xs font-bold cursor-pointer border ${
                      newPartner.type === "farmer"
                        ? "bg-btn-color text-white border-transparent"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    တောင်သူ (Farmer)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNewPartner({ ...newPartner, type: "buyer" })
                    }
                    className={`py-2 rounded-full text-xs font-bold cursor-pointer border ${
                      newPartner.type === "buyer"
                        ? "bg-btn-color text-white border-transparent"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    ဝယ်လက် (Buyer)
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {newPartner.type === "farmer"
                    ? "တောင်သူ အမည်"
                    : "ဝယ်လက် / လုပ်ငန်း အမည်"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    newPartner.type === "farmer"
                      ? "ဥပမာ - ဦးအေးမောင်"
                      : "ဥပမာ - ရွှေဝါ ဆန်စက်"
                  }
                  value={newPartner.name}
                  onChange={(e) =>
                    setNewPartner({ ...newPartner, name: e.target.value })
                  }
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
                />
              </div>

              {/* Phone & Township */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ဖုန်းနံပါတ်
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="09-xxxxxxxxx"
                    value={newPartner.phone}
                    onChange={(e) =>
                      setNewPartner({ ...newPartner, phone: e.target.value })
                    }
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    မြို့နယ် / ဒေသ
                  </label>
                  <input
                    type="text"
                    placeholder="ဥပမာ - ရွှေဘိုမြို့နယ်"
                    value={newPartner.township}
                    onChange={(e) =>
                      setNewPartner({ ...newPartner, township: e.target.value })
                    }
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Address & အကြွေးကန့်သတ်ငွေ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ကျေးရွာ / လိပ်စာ
                  </label>
                  <input
                    type="text"
                    placeholder="ဥပမာ - သခွတ်တောကျေးရွာ"
                    value={newPartner.address}
                    onChange={(e) =>
                      setNewPartner({ ...newPartner, address: e.target.value })
                    }
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    အကြွေးကန့်သတ်ငွေ (ကျပ်)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="ဥပမာ - ၁၀,၀၀၀,၀၀၀"
                    value={newPartner.creditLimit || ""}
                    onChange={(e) =>
                      setNewPartner({
                        ...newPartner,
                        creditLimit: Number(e.target.value),
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
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-full sm:w-auto px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer text-center"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2 text-xs font-bold text-white bg-btn-color hover:bg-btn-hover rounded-full shadow-sm cursor-pointer text-center"
                >
                  မိတ်ဖက်အသစ် သိမ်းမည်
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
