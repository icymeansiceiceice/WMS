import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  ArrowDownToLine,
  Search,
  Plus,
  Phone,
  MapPin,
  ChevronDown,
  Tractor,
  Printer,
  Edit3,
  Trash2,
  X,
  Warehouse,
  Scale,
  Receipt,
  PackagePlus,
  FileText,
  AlertCircle,
  CreditCard,
} from "lucide-react";

// ================= TYPES =================
export type InwardType = "consignment" | "direct_purchase";

interface FormItemRow {
  id: string;
  commodityId: string;
  warehouseId: string;
  bagCount: number;
  grossWeightViss: number;
  tareWeightViss: number;
  netWeightViss: number;
  tinsCount: number;
  unitPrice: number;
  totalPrice: number;
}

export interface InwardReceipt {
  id: string;
  voucherNo: string; // ဥပမာ - INW-2026-101
  type: InwardType; // consignment (အပ်ကုန်) သို့မဟုတ် direct_purchase (အပြတ်ဝယ်)
  farmerName: string;
  phone: string;
  township: string;
  commodityName: string; // ကုန်စည်အမည်
  category: "rice" | "beans" | "oilseed"; // စပါး/ဆန် သို့မဟုတ် ပဲမျိုးစုံ
  quantity: number; // အရေအတွက် (အိတ် သို့မဟုတ် တင်း)
  unit: string; // အိတ် / တင်း / ပိဿာ
  unitPrice?: number; // အပြတ်ဝယ်ယူသည့် ဈေးနှုန်း (ကျပ်)
  totalAmount?: number; // အပြတ်ဝယ်ယူမှု စုစုပေါင်းတန်ဖိုး (ကျပ်)
  warehouseBay: string; // သိုလှောင်သည့် ဂိုဒေါင် (ဥပမာ - WH-01)
  date: string; // အဝင်ရက်စွဲ
  status: "stored" | "partially_sold" | "completed"; // သိုလှောင်ဆဲ / တစ်စိတ်တစ်ပိုင်းရောင်းပြီး / ပြီးပြတ်
  moisturePercent?: number; // အစိုဓာတ် (%)
  notes?: string;
}

// Dropdown အထောက်အကူပြု Data များ
const COMMODITY_OPTIONS = [
  {
    id: "C-01",
    name: "စပါး (ရွှေဘိုပေါ်ဆန်း)",
    category: "rice" as const,
    defaultPrice: 120000,
    vissPerTin: 20,
  },
  {
    id: "C-02",
    name: "မတ်ပဲ (FAQ)",
    category: "beans" as const,
    defaultPrice: 85000,
    vissPerTin: 20,
  },
  {
    id: "C-03",
    name: "ပဲစင်းငုံ နီ (RC)",
    category: "beans" as const,
    defaultPrice: 92000,
    vissPerTin: 20,
  },
  {
    id: "C-04",
    name: "ပဲတီစိမ်း (ရွှေဝါ)",
    category: "beans" as const,
    defaultPrice: 75000,
    vissPerTin: 20,
  },
  {
    id: "C-05",
    name: "နှမ်းနက် (စမုံ)",
    category: "oilseed" as const,
    defaultPrice: 135000,
    vissPerTin: 15,
  },
];

const WAREHOUSE_LIST = [
  { id: "WH-01", name: "WH-01 (ပင်မစပါးကျီ)", code: "WH-01" },
  { id: "WH-02", name: "WH-02 (ပဲသိုလှောင်ရုံ)", code: "WH-02" },
  { id: "WH-03", name: "WH-03 (အလယ်ရုံ)", code: "WH-03" },
];

export const InwardGoodsReceipts: React.FC = () => {
  // ================= MODAL STATE =================
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [inwardType, setInwardType] = useState<
    "CONSIGNMENT" | "DIRECT_PURCHASE"
  >("CONSIGNMENT");
  const [selectedFarmerId, setSelectedFarmerId] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [receiptDate, setReceiptDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [remarks, setRemarks] = useState("");

  // ================= PAGE STATE =================
  const [activeTab, setActiveTab] = useState<"all" | InwardType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Line items state
  const [formItems, setFormItems] = useState<FormItemRow[]>([
    {
      id: "row-1",
      commodityId: COMMODITY_OPTIONS[0].id,
      warehouseId: WAREHOUSE_LIST[0].id,
      bagCount: 50,
      grossWeightViss: 1020,
      tareWeightViss: 20,
      netWeightViss: 1000,
      tinsCount: 50,
      unitPrice: COMMODITY_OPTIONS[0].defaultPrice,
      totalPrice: COMMODITY_OPTIONS[0].defaultPrice * 50,
    },
  ]);

  // Settlement State
  const [shouldDeductAdvance, setShouldDeductAdvance] = useState(true);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  // ပွဲရုံတွင် လာရောက်ရောင်းချနေကျ တောင်သူများ (Dropdown ရွေးချယ်ရန်)
  const regularFarmers = [
    {
      id: "FAR-101",
      name: "ဦးအေးမောင်",
      phone: "09-420011223",
      township: "ရွှေဘိုမြို့နယ်",
      advanceBalance: 1500000,
    },
    {
      id: "FAR-102",
      name: "ဒေါ်လှကြည်",
      phone: "09-250033445",
      township: "ဝက်လက်မြို့နယ်",
      advanceBalance: 0,
    },
    {
      id: "FAR-103",
      name: "ဦးဘကြည်",
      phone: "09-790088990",
      township: "ဒေးဒရဲမြို့နယ်",
      advanceBalance: 2500000,
    },
    {
      id: "FAR-104",
      name: "ဦးစိုးဝင်း",
      phone: "09-450077661",
      township: "ဟင်္သာတမြို့နယ်",
      advanceBalance: 800000,
    },
    {
      id: "FAR-105",
      name: "ဦးမောင်မောင်သန်း",
      phone: "09-260119933",
      township: "မြောင်းမြမြို့နယ်",
      advanceBalance: 0,
    },
    {
      id: "FAR-106",
      name: "ဦးတင်ဝင်း",
      phone: "09-400123456",
      township: "ဖျာပုံမြို့နယ်",
      advanceBalance: 500000,
    },
  ];

  // ရွေးချယ်ထားသော တောင်သူ
  const currentFarmer =
    regularFarmers.find((f) => f.id === selectedFarmerId) || null;

  // Total Calculations
  const modalTotals = useMemo(() => {
    const totalBags = formItems.reduce(
      (acc, row) => acc + (Number(row.bagCount) || 0),
      0
    );
    const totalNetWeight = formItems.reduce(
      (acc, row) => acc + (Number(row.netWeightViss) || 0),
      0
    );
    const totalCalculated =
      inwardType === "CONSIGNMENT"
        ? 0
        : formItems.reduce(
            (acc, row) => acc + (Number(row.totalPrice) || 0),
            0
          );

    const advanceRemaining = currentFarmer?.advanceBalance || 0;
    const advanceDeductible =
      inwardType === "DIRECT_PURCHASE" && shouldDeductAdvance
        ? Math.min(totalCalculated, advanceRemaining)
        : 0;

    const netPayable = Math.max(0, totalCalculated - advanceDeductible);
    const balanceDue = Math.max(0, netPayable - (Number(paidAmount) || 0));

    return {
      totalBags,
      totalNetWeight,
      totalCalculated,
      advanceRemaining,
      advanceDeductible,
      netPayable,
      balanceDue,
    };
  }, [formItems, inwardType, currentFarmer, shouldDeductAdvance, paidAmount]);

  // Row Value Change Handler
  const handleItemChange = (
    index: number,
    field: keyof FormItemRow,
    value: any
  ) => {
    setFormItems((prev) => {
      const updated = [...prev];
      const row = { ...updated[index], [field]: value };

      if (field === "commodityId") {
        const comm = COMMODITY_OPTIONS.find((c) => c.id === value);
        if (comm) {
          row.unitPrice = comm.defaultPrice;
        }
      }

      const gross = Number(row.grossWeightViss) || 0;
      const tare = Number(row.tareWeightViss) || 0;
      const netWeight = Math.max(0, gross - tare);
      row.netWeightViss = netWeight;

      const comm = COMMODITY_OPTIONS.find((c) => c.id === row.commodityId);
      const vissPerTin = comm?.vissPerTin || 20;
      const tins = Number((netWeight / vissPerTin).toFixed(2));
      row.tinsCount = tins;

      const unitPrice = Number(row.unitPrice) || 0;
      row.totalPrice = tins * unitPrice;

      updated[index] = row;
      return updated;
    });
  };

  // Add / Remove Row Handlers
  const handleAddItemRow = () => {
    setFormItems((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}`,
        commodityId: COMMODITY_OPTIONS[0].id,
        warehouseId: WAREHOUSE_LIST[0].id,
        bagCount: 10,
        grossWeightViss: 205,
        tareWeightViss: 5,
        netWeightViss: 200,
        tinsCount: 10,
        unitPrice: COMMODITY_OPTIONS[0].defaultPrice,
        totalPrice: COMMODITY_OPTIONS[0].defaultPrice * 10,
      },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (formItems.length <= 1) return;
    setFormItems((prev) => prev.filter((_, i) => i !== index));
  };

  // ================= MOCK RECEIPTS DATA =================
  const [receipts, setReceipts] = useState<InwardReceipt[]>([
    {
      id: "REC-001",
      voucherNo: "INW-2026-101",
      type: "consignment",
      farmerName: "ဦးအေးမောင်",
      phone: "09-420011223",
      township: "ရွှေဘိုမြို့နယ်",
      commodityName: "စပါး (ရွှေဘိုပေါ်ဆန်း)",
      category: "rice",
      quantity: 500,
      unit: "တင်း",
      warehouseBay: "WH-01 (ပင်မစပါးကျီ)",
      date: "၂၀၂၆-၁၁-၁၄",
      status: "stored",
      moisturePercent: 13.5,
      notes: "ဈေးစောင့်အပ်ကုန် (အရည်အသွေး ကောင်းမွန်)",
    },
    {
      id: "REC-002",
      voucherNo: "INW-2026-102",
      type: "direct_purchase",
      farmerName: "ဒေါ်လှကြည်",
      phone: "09-250033445",
      township: "ဝက်လက်မြို့နယ်",
      commodityName: "ပဲတီစိမ်း (ရွှေဝါ)",
      category: "beans",
      quantity: 200,
      unit: "အိတ်",
      unitPrice: 185000,
      totalAmount: 37000000,
      warehouseBay: "WH-02 (ပဲသိုလှောင်ရုံ)",
      date: "၂၀၂၆-၁၁-၁၄",
      status: "completed",
      moisturePercent: 12.0,
      notes: "ပွဲရုံမှ အပြတ်ဝယ်ယူငွေ လက်ငင်းရှင်းပြီး",
    },
    {
      id: "REC-003",
      voucherNo: "INW-2026-103",
      type: "consignment",
      farmerName: "ဦးဘကြည်",
      phone: "09-790088990",
      township: "ဒေးဒရဲမြို့နယ်",
      commodityName: "မတ်ပဲ (FAQ)",
      category: "beans",
      quantity: 350,
      unit: "အိတ်",
      warehouseBay: "WH-02 (ပဲသိုလှောင်ရုံ)",
      date: "၂၀၂၆-၁၁-၁၃",
      status: "partially_sold",
      moisturePercent: 11.8,
      notes: "အပ်ကုန် ၃၅၀ အိတ်အနက် ၁၅၀ အိတ် ရောင်းချပြီး",
    },
    {
      id: "REC-004",
      voucherNo: "INW-2026-104",
      type: "direct_purchase",
      farmerName: "ဦးစိုးဝင်း",
      phone: "09-450077661",
      township: "ဟင်္သာတမြို့နယ်",
      commodityName: "ကုလားပဲ (ဖြူလုံး)",
      category: "beans",
      quantity: 150,
      unit: "အိတ်",
      unitPrice: 165000,
      totalAmount: 24750000,
      warehouseBay: "WH-03 (အလယ်ရုံ)",
      date: "၂၀၂၆-၁၁-၁၂",
      status: "completed",
      moisturePercent: 12.5,
      notes: "ကြိုထုတ်ငွေမှ ၈၀% ခုနှိမ်ပြီး ကျန်ငွေရှင်းပြီး",
    },
    {
      id: "REC-005",
      voucherNo: "INW-2026-105",
      type: "consignment",
      farmerName: "ဦးမောင်မောင်သန်း",
      phone: "09-260119933",
      township: "မြောင်းမြမြို့နယ်",
      commodityName: "ဧည့်မထစပါး",
      category: "rice",
      quantity: 800,
      unit: "တင်း",
      warehouseBay: "WH-01 (ပင်မစပါးကျီ)",
      date: "၂၀၂၆-၁၁-၁၁",
      status: "stored",
      moisturePercent: 14.0,
      notes: "တောင်သူအပ်ကုန် ဈေးစောင့်ဆဲ",
    },
  ]);

  // Click Outside Listener for Warehouse Popover
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

  // ================= COMPUTED METRICS =================
  const consignmentReceipts = receipts.filter((r) => r.type === "consignment");
  const purchaseReceipts = receipts.filter((r) => r.type === "direct_purchase");

  const totalConsignmentBags = consignmentReceipts.reduce(
    (acc, r) => acc + r.quantity,
    0
  );
  const totalPurchaseBags = purchaseReceipts.reduce(
    (acc, r) => acc + r.quantity,
    0
  );
  const totalPurchaseValue = purchaseReceipts.reduce(
    (acc, r) => acc + (r.totalAmount || 0),
    0
  );

  // Warehouse Filter List
  const warehouseOptions = [
    { id: "all", label: "ဂိုဒေါင်အားလုံး" },
    { id: "WH-01", label: "WH-01 (ပင်မစပါးကျီ)" },
    { id: "WH-02", label: "WH-02 (ပဲသိုလှောင်ရုံ)" },
    { id: "WH-03", label: "WH-03 (အလယ်ရုံ)" },
  ];

  const selectedWarehouseObj =
    warehouseOptions.find((w) => w.id === warehouseFilter) ||
    warehouseOptions[0];

  // Filtered List
  const filteredReceipts = receipts.filter((item) => {
    const matchesTab = activeTab === "all" || item.type === activeTab;
    const matchesWarehouse =
      warehouseFilter === "all" ||
      item.warehouseBay.startsWith(warehouseFilter);
    const matchesSearch =
      item.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.commodityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.township.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesWarehouse && matchesSearch;
  });

  // Modal Open Handler
  const handleOpenModal = () => {
    setInwardType("CONSIGNMENT");
    setSelectedFarmerId(regularFarmers[0].id);
    setVehicleNumber("");
    setDriverName("");
    setRemarks("");
    setPaidAmount(0);
    setShouldDeductAdvance(true);
    setFormItems([
      {
        id: "row-1",
        commodityId: COMMODITY_OPTIONS[0].id,
        warehouseId: WAREHOUSE_LIST[0].id,
        bagCount: 50,
        grossWeightViss: 1020,
        tareWeightViss: 20,
        netWeightViss: 1000,
        tinsCount: 50,
        unitPrice: COMMODITY_OPTIONS[0].defaultPrice,
        totalPrice: COMMODITY_OPTIONS[0].defaultPrice * 50,
      },
    ]);
    setIsAddModalOpen(true);
  };

  // Submit Handler for Modal Form
  const handleSubmitReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFarmer) {
      alert("ကျေးဇူးပြု၍ တောင်သူ ရွေးချယ်ပေးပါ");
      return;
    }

    const firstItem = formItems[0];
    const selectedComm = COMMODITY_OPTIONS.find(
      (c) => c.id === firstItem?.commodityId
    );
    const selectedWh = WAREHOUSE_LIST.find(
      (w) => w.id === firstItem?.warehouseId
    );

    const record: InwardReceipt = {
      id: `REC-${Math.floor(100 + Math.random() * 900)}`,
      voucherNo: `INW-2026-${Math.floor(100 + Math.random() * 900)}`,
      type: inwardType === "CONSIGNMENT" ? "consignment" : "direct_purchase",
      farmerName: currentFarmer.name,
      phone: currentFarmer.phone,
      township: currentFarmer.township,
      commodityName: selectedComm ? selectedComm.name : "သီးနှံစုံ",
      category: selectedComm ? selectedComm.category : "beans",
      quantity: modalTotals.totalBags,
      unit: "အိတ်",
      unitPrice:
        inwardType === "DIRECT_PURCHASE" ? firstItem?.unitPrice : undefined,
      totalAmount:
        inwardType === "DIRECT_PURCHASE"
          ? modalTotals.totalCalculated
          : undefined,
      warehouseBay: selectedWh ? selectedWh.name : "WH-01 (ပင်မစပါးကျီ)",
      date: receiptDate,
      status: inwardType === "CONSIGNMENT" ? "stored" : "completed",
      moisturePercent: 13,
      notes:
        remarks.trim() ||
        (inwardType === "CONSIGNMENT" ? "တောင်သူအပ်ကုန်" : "ပွဲရုံအပြတ်ဝယ်"),
    };

    setReceipts([record, ...receipts]);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6 select-none pb-3">
      {/* ================= 1. GREETING & HEADER ================= */}
      <div className="relative overflow-hidden py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">
          ကုန်အဝင် ဘောက်ချာ စီမံခန့်ခွဲမှု (Inward Goods Receipts)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 sm:mt-3 max-w-xl leading-relaxed">
          တောင်သူများထံမှ ဈေးစောင့် အပ်ကုန်စည်များ (Consignment) နှင့်
          ပွဲရုံပိုင် အပြတ်ဝယ်ယူမှုများ (Direct Purchase) အတွက်
          ကုန်အဝင်စာရင်းချုပ်
        </p>
      </div>

      {/* ================= 2. 4 KPI SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {/* Card 1: ကုန်အဝင် စုစုပေါင်း */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              ယနေ့ သီးနှံစုံ အဝင်စုစုပေါင်း
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ArrowDownToLine size={18} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {(totalConsignmentBags + totalPurchaseBags).toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-500">
                အိတ်/တင်း
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              စုစုပေါင်း ဘောက်ချာ {receipts.length} စောင်
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
            <span>ကုန်စည်အဝင်စံချိန်</span>
            <span className="text-[11px] text-slate-400 font-normal truncate ml-2">
              ဂိုဒေါင် ၃ လုံးဆီသို့
            </span>
          </div>
        </div>

        {/* Card 2: တောင်သူ အပ်ကုန် စုစုပေါင်း */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              တောင်သူ အပ်ကုန် (Consignment)
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Tractor size={18} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {totalConsignmentBags.toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-500">
                အိတ်/တင်း
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              စုစုပေါင်းအဝင်၏{" "}
              {Math.round(
                (totalConsignmentBags /
                  (totalConsignmentBags + totalPurchaseBags || 1)) *
                  100
              )}
              % (ဈေးစောင့်ကုန်)
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-purple-700 font-bold">
            <span>ပွဲခစား အပ်ကုန်များ</span>
            <span className="text-[11px] text-slate-400 font-normal truncate ml-2">
              တောင်သူပိုင်
            </span>
          </div>
        </div>

        {/* Card 3: ပွဲရုံ အပြတ်ဝယ်ယူမှု */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              ပွဲရုံ အပြတ်ဝယ် (Direct Purchase)
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Receipt size={18} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {totalPurchaseBags.toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-500">အိတ်</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              တန်ဖိုး: {(totalPurchaseValue / 100000).toLocaleString()} သိန်း
              ကျပ်
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-bold">
            <span>ပွဲရုံပိုင် စတော့</span>
            <span className="text-[11px] text-slate-400 font-normal truncate ml-2">
              ချက်ချင်းရှင်းပြီး
            </span>
          </div>
        </div>

        {/* Card 4: သိုလှောင်ရုံ လက်ကျန် အခြေအနေ */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              သိုလှောင်မှု နေရာလွတ်
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Warehouse size={18} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              ၆၈%{" "}
              <span className="text-xs font-normal text-slate-500">
                နေရာယူပြီး
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              လက်ကျန်ဆံ့ငွေ: ၃၂,၀၀၀ အိတ်
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-600 font-bold">
            <span>ဂိုဒေါင်အခြေအနေ ပုံမှန်</span>
            <span className="text-[11px] text-slate-400 font-normal truncate ml-2">
              လက်ခံနိုင်ဆဲ
            </span>
          </div>
        </div>
      </div>

      {/* ================= 3. TYPE SELECTOR & ACTION STRIP ================= */}
      <div className="space-y-4">
        {/* Buttons ၂ ခု + အားလုံး (Consignment vs Direct Purchase) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer shrink-0 ${
                activeTab === "all"
                  ? "bg-btn-color text-white"
                  : "bg-card border border-slate-200 text-slate-600"
              }`}
            >
              အားလုံး ({receipts.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("consignment")}
              className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer shrink-0 ${
                activeTab === "consignment"
                  ? "bg-btn-color text-white"
                  : "bg-card border border-slate-200 text-slate-600"
              }`}
            >
              တောင်သူ အပ်ကုန်များ ({consignmentReceipts.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("direct_purchase")}
              className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer shrink-0 ${
                activeTab === "direct_purchase"
                  ? "bg-btn-color text-white"
                  : "bg-card border border-slate-200 text-slate-600"
              }`}
            >
              ပွဲရုံ အပြတ်ဝယ်ယူမှု ({purchaseReceipts.length})
            </button>
          </div>

          <div className="text-xs text-slate-500 font-semibold px-1 shrink-0">
            လက်ရှိဖော်ပြစာရင်း:{" "}
            <span className="font-bold text-slate-800">
              {filteredReceipts.length} စောင်
            </span>
          </div>
        </div>

        {/* Search + Warehouse Dropdown + New Voucher Button */}
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
                placeholder="ဘောက်ချာအမှတ်၊ တောင်သူအမည်၊ ကုန်စည် (သို့) ဒေသဖြင့် ရှာပါ..."
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
                  <span>{selectedWarehouseObj.label}</span>
                </div>
                <ChevronDown size={13} className="text-slate-400" />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-1.5 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    ဂိုဒေါင်အလိုက် စစ်ထုတ်ပါ
                  </div>
                  {warehouseOptions.map((opt) => {
                    const isSelected = warehouseFilter === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setWarehouseFilter(opt.id);
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

          {/* New Receipt Button */}
          <button
            type="button"
            onClick={handleOpenModal}
            className="flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 text-xs text-white bg-btn-color hover:bg-btn-hover rounded-full shadow-sm cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>ကုန်အဝင်ဘောက်ချာ ဖွင့်မည်</span>
          </button>
        </div>
      </div>

      {/* ================= 4. RESPONSIVE CARDS & TABLE VIEW ================= */}
      {/* A. Mobile & Tablet Cards View (< lg) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 lg:hidden">
        {filteredReceipts.length === 0 ? (
          <div className="col-span-full bg-card rounded-3xl p-10 text-center border border-slate-200/80 shadow-xs">
            <p className="text-sm font-bold text-slate-500">
              ရှာဖွေမှုနှင့် ကိုက်ညီသော ကုန်အဝင်စာရင်း မတွေ့ရှိပါ
            </p>
          </div>
        ) : (
          filteredReceipts.map((rec) => (
            <div
              key={rec.id}
              className="bg-card rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Header: Voucher No & Type Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                      {rec.voucherNo}
                    </span>
                    <h3 className="text-sm font-bold text-slate-800 mt-2 leading-tight">
                      {rec.farmerName}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <MapPin size={11} /> {rec.township}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      rec.type === "consignment"
                        ? "bg-purple-50 text-purple-700 border border-purple-200/60"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                    }`}
                  >
                    {rec.type === "consignment"
                      ? "တောင်သူအပ်ကုန်"
                      : "ပွဲရုံအပြတ်ဝယ်"}
                  </span>
                </div>

                {/* Commodity & Quantity Box */}
                <div className="mt-3.5 bg-slate-50 p-3 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      သီးနှံ အမျိုးအစား:
                    </span>
                    <span className="font-bold text-slate-800">
                      {rec.commodityName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      ဝင်ရောက်အရေအတွက်:
                    </span>
                    <span className="font-black font-mono text-sm text-slate-900">
                      {rec.quantity.toLocaleString()} {rec.unit}
                    </span>
                  </div>

                  {rec.type === "direct_purchase" && rec.totalAmount && (
                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/60">
                      <span className="text-slate-500 font-medium">
                        ဝယ်ယူတန်ဖိုး စုစုပေါင်း:
                      </span>
                      <span className="font-black font-mono text-sm text-emerald-600">
                        {rec.totalAmount.toLocaleString()} ကျပ်
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Warehouse size={12} className="text-slate-400" />{" "}
                      {rec.warehouseBay}
                    </span>
                    <span className="font-mono text-slate-400">
                      အစိုဓာတ်: {rec.moisturePercent}%
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {rec.notes && (
                  <p className="text-[11px] text-slate-400 mt-2 px-1 italic truncate">
                    မှတ်ချက်: {rec.notes}
                  </p>
                )}
              </div>

              {/* Card Footer: Phone & Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={`tel:${rec.phone}`}
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Phone size={12} />
                  <span>{rec.phone}</span>
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
                        confirm(`${rec.voucherNo} အား ဖျက်ပစ်ရန် သေချာပါသလား?`)
                      ) {
                        setReceipts((prev) =>
                          prev.filter((r) => r.id !== rec.id)
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
                <th className="px-5 py-3.5">ကုန်စည် အမည်</th>
                <th className="px-5 py-3.5 text-right">အရေအတွက်</th>
                <th className="px-5 py-3.5 text-right">ဝယ်ယူတန်ဖိုး (ကျပ်)</th>
                <th className="px-5 py-3.5">ထားရှိသည့် ဂိုဒေါင်</th>
                <th className="px-5 py-3.5 text-center">လုပ်ဆောင်ချက်</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-10 text-center text-slate-400 font-bold"
                  >
                    ရှာဖွေမှုနှင့် ကိုက်ညီသော စာရင်း မတွေ့ရှိပါ
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80">
                    {/* Voucher No & Date */}
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-slate-900 block">
                        {rec.voucherNo}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {rec.date}
                      </span>
                    </td>

                    {/* Type Badge */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.type === "consignment"
                            ? "bg-purple-50 text-purple-700 border border-purple-200/60"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                        }`}
                      >
                        {rec.type === "consignment" ? "အပ်ကုန်" : "အပြတ်ဝယ်"}
                      </span>
                    </td>

                    {/* Farmer */}
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800 text-xs">
                        {rec.farmerName}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {rec.township} &bull; {rec.phone}
                      </p>
                    </td>

                    {/* Commodity */}
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-700">
                        {rec.commodityName}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        အစိုဓာတ်: {rec.moisturePercent}%
                      </span>
                    </td>

                    {/* Quantity */}
                    <td className="px-5 py-4 text-right font-mono font-bold text-slate-900 text-sm">
                      {rec.quantity.toLocaleString()}{" "}
                      <span className="text-xs font-normal text-slate-500 font-sans">
                        {rec.unit}
                      </span>
                    </td>

                    {/* Purchase Value */}
                    <td className="px-5 py-4 text-right font-mono font-bold">
                      {rec.type === "direct_purchase" && rec.totalAmount ? (
                        <span className="text-emerald-600">
                          {rec.totalAmount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-sans text-[11px] font-normal">
                          (ပွဲခစား အပ်ကုန်)
                        </span>
                      )}
                    </td>

                    {/* Warehouse Bay */}
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5">
                        <Warehouse size={12} className="text-slate-500" />
                        {rec.warehouseBay}
                      </span>
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
                                `${rec.voucherNo} အား ဖျက်ပစ်ရန် သေချာပါသလား?`
                              )
                            ) {
                              setReceipts((prev) =>
                                prev.filter((r) => r.id !== rec.id)
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

      {/* ================= 5. MODAL: CREATE INWARD VOUCHER ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-card w-full max-w-2xl rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xl max-h-[92vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-btn-color text-white flex items-center justify-center font-bold">
                  <PackagePlus size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    ကုန်အဝင် ဘောက်ချာသစ် သွင်းယူခြင်း
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    တောင်သူ့အပ်ကုန် သို့မဟုတ် ဒိုင်ပြတ် တန်းဝယ်ယူမှု
                    အသစ်ဖွင့်လှစ်ခြင်း
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmitReceipt}
              className="mt-4 space-y-4 text-xs font-semibold"
            >
              {/* Type Switcher (Project Standard: rounded-full buttons) */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                  ကုန်အဝင် အမျိုးအစား ရွေးချယ်ပါ
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInwardType("CONSIGNMENT")}
                    className={`py-2 rounded-full text-xs font-bold cursor-pointer border ${
                      inwardType === "CONSIGNMENT"
                        ? "bg-btn-color text-white border-btn-color"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    တောင်သူ့အပ်ကုန်
                  </button>
                  <button
                    type="button"
                    onClick={() => setInwardType("DIRECT_PURCHASE")}
                    className={`py-2 rounded-full text-xs font-bold cursor-pointer border ${
                      inwardType === "DIRECT_PURCHASE"
                        ? "bg-btn-color text-white border-btn-color"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    ဒိုင်ပြတ် တန်းဝယ်
                  </button>
                </div>
              </div>

              {/* တောင်သူနှင့် ယာဉ်မောင်း အချက်အလက်များ */}
              <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      တောင်သူ အမည် ရွေးချယ်ပါ
                    </label>
                    <select
                      value={selectedFarmerId}
                      onChange={(e) => setSelectedFarmerId(e.target.value)}
                      required
                      className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white cursor-pointer"
                    >
                      <option value="">-- တောင်သူ ရွေးချယ်ရန် --</option>
                      {regularFarmers.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.township}){" "}
                          {f.advanceBalance > 0
                            ? `[ကြိုတင်ငွေ: ${f.advanceBalance.toLocaleString()} ကျပ်]`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      အဝင် ရက်စွဲ
                    </label>
                    <input
                      type="date"
                      required
                      value={receiptDate}
                      onChange={(e) => setReceiptDate(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      မော်တော်ယာဉ် အမှတ်
                    </label>
                    <input
                      type="text"
                      placeholder="ဥပမာ - 7B-9021 (MDY)"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      ယာဉ်မောင်း အမည်
                    </label>
                    <input
                      type="text"
                      placeholder="ဥပမာ - ဦးတင်မောင်"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Outstanding Cash Advance Banner */}
              {inwardType === "DIRECT_PURCHASE" &&
                currentFarmer &&
                currentFarmer.advanceBalance > 0 && (
                  <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 text-amber-900">
                      <AlertCircle
                        size={16}
                        className="text-amber-700 shrink-0"
                      />
                      <div>
                        <span className="font-bold">
                          တောင်သူတွင် ကြိုတင်ငွေ (Advance) ကျန်ငွေ ရှိနေပါသည်:{" "}
                        </span>
                        <span className="text-rose-600 font-extrabold">
                          {currentFarmer.advanceBalance.toLocaleString()} ကျပ်
                        </span>
                      </div>
                    </div>
                    <label className="inline-flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-full border border-amber-300">
                      <input
                        type="checkbox"
                        checked={shouldDeductAdvance}
                        onChange={(e) =>
                          setShouldDeductAdvance(e.target.checked)
                        }
                        className="rounded text-amber-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-amber-950">
                        ယခုဘောက်ချာမှ ခုနှိမ်မည်
                      </span>
                    </label>
                  </div>
                )}

              {/* Multi-Item / Multi-Warehouse Split Entry Rows */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Scale size={15} className="text-slate-500" />
                    သီးနှံနှင့် ဂိုဒေါင်ခွဲ ထည့်သွင်းချက်များ
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>သီးနှံ/ဂိုဒေါင်ခွဲ ထပ်ထည့်မည်</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formItems.map((row, idx) => (
                    <div
                      key={row.id}
                      className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/90 space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                        {/* သီးနှံရွေးချယ်ရန် */}
                        <div className="sm:col-span-4">
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                            သီးနှံအမည်
                          </label>
                          <select
                            value={row.commodityId}
                            onChange={(e) =>
                              handleItemChange(
                                idx,
                                "commodityId",
                                e.target.value
                              )
                            }
                            required
                            className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white cursor-pointer"
                          >
                            {COMMODITY_OPTIONS.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* ဂိုဒေါင်ရွေးချယ်ရန် */}
                        <div className="sm:col-span-4">
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                            သွင်းမည့်ဂိုဒေါင်
                          </label>
                          <select
                            value={row.warehouseId}
                            onChange={(e) =>
                              handleItemChange(
                                idx,
                                "warehouseId",
                                e.target.value
                              )
                            }
                            required
                            className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white cursor-pointer"
                          >
                            {WAREHOUSE_LIST.map((w) => (
                              <option key={w.id} value={w.id}>
                                {w.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* အိတ်အရေအတွက် */}
                        <div className="sm:col-span-3">
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                            အိတ်အရေအတွက်
                          </label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={row.bagCount || ""}
                            onChange={(e) =>
                              handleItemChange(
                                idx,
                                "bagCount",
                                Number(e.target.value)
                              )
                            }
                            className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                            placeholder="0"
                          />
                        </div>

                        {/* Row Delete Button */}
                        <div className="sm:col-span-1 flex items-end justify-center pb-1">
                          <button
                            type="button"
                            disabled={formItems.length === 1}
                            onClick={() => handleRemoveItemRow(idx)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer disabled:opacity-30"
                            title="ပယ်ဖျက်မည်"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* အလေးချိန်စကေးနှင့် ဈေးနှုန်း တွက်ချက်ခြင်း */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-200/60 text-[11px]">
                        <div>
                          <label className="text-slate-500 block mb-1 font-medium">
                            စုစုပေါင်းအလေးချိန် (ပိဿာ)
                          </label>
                          <input
                            type="number"
                            value={row.grossWeightViss || ""}
                            onChange={(e) =>
                              handleItemChange(
                                idx,
                                "grossWeightViss",
                                Number(e.target.value)
                              )
                            }
                            className="w-full text-xs font-bold p-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                            placeholder="0"
                          />
                        </div>

                        <div>
                          <label className="text-slate-500 block mb-1 font-medium">
                            အိတ်ခွံနုတ် (ပိဿာ)
                          </label>
                          <input
                            type="number"
                            value={row.tareWeightViss || ""}
                            onChange={(e) =>
                              handleItemChange(
                                idx,
                                "tareWeightViss",
                                Number(e.target.value)
                              )
                            }
                            className="w-full text-xs font-bold p-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                            placeholder="0"
                          />
                        </div>

                        <div>
                          <label className="text-slate-500 block mb-1 font-medium">
                            အသားတင် ပိဿာ / တင်း
                          </label>
                          <div className="p-2 bg-white rounded-xl border border-slate-200 font-extrabold text-slate-800 text-xs">
                            {row.netWeightViss.toLocaleString()} ပိဿာ (
                            {row.tinsCount} တင်း)
                          </div>
                        </div>

                        {inwardType === "DIRECT_PURCHASE" ? (
                          <div>
                            <label className="text-slate-500 block mb-1 font-medium">
                              ၁ တင်း ဝယ်ယူဈေး (ကျပ်)
                            </label>
                            <input
                              type="number"
                              value={row.unitPrice || ""}
                              onChange={(e) =>
                                handleItemChange(
                                  idx,
                                  "unitPrice",
                                  Number(e.target.value)
                                )
                              }
                              className="w-full text-xs font-bold p-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white text-right"
                              placeholder="0"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center text-slate-400 font-medium italic pt-4">
                            အပ်ကုန် (ငွေမတွက်ပါ)
                          </div>
                        )}
                      </div>

                      {inwardType === "DIRECT_PURCHASE" && (
                        <div className="flex justify-end text-xs font-bold text-slate-700 pt-1">
                          ကျသင့်ငွေ:{" "}
                          <span className="text-slate-900 font-extrabold ml-1.5">
                            {row.totalPrice.toLocaleString()} ကျပ်
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Consignment Mode Notice Banner */}
              {inwardType === "CONSIGNMENT" && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700 text-xs space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText size={15} className="text-slate-500" />
                    <span>တောင်သူ့အပ်ကုန် အသိပေးချက်</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    တောင်သူ့အပ်ကုန်ဖြစ်သောကြောင့် လောလောဆယ် ငွေရှင်းတွက်ချက်မှု
                    မပြုလုပ်သေးပါ။ သတ်မှတ်ထားသော ဂိုဒေါင်တွင် စာရင်းသွင်း
                    သိမ်းဆည်းထားမည်ဖြစ်ပြီး နောင် အရောင်းအဝယ်ဖြစ်မြောက်ချိန်မှသာ
                    ပွဲခ/အကျိုးဆောင်ခ ဖြတ်တောက်ပြီး ငွေရှင်းပါမည်။
                  </p>
                </div>
              )}

              {/* Direct Purchase Payment Settlement Card (Clean Project Design) */}
              {inwardType === "DIRECT_PURCHASE" && (
                <div className="p-4 bg-slate-200 rounded-2xl border border-slate-200/90 space-y-3">
                  <div className="text-xs font-bold text-slate-800 border-b border-slate-200/80 pb-2 flex items-center gap-1.5">
                    <CreditCard size={15} className="text-slate-600" />
                    <span>
                      ငွေပေးချေမှု တွက်ချက်ရှင်းလင်းခြင်း (Settlement)
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>စုစုပေါင်း ကုန်ကျငွေ:</span>
                      <span className="font-bold text-slate-900">
                        {modalTotals.totalCalculated.toLocaleString()} ကျပ်
                      </span>
                    </div>

                    {modalTotals.advanceDeductible > 0 && (
                      <div className="flex justify-between text-amber-700">
                        <span>(-) ကြိုတင်ထုတ်ငွေ ခုနှိမ်ရှင်းလင်းငွေ:</span>
                        <span className="font-bold">
                          -{modalTotals.advanceDeductible.toLocaleString()} ကျပ်
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-2 text-sm">
                      <span>အသားတင် ပေးချေရန်:</span>
                      <span className="font-black text-slate-900">
                        {modalTotals.netPayable.toLocaleString()} ကျပ်
                      </span>
                    </div>
                  </div>

                  {/* Paid Amount and Payment Method */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        ယခု ချက်ချင်းပေးချေငွေ (ကျပ်)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={modalTotals.netPayable}
                        value={paidAmount || ""}
                        onChange={(e) => setPaidAmount(Number(e.target.value))}
                        className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        ငွေပေးချေမှု နည်းလမ်း
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
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

                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs">
                    <span className="text-slate-600 font-semibold">
                      ကျန်ရှိနေသော ပေးရန်ကျန်ငွေ:
                    </span>
                    <span
                      className={`font-black text-sm ${
                        modalTotals.balanceDue > 0
                          ? "text-rose-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {modalTotals.balanceDue.toLocaleString()} ကျပ်
                    </span>
                  </div>
                </div>
              )}

              {/* မှတ်ချက် / Textarea */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  မှတ်ချက် / အထူးမှာကြားချက်
                </label>
                <textarea
                  rows={2}
                  placeholder="သီးနှံအရည်အသွေး၊ အစိုဓာတ်၊ ဂိုဒေါင်နေရာ သတ်မှတ်ချက် စသည်..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 sm:pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-btn-color hover:bg-btn-hover text-white text-xs font-bold cursor-pointer shadow-xs"
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
