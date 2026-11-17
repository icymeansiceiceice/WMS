import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  ShoppingCart,
  Search,
  Plus,
  Phone,
  MapPin,
  ChevronDown,
  Printer,
  Edit3,
  Trash2,
  X,
  CheckCircle2,
  Scale,
  CreditCard,
  Coins,
  AlertCircle,
  DollarSign,
  Clock,
} from "lucide-react";

// ================= TYPES =================
export type SaleType = "cash" | "credit";
export type SaleMode = "CONSIGNMENT" | "DEPOT_STOCK";
export type InvoiceStatus = "paid" | "partial" | "unpaid";
export type PaymentMethod =
  | "CASH"
  | "KPAY"
  | "WAVE"
  | "AYA_PAY"
  | "BANK_TRANSFER";

export interface SalesLineItem {
  id: string;
  saleMode: SaleMode;
  lotId?: string; // တောင်သူ့အပ်ကုန် Lot ID
  commodityId: string;
  commodityName: string;
  warehouseId: string;
  warehouseName: string;
  bagCount: number;
  grossWeightViss: number;
  tareWeightViss: number;
  netWeightViss: number;
  tinsCount: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SalesInvoice {
  id: string;
  invoiceNo: string; // ဥပမာ - INV-2026-101
  type: SaleType; // cash (လက်ငင်း) သို့မဟုတ် credit (အကြွေး)
  buyerName: string;
  phone: string;
  township: string;
  items: SalesLineItem[];
  totalBags: number;
  totalNetWeightViss: number;
  totalAmount: number;
  discountAmount: number;
  netBillableAmount: number;
  paidAmount: number;
  balanceDue: number;
  paymentMethod?: PaymentMethod;
  date: string;
  dueDate?: string;
  status: InvoiceStatus;
  vehicleNumber?: string;
  notes?: string;
}

interface BuyerOption {
  id: string;
  name: string;
  phone: string;
  township: string;
  creditLimit: number; // အကြွေးကန့်သတ်ငွေ (ကျပ်)
  currentDebt: number; // လက်ရှိ အကြွေးကျန်ငွေ (ကျပ်)
}

// ================= MOCK DATA =================
const COMMODITY_OPTIONS = [
  { id: "C-01", name: "မတ်ပဲ (FAQ)", defaultPrice: 90000, vissPerTin: 20 },
  {
    id: "C-02",
    name: "ပဲစင်းငုံ နီ (RC)",
    defaultPrice: 96000,
    vissPerTin: 20,
  },
  { id: "C-03", name: "နှမ်းနက် (စမုံ)", defaultPrice: 142000, vissPerTin: 15 },
  {
    id: "C-04",
    name: "ပဲတီစိမ်း (ရွှေဝါ)",
    defaultPrice: 78000,
    vissPerTin: 20,
  },
  {
    id: "C-05",
    name: "စပါး (ရွှေဘိုပေါ်ဆန်း)",
    defaultPrice: 125000,
    vissPerTin: 20,
  },
];

const WAREHOUSE_LIST = [
  { id: "WH-01", name: "WH-01 (ပင်မစပါးကျီ)" },
  { id: "WH-02", name: "WH-02 (ပဲသိုလှောင်ရုံ)" },
  { id: "WH-03", name: "WH-03 (အလယ်ရုံ)" },
];

const MOCK_BUYERS: BuyerOption[] = [
  {
    id: "BUY-101",
    name: "ဦးကျော်သူ (ရွှေနဂါး ဆန်ပွဲရုံ)",
    phone: "09-450011223",
    township: "ရန်ကုန် (သီရိမင်္ဂလာဈေး)",
    creditLimit: 50000000,
    currentDebt: 12000000,
  },
  {
    id: "BUY-102",
    name: "ဒေါ်အေးအေးနွယ် (မန္တလေး ပဲကုန်သည်)",
    phone: "09-250088991",
    township: "မန္တလေး (ပွဲရုံတန်း)",
    creditLimit: 30000000,
    currentDebt: 0,
  },
  {
    id: "BUY-103",
    name: "ကိုဝင်းနိုင် (မော်လမြိုင် သီးနှံရောင်းဝယ်ရေး)",
    phone: "09-790044556",
    township: "မော်လမြိုင်မြို့နယ်",
    creditLimit: 25000000,
    currentDebt: 18000000,
  },
  {
    id: "BUY-104",
    name: "ဦးစိုးမိုး (ပြည် ကုန်စည်ဒိုင်)",
    phone: "09-420066778",
    township: "ပြည်မြို့နယ်",
    creditLimit: 40000000,
    currentDebt: 5000000,
  },
];

// ပွဲရုံဂိုဒေါင်ထဲတွင် ကျန်ရှိနေသော တောင်သူ့အပ်ကုန် Lots များ
const AVAILABLE_CONSIGNMENT_LOTS = [
  {
    id: "LOT-001",
    lotNumber: "LOT-2603-01",
    commodityId: "C-01",
    commodityName: "မတ်ပဲ (FAQ)",
    supplierName: "ဦးလှမောင် (ကျောက်ဆည်)",
    warehouseId: "WH-02",
    warehouseName: "WH-02 (ပဲသိုလှောင်ရုံ)",
    remainingBags: 60,
    commissionRate: 500, // ကျပ်/အိတ်
    defaultPrice: 90000,
  },
  {
    id: "LOT-002",
    lotNumber: "LOT-2603-02",
    commodityId: "C-03",
    commodityName: "နှမ်းနက် (စမုံ)",
    supplierName: "ဦးဘကြည် (ဒေးဒရဲ)",
    warehouseId: "WH-02",
    warehouseName: "WH-02 (ပဲသိုလှောင်ရုံ)",
    remainingBags: 45,
    commissionRate: 800,
    defaultPrice: 142000,
  },
  {
    id: "LOT-003",
    lotNumber: "LOT-2603-03",
    commodityId: "C-05",
    commodityName: "စပါး (ရွှေဘိုပေါ်ဆန်း)",
    supplierName: "ဦးအေးမောင် (ရွှေဘို)",
    warehouseId: "WH-01",
    warehouseName: "WH-01 (ပင်မစပါးကျီ)",
    remainingBags: 120,
    commissionRate: 600,
    defaultPrice: 125000,
  },
];

// ပွဲရုံပိုင် စတော့ လက်ကျန်စစ်ဆေးသည့် helper (Mock)
const getDepotAvailableBags = (_commodityId: string, _warehouseId: string) => {
  return 150;
};

// Initial Invoices
const INITIAL_INVOICES: SalesInvoice[] = [
  {
    id: "INV-001",
    invoiceNo: "INV-2026-101",
    type: "cash",
    buyerName: "ဒေါ်အေးအေးနွယ် (မန္တလေး ပဲကုန်သည်)",
    phone: "09-250088991",
    township: "မန္တလေး (ပွဲရုံတန်း)",
    items: [
      {
        id: "item-1",
        saleMode: "CONSIGNMENT",
        lotId: "LOT-001",
        commodityId: "C-01",
        commodityName: "မတ်ပဲ (FAQ)",
        warehouseId: "WH-02",
        warehouseName: "WH-02 (ပဲသိုလှောင်ရုံ)",
        bagCount: 60,
        grossWeightViss: 1220,
        tareWeightViss: 20,
        netWeightViss: 1200,
        tinsCount: 60,
        unitPrice: 90000,
        totalPrice: 5400000,
      },
    ],
    totalBags: 60,
    totalNetWeightViss: 1200,
    totalAmount: 5400000,
    discountAmount: 0,
    netBillableAmount: 5400000,
    paidAmount: 5400000,
    balanceDue: 0,
    paymentMethod: "KPAY",
    date: "၂၀၂၆-၁၁-၁၅",
    status: "paid",
    vehicleNumber: "MDY 4D-5511",
    notes:
      "ဦးလှမောင် အပ်ကုန် Lot မှ ရောင်းချခြင်း။ ငွေအပြည့် KPay ဖြင့် ချေပြီး။",
  },
  {
    id: "INV-002",
    invoiceNo: "INV-2026-102",
    type: "credit",
    buyerName: "ဦးကျော်သူ (ရွှေနဂါး ဆန်ပွဲရုံ)",
    phone: "09-450011223",
    township: "ရန်ကုန် (သီရိမင်္ဂလာဈေး)",
    items: [
      {
        id: "item-2",
        saleMode: "DEPOT_STOCK",
        commodityId: "C-03",
        commodityName: "နှမ်းနက် (စမုံ)",
        warehouseId: "WH-02",
        warehouseName: "WH-02 (ပဲသိုလှောင်ရုံ)",
        bagCount: 80,
        grossWeightViss: 1220,
        tareWeightViss: 20,
        netWeightViss: 1200,
        tinsCount: 80,
        unitPrice: 142000,
        totalPrice: 11360000,
      },
    ],
    totalBags: 80,
    totalNetWeightViss: 1200,
    totalAmount: 11360000,
    discountAmount: 60000,
    netBillableAmount: 11300000,
    paidAmount: 3000000,
    balanceDue: 8300000,
    paymentMethod: "BANK_TRANSFER",
    date: "၂၀၂၆-၁၁-၁၄",
    dueDate: "၂၀၂၆-၁၂-၁၅",
    status: "partial",
    vehicleNumber: "YGN 9B-2345",
    notes:
      "ပွဲရုံပိုင် စတော့မှ ရောင်းချ။ စရန် ၃၀ သိန်း ချေထားပြီး ကျန်ငွေ ၁ လအတွင်း အကြွေးဆပ်ရန်။",
  },
  {
    id: "INV-003",
    invoiceNo: "INV-2026-103",
    type: "credit",
    buyerName: "ကိုဝင်းနိုင် (မော်လမြိုင် သီးနှံရောင်းဝယ်ရေး)",
    phone: "09-790044556",
    township: "မော်လမြိုင်မြို့နယ်",
    items: [
      {
        id: "item-3",
        saleMode: "CONSIGNMENT",
        lotId: "LOT-002",
        commodityId: "C-03",
        commodityName: "နှမ်းနက် (စမုံ)",
        warehouseId: "WH-02",
        warehouseName: "WH-02 (ပဲသိုလှောင်ရုံ)",
        bagCount: 40,
        grossWeightViss: 610,
        tareWeightViss: 10,
        netWeightViss: 600,
        tinsCount: 40,
        unitPrice: 142000,
        totalPrice: 5680000,
      },
    ],
    totalBags: 40,
    totalNetWeightViss: 600,
    totalAmount: 5680000,
    discountAmount: 0,
    netBillableAmount: 5680000,
    paidAmount: 0,
    balanceDue: 5680000,
    date: "၂၀၂၆-၁၁-၁၃",
    dueDate: "၂၀၂၆-၁၁-၃၀",
    status: "unpaid",
    vehicleNumber: "MON 2A-8877",
    notes: "ဦးဘကြည် အပ်ကုန် Lot မှ ရောင်းချခြင်း။ ရက်ချိန်းအကြွေး။",
  },
];

export const SalesInvoices: React.FC = () => {
  // ================= STATE =================
  const [invoices, setInvoices] = useState<SalesInvoice[]>(INITIAL_INVOICES);
  const [activeTab, setActiveTab] = useState<"all" | SaleType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Modal State
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [buyerId, setBuyerId] = useState(MOCK_BUYERS[0]?.id || "");
  const [isCashPaidFull, setIsCashPaidFull] = useState(true);
  const [invoiceDate, setInvoiceDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [dueDate, setDueDate] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [creditPaidAmount, setCreditPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [remarks, setRemarks] = useState("");

  // Line items state (supports Consignment Lot vs Depot Stock)
  const [formLines, setFormLines] = useState<SalesLineItem[]>([
    {
      id: "line-1",
      saleMode: "CONSIGNMENT",
      lotId: AVAILABLE_CONSIGNMENT_LOTS[0].id,
      commodityId: AVAILABLE_CONSIGNMENT_LOTS[0].commodityId,
      commodityName: AVAILABLE_CONSIGNMENT_LOTS[0].commodityName,
      warehouseId: AVAILABLE_CONSIGNMENT_LOTS[0].warehouseId,
      warehouseName: AVAILABLE_CONSIGNMENT_LOTS[0].warehouseName,
      bagCount: 20,
      grossWeightViss: 410,
      tareWeightViss: 10,
      netWeightViss: 400,
      tinsCount: 20,
      unitPrice: AVAILABLE_CONSIGNMENT_LOTS[0].defaultPrice,
      totalPrice: AVAILABLE_CONSIGNMENT_LOTS[0].defaultPrice * 20,
    },
  ]);

  // Selected Buyer
  const selectedBuyer = useMemo(() => {
    return MOCK_BUYERS.find((b) => b.id === buyerId) || null;
  }, [buyerId]);

  // Modal Totals Calculation
  const totalSaleAmount = useMemo(() => {
    return formLines.reduce((sum, l) => sum + (Number(l.totalPrice) || 0), 0);
  }, [formLines]);

  const netSaleAmount = Math.max(
    0,
    totalSaleAmount - (Number(discountAmount) || 0)
  );
  const effectivePaidAmount = isCashPaidFull
    ? netSaleAmount
    : Number(creditPaidAmount) || 0;
  const balanceDueAmount = isCashPaidFull
    ? 0
    : Math.max(0, netSaleAmount - effectivePaidAmount);

  // Credit Limit Exceeded Check
  const projectedBuyerDebt =
    (selectedBuyer?.currentDebt || 0) + balanceDueAmount;
  const exceedsCreditLimit = Boolean(
    !isCashPaidFull &&
      selectedBuyer &&
      projectedBuyerDebt > selectedBuyer.creditLimit
  );

  // Close filter popover on outside click
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

  // Line item value change handler
  const handleLineFieldChange = (
    lineId: string,
    field: keyof SalesLineItem,
    value: any
  ) => {
    setFormLines((prev) =>
      prev.map((line) => {
        if (line.id !== lineId) return line;
        const updated = { ...line, [field]: value };

        if (field === "saleMode") {
          if (value === "CONSIGNMENT") {
            const lot = AVAILABLE_CONSIGNMENT_LOTS[0];
            updated.lotId = lot.id;
            updated.commodityId = lot.commodityId;
            updated.commodityName = lot.commodityName;
            updated.warehouseId = lot.warehouseId;
            updated.warehouseName = lot.warehouseName;
            updated.unitPrice = lot.defaultPrice;
          } else {
            const comm = COMMODITY_OPTIONS[0];
            const wh = WAREHOUSE_LIST[0];
            updated.lotId = undefined;
            updated.commodityId = comm.id;
            updated.commodityName = comm.name;
            updated.warehouseId = wh.id;
            updated.warehouseName = wh.name;
            updated.unitPrice = comm.defaultPrice;
          }
        }

        if (field === "lotId") {
          const lot = AVAILABLE_CONSIGNMENT_LOTS.find((l) => l.id === value);
          if (lot) {
            updated.commodityId = lot.commodityId;
            updated.commodityName = lot.commodityName;
            updated.warehouseId = lot.warehouseId;
            updated.warehouseName = lot.warehouseName;
            updated.unitPrice = lot.defaultPrice;
          }
        }

        if (field === "commodityId") {
          const comm = COMMODITY_OPTIONS.find((c) => c.id === value);
          if (comm) {
            updated.commodityName = comm.name;
            updated.unitPrice = comm.defaultPrice;
          }
        }

        if (field === "warehouseId") {
          const wh = WAREHOUSE_LIST.find((w) => w.id === value);
          if (wh) updated.warehouseName = wh.name;
        }

        const gross = Number(updated.grossWeightViss) || 0;
        const tare = Number(updated.tareWeightViss) || 0;
        const netWeight = Math.max(0, gross - tare);
        updated.netWeightViss = netWeight;

        const comm = COMMODITY_OPTIONS.find(
          (c) => c.id === updated.commodityId
        );
        const vissPerTin = comm?.vissPerTin || 20;
        const tins = Number((netWeight / vissPerTin).toFixed(2));
        updated.tinsCount = tins;

        const unitPrice = Number(updated.unitPrice) || 0;
        updated.totalPrice =
          tins > 0 ? tins * unitPrice : Number(updated.bagCount) * unitPrice;

        return updated;
      })
    );
  };

  const handleAddLine = (mode: SaleMode) => {
    if (mode === "CONSIGNMENT") {
      const lot = AVAILABLE_CONSIGNMENT_LOTS[0];
      setFormLines((prev) => [
        ...prev,
        {
          id: `line-${Date.now()}`,
          saleMode: "CONSIGNMENT",
          lotId: lot.id,
          commodityId: lot.commodityId,
          commodityName: lot.commodityName,
          warehouseId: lot.warehouseId,
          warehouseName: lot.warehouseName,
          bagCount: 10,
          grossWeightViss: 205,
          tareWeightViss: 5,
          netWeightViss: 200,
          tinsCount: 10,
          unitPrice: lot.defaultPrice,
          totalPrice: lot.defaultPrice * 10,
        },
      ]);
    } else {
      const comm = COMMODITY_OPTIONS[0];
      const wh = WAREHOUSE_LIST[0];
      setFormLines((prev) => [
        ...prev,
        {
          id: `line-${Date.now()}`,
          saleMode: "DEPOT_STOCK",
          commodityId: comm.id,
          commodityName: comm.name,
          warehouseId: wh.id,
          warehouseName: wh.name,
          bagCount: 10,
          grossWeightViss: 205,
          tareWeightViss: 5,
          netWeightViss: 200,
          tinsCount: 10,
          unitPrice: comm.defaultPrice,
          totalPrice: comm.defaultPrice * 10,
        },
      ]);
    }
  };

  const handleRemoveLine = (lineId: string) => {
    if (formLines.length <= 1) return;
    setFormLines((prev) => prev.filter((l) => l.id !== lineId));
  };

  // Open Modal
  const handleOpenModal = () => {
    setIsCashPaidFull(true);
    setBuyerId(MOCK_BUYERS[0]?.id || "");
    setVehicleNumber("");
    setDueDate("");
    setDiscountAmount(0);
    setCreditPaidAmount(0);
    setRemarks("");
    setPaymentMethod("CASH");

    const lot = AVAILABLE_CONSIGNMENT_LOTS[0];
    setFormLines([
      {
        id: "line-1",
        saleMode: "CONSIGNMENT",
        lotId: lot.id,
        commodityId: lot.commodityId,
        commodityName: lot.commodityName,
        warehouseId: lot.warehouseId,
        warehouseName: lot.warehouseName,
        bagCount: 20,
        grossWeightViss: 410,
        tareWeightViss: 10,
        netWeightViss: 400,
        tinsCount: 20,
        unitPrice: lot.defaultPrice,
        totalPrice: lot.defaultPrice * 20,
      },
    ]);
    setIsOpenModal(true);
  };

  // Submit Invoice
  const handleSubmitInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuyer) {
      alert("ကျေးဇူးပြု၍ ဝယ်လက် ရွေးချယ်ပေးပါ");
      return;
    }

    const paid = isCashPaidFull ? netSaleAmount : Number(creditPaidAmount) || 0;
    const balance = isCashPaidFull ? 0 : balanceDueAmount;
    const totalBags = formLines.reduce(
      (acc, row) => acc + (Number(row.bagCount) || 0),
      0
    );
    const totalNetWeight = formLines.reduce(
      (acc, row) => acc + (Number(row.netWeightViss) || 0),
      0
    );

    let invoiceStatus: InvoiceStatus = "paid";
    if (balance > 0 && paid > 0) invoiceStatus = "partial";
    if (balance > 0 && paid === 0) invoiceStatus = "unpaid";

    const record: SalesInvoice = {
      id: `INV-${Date.now()}`,
      invoiceNo: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      type: isCashPaidFull ? "cash" : "credit",
      buyerName: selectedBuyer.name,
      phone: selectedBuyer.phone,
      township: selectedBuyer.township,
      items: formLines,
      totalBags: totalBags,
      totalNetWeightViss: totalNetWeight,
      totalAmount: totalSaleAmount,
      discountAmount: Number(discountAmount) || 0,
      netBillableAmount: netSaleAmount,
      paidAmount: paid,
      balanceDue: balance,
      paymentMethod: paid > 0 || isCashPaidFull ? paymentMethod : undefined,
      date: invoiceDate,
      dueDate: !isCashPaidFull ? dueDate || "သတ်မှတ်ရက်မရှိ" : undefined,
      status: invoiceStatus,
      vehicleNumber: vehicleNumber || "-",
      notes:
        remarks.trim() || (isCashPaidFull ? "လက်ငင်းအရောင်း" : "အကြွေးအရောင်း"),
    };

    setInvoices([record, ...invoices]);
    setIsOpenModal(false);
  };

  // ================= COMPUTED METRICS =================
  const cashInvoices = invoices.filter((r) => r.type === "cash");
  const creditInvoices = invoices.filter((r) => r.type === "credit");

  const totalCashSalesValue = cashInvoices.reduce(
    (acc, r) => acc + r.netBillableAmount,
    0
  );
  const totalCreditSalesValue = creditInvoices.reduce(
    (acc, r) => acc + r.netBillableAmount,
    0
  );
  const totalCollectedAmount = invoices.reduce(
    (acc, r) => acc + r.paidAmount,
    0
  );
  const totalReceivableAmount = invoices.reduce(
    (acc, r) => acc + r.balanceDue,
    0
  );

  // Status Filter Options
  const statusOptions = [
    { id: "all", label: "အခြေအနေ အားလုံး" },
    { id: "paid", label: "အပြည့်ရှင်းပြီး" },
    { id: "partial", label: "တစ်စိတ်တစ်ပိုင်းချေ" },
    { id: "unpaid", label: "အကြွေးကျန်ရှိဆဲ" },
  ];

  const selectedStatusObj =
    statusOptions.find((s) => s.id === statusFilter) || statusOptions[0];

  // Filtered Invoices List
  const filteredInvoices = invoices.filter((item) => {
    const matchesTab = activeTab === "all" || item.type === activeTab;
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    const matchesSearch =
      item.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.township.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.items.some((i) =>
        i.commodityName.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return matchesTab && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4 sm:space-y-6 select-none pb-3">
      {/* ================= 1. GREETING & HEADER ================= */}
      <div className="relative overflow-hidden py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">
          အရောင်း ပြေစာ/ဘောက်ချာ စီမံခန့်ခွဲမှု (Sales Invoices)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 sm:mt-3 max-w-xl leading-relaxed">
          ဝယ်လက်များသို့ တောင်သူ့အပ်ကုန်နှင့် ပွဲရုံပိုင်စတော့များမှ
          လက်ငင်းအရောင်း (Cash) နှင့် ရက်ချိန်းအကြွေးအရောင်း (Credit)
          စာရင်းချုပ်
        </p>
      </div>

      {/* ================= 2. 4 KPI SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {/* Card 1: အရောင်းပြေစာ စုစုပေါင်း */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              စုစုပေါင်း အရောင်းပြေစာ
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShoppingCart size={18} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {invoices.length}{" "}
              <span className="text-xs font-normal text-slate-500">စောင်</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              လက်ငင်း {cashInvoices.length} • အကြွေး {creditInvoices.length}
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
            <span>အရောင်း စာရင်းချုပ်</span>
            <span className="text-[11px] text-slate-400 font-normal truncate ml-2">
              ယနေ့အထိ
            </span>
          </div>
        </div>

        {/* Card 2: လက်ငင်း အရောင်းရငွေ */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              လက်ငင်း အရောင်း (Cash)
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Coins size={18} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {(totalCashSalesValue / 100000).toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-500">
                သိန်း ကျပ်
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              {totalCashSalesValue.toLocaleString()} ကျပ်
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-bold">
            <span>လက်ငင်းငွေရရှိပြီး</span>
            <span className="text-[11px] text-slate-400 font-normal truncate ml-2">
              ငွေသား/ဘဏ်လွှဲ
            </span>
          </div>
        </div>

        {/* Card 3: ရရန်ရှိ အကြွေးကျန်ငွေ */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              ရရန်ရှိ အကြွေးကျန်ငွေ
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight">
              {(totalReceivableAmount / 100000).toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-500">
                သိန်း ကျပ်
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              {totalReceivableAmount.toLocaleString()} ကျပ်
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-rose-600 font-bold">
            <span>ဝယ်လက်များထံမှ</span>
            <span className="text-[11px] text-slate-400 font-normal truncate ml-2">
              ရရန်ကျန်
            </span>
          </div>
        </div>

        {/* Card 4: စုစုပေါင်း ကောက်ခံရငွေ */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              စုစုပေါင်း ကောက်ခံရငွေ
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <CreditCard size={18} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {(totalCollectedAmount / 100000).toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-500">
                သိန်း ကျပ်
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              {totalCollectedAmount.toLocaleString()} ကျပ်
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-600 font-bold">
            <span>ငွေဝင်စုစုပေါင်း</span>
            <span className="text-[11px] text-slate-400 font-normal truncate ml-2">
              ဘောက်ချာအားလုံး
            </span>
          </div>
        </div>
      </div>

      {/* ================= 3. TYPE SELECTOR & ACTION STRIP ================= */}
      <div className="space-y-4">
        {/* Buttons ၂ ခု + အားလုံး (Cash Sales vs Credit Sales) */}
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
              အားလုံး ({invoices.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("cash")}
              className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer shrink-0 ${
                activeTab === "cash"
                  ? "bg-btn-color text-white"
                  : "bg-card border border-slate-200 text-slate-600"
              }`}
            >
              လက်ငင်း အရောင်းများ ({cashInvoices.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("credit")}
              className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer shrink-0 ${
                activeTab === "credit"
                  ? "bg-btn-color text-white"
                  : "bg-card border border-slate-200 text-slate-600"
              }`}
            >
              အကြွေး အရောင်းများ ({creditInvoices.length})
            </button>
          </div>

          <div className="text-xs text-slate-500 font-semibold px-1 shrink-0">
            လက်ရှိဖော်ပြစာရင်း:{" "}
            <span className="font-bold text-slate-800">
              {filteredInvoices.length} စောင်
            </span>
          </div>
        </div>

        {/* Search + Status Popover Filter + New Voucher Button */}
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
                placeholder="ဘောက်ချာအမှတ်၊ ဝယ်လက်အမည်၊ သီးနှံ (သို့) ဒေသဖြင့် ရှာပါ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium focus:outline-hidden"
              />
            </div>

            {/* Status Dropdown Filter */}
            <div className="relative shrink-0" ref={filterRef}>
              <button
                type="button"
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className="h-9 px-3.5 rounded-full bg-slate-50 border border-slate-200/90 text-xs font-bold text-slate-700 flex items-center justify-between gap-2 cursor-pointer w-full sm:w-auto"
              >
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-slate-500" />
                  <span>{selectedStatusObj.label}</span>
                </div>
                <ChevronDown size={13} className="text-slate-400" />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-1.5 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    ငွေပေးချေမှု အခြေအနေ
                  </div>
                  {statusOptions.map((opt) => {
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

          {/* New Invoice Button */}
          <button
            type="button"
            onClick={handleOpenModal}
            className="flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 text-xs text-white bg-btn-color hover:bg-btn-hover rounded-full shadow-sm cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>အရောင်းဘောက်ချာ ဖွင့်မည်</span>
          </button>
        </div>
      </div>

      {/* ================= 4. RESPONSIVE CARDS & TABLE VIEW ================= */}
      {/* A. Mobile & Tablet Cards View (< lg) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 lg:hidden">
        {filteredInvoices.length === 0 ? (
          <div className="col-span-full bg-card rounded-3xl p-10 text-center border border-slate-200/80 shadow-xs">
            <p className="text-sm font-bold text-slate-500">
              ရှာဖွေမှုနှင့် ကိုက်ညီသော အရောင်းစာရင်း မတွေ့ရှိပါ
            </p>
          </div>
        ) : (
          filteredInvoices.map((inv) => (
            <div
              key={inv.id}
              className="bg-card rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Header: Voucher No & Type Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                      {inv.invoiceNo}
                    </span>
                    <h3 className="text-sm font-bold text-slate-800 mt-2 leading-tight">
                      {inv.buyerName}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <MapPin size={11} /> {inv.township}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      inv.type === "cash"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                        : "bg-rose-50 text-rose-700 border border-rose-200/60"
                    }`}
                  >
                    {inv.type === "cash" ? "လက်ငင်းအရောင်း" : "အကြွေးအရောင်း"}
                  </span>
                </div>

                {/* Items Summary Box */}
                <div className="mt-3.5 bg-slate-50 p-3 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      ရောင်းချသည့် သီးနှံ:
                    </span>
                    <span className="font-bold text-slate-800">
                      {inv.items.map((i) => i.commodityName).join(", ")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      အရေအတွက် စုစုပေါင်း:
                    </span>
                    <span className="font-black font-mono text-sm text-slate-900">
                      {inv.totalBags.toLocaleString()} အိတ် (
                      {inv.totalNetWeightViss.toLocaleString()} ပိဿာ)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/60">
                    <span className="text-slate-500 font-medium">
                      ကျသင့်ငွေ စုစုပေါင်း:
                    </span>
                    <span className="font-black font-mono text-sm text-slate-900">
                      {inv.netBillableAmount.toLocaleString()} ကျပ်
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500 font-medium">
                      ပေးချေပြီးငွေ:
                    </span>
                    <span className="font-bold text-emerald-600">
                      {inv.paidAmount.toLocaleString()} ကျပ်
                    </span>
                  </div>

                  {inv.balanceDue > 0 && (
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                      <span className="text-rose-600 font-bold">
                        ရရန်ရှိ အကြွေးကျန်:
                      </span>
                      <span className="font-black font-mono text-sm text-rose-600">
                        {inv.balanceDue.toLocaleString()} ကျပ်
                      </span>
                    </div>
                  )}

                  {inv.dueDate && (
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock size={12} className="text-amber-500" />{" "}
                        ပေးဆပ်ရမည့်ရက်:
                      </span>
                      <span className="font-mono text-rose-600 font-bold">
                        {inv.dueDate}
                      </span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {inv.notes && (
                  <p className="text-[11px] text-slate-400 mt-2 px-1 italic truncate">
                    မှတ်ချက်: {inv.notes}
                  </p>
                )}
              </div>

              {/* Card Footer: Phone & Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={`tel:${inv.phone}`}
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Phone size={12} />
                  <span>{inv.phone}</span>
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
                        confirm(`${inv.invoiceNo} အား ဖျက်ပစ်ရန် သေချာပါသလား?`)
                      ) {
                        setInvoices((prev) =>
                          prev.filter((r) => r.id !== inv.id)
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
                <th className="px-5 py-3.5">ဝယ်လက် အမည် / မြို့</th>
                <th className="px-5 py-3.5">ကုန်စည် အမည်</th>
                <th className="px-5 py-3.5 text-right">အရေအတွက်</th>
                <th className="px-5 py-3.5 text-right">ကျသင့်ငွေ (ကျပ်)</th>
                <th className="px-5 py-3.5 text-right">ကျန်ရှိငွေ (အကြွေး)</th>
                <th className="px-5 py-3.5 text-center">အခြေအနေ</th>
                <th className="px-5 py-3.5 text-center">လုပ်ဆောင်ချက်</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-10 text-center text-slate-400 font-bold"
                  >
                    ရှာဖွေမှုနှင့် ကိုက်ညီသော စာရင်း မတွေ့ရှိပါ
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80">
                    {/* Invoice No & Date */}
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-slate-900 block">
                        {inv.invoiceNo}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {inv.date}
                      </span>
                    </td>

                    {/* Type Badge */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.type === "cash"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                            : "bg-rose-50 text-rose-700 border border-rose-200/60"
                        }`}
                      >
                        {inv.type === "cash" ? "လက်ငင်း" : "အကြွေး"}
                      </span>
                    </td>

                    {/* Buyer */}
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800 text-xs">
                        {inv.buyerName}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {inv.township} &bull; {inv.phone}
                      </p>
                    </td>

                    {/* Commodity */}
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-700 block">
                        {inv.items.map((i) => i.commodityName).join(", ")}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {inv.items
                          .map((i) =>
                            i.saleMode === "CONSIGNMENT"
                              ? "တောင်သူ့အပ်ကုန်"
                              : "ပွဲရုံပိုင်"
                          )
                          .join(" • ")}
                      </span>
                    </td>

                    {/* Quantity */}
                    <td className="px-5 py-4 text-right font-mono font-bold text-slate-900 text-sm">
                      {inv.totalBags.toLocaleString()}{" "}
                      <span className="text-xs font-normal text-slate-500 font-sans">
                        အိတ်
                      </span>
                    </td>

                    {/* Total Amount */}
                    <td className="px-5 py-4 text-right font-mono font-bold text-slate-900">
                      {inv.netBillableAmount.toLocaleString()}
                    </td>

                    {/* Balance Due (Credit) */}
                    <td className="px-5 py-4 text-right font-mono font-bold">
                      {inv.balanceDue > 0 ? (
                        <span className="text-rose-600">
                          {inv.balanceDue.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-sans text-[11px] font-normal">
                          (ရှင်းပြီး)
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 text-center">
                      {inv.status === "paid" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 size={11} />
                          အပြည့်ရှင်းပြီး
                        </span>
                      ) : inv.status === "partial" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <Clock size={11} />
                          စရန်ချေထား
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          <AlertCircle size={11} />
                          အကြွေးကျန်
                        </span>
                      )}
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
                                `${inv.invoiceNo} အား ဖျက်ပစ်ရန် သေချာပါသလား?`
                              )
                            ) {
                              setInvoices((prev) =>
                                prev.filter((r) => r.id !== inv.id)
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

      {/* ================= 5. MODAL: CREATE SALES INVOICE (Approved Standard) ================= */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-card w-full max-w-3xl rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xl max-h-[92vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-btn-color text-white flex items-center justify-center font-bold">
                  <ShoppingCart size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    အရောင်းဘောက်ချာ အသစ်ဖွင့်လှစ်ခြင်း
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    တောင်သူ့အပ်ကုန် (ဦးဘ၊ ဦးလှ စသည်) သို့မဟုတ် ပွဲရုံပိုင်
                    စတော့မှ ရောင်းချနိုင်ပါသည်
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
              onSubmit={handleSubmitInvoice}
              className="space-y-4 mt-4 text-xs font-semibold"
            >
              {/* Buyer & Payment Mode Selector */}
              <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    ဝယ်လက် / ကုန်သည် ရွေးချယ်ပါ *
                  </label>
                  <select
                    value={buyerId}
                    onChange={(e) => setBuyerId(e.target.value)}
                    required
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white cursor-pointer"
                  >
                    {MOCK_BUYERS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.township}) - အကြွေးကန့်သတ်:{" "}
                        {b.creditLimit.toLocaleString()} ကျပ်
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    ငွေပေးချေမှု ပုံစံ *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCashPaidFull(true)}
                      className={`py-2 rounded-full text-xs font-bold cursor-pointer border ${
                        isCashPaidFull
                          ? "bg-btn-color text-white border-btn-color"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      လက်ငင်း အပြည့်ချေ
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCashPaidFull(false)}
                      className={`py-2 rounded-full text-xs font-bold cursor-pointer border ${
                        !isCashPaidFull
                          ? "bg-btn-color text-white border-btn-color"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      အကြွေး / တစ်စိတ်တစ်ပိုင်း
                    </button>
                  </div>
                </div>
              </div>

              {/* Date & Vehicle Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/90">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    ရောင်းချသည့် ရက်စွဲ
                  </label>
                  <input
                    type="date"
                    required
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    သယ်ယူမည့် ယာဉ်အမှတ်
                  </label>
                  <input
                    type="text"
                    placeholder="ဥပမာ - MDY 4D-5511"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                  />
                </div>
              </div>

              {/* Line Items Container */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Scale size={15} className="text-slate-500" />
                    ရောင်းချမည့် ကုန်စည်လိုင်းများ:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddLine("DEPOT_STOCK")}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>ပွဲရုံပိုင်စတော့ ရောင်းမည်</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddLine("CONSIGNMENT")}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>တောင်သူ့အပ်ကုန် ရောင်းမည်</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {formLines.map((line, idx) => {
                    const isConsignment = line.saleMode === "CONSIGNMENT";
                    const currentLot = isConsignment
                      ? AVAILABLE_CONSIGNMENT_LOTS.find(
                          (l) => l.id === line.lotId
                        )
                      : undefined;
                    const depotAvailable = !isConsignment
                      ? getDepotAvailableBags(
                          line.commodityId,
                          line.warehouseId
                        )
                      : 0;
                    const maxBags = isConsignment
                      ? currentLot?.remainingBags || 0
                      : depotAvailable;
                    const isExceeding = Number(line.bagCount) > maxBags;

                    return (
                      <div
                        key={line.id}
                        className={`p-3.5 sm:p-4 rounded-2xl border space-y-3 ${
                          isExceeding
                            ? "bg-rose-50/70 border-rose-300"
                            : "bg-slate-50/70 border-slate-200/90"
                        }`}
                      >
                        {/* Line Header: Mode Selector & Delete */}
                        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-500">
                              #{idx + 1} ရောင်းချမှု ပုံစံ:
                            </span>
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  handleLineFieldChange(
                                    line.id,
                                    "saleMode",
                                    "CONSIGNMENT"
                                  )
                                }
                                className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer border ${
                                  isConsignment
                                    ? "bg-btn-color text-white border-btn-color"
                                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                }`}
                              >
                                တောင်သူ့အပ်ကုန်
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleLineFieldChange(
                                    line.id,
                                    "saleMode",
                                    "DEPOT_STOCK"
                                  )
                                }
                                className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer border ${
                                  !isConsignment
                                    ? "bg-btn-color text-white border-btn-color"
                                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                }`}
                              >
                                ပွဲရုံပိုင် စတော့
                              </button>
                            </div>
                          </div>

                          {formLines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveLine(line.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                              title="ဤလိုင်းအား ဖျက်မည်"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>

                        {/* Line Form Fields */}
                        <div className="grid grid-cols-12 gap-2.5 items-center">
                          {isConsignment ? (
                            /* Consignment Lot Picker */
                            <div className="col-span-12 sm:col-span-6">
                              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                                တောင်သူ့အပ်ကုန် Lot ရွေးချယ်ပါ *
                              </label>
                              <select
                                value={line.lotId}
                                onChange={(e) =>
                                  handleLineFieldChange(
                                    line.id,
                                    "lotId",
                                    e.target.value
                                  )
                                }
                                className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white cursor-pointer"
                              >
                                {AVAILABLE_CONSIGNMENT_LOTS.map((lot) => (
                                  <option key={lot.id} value={lot.id}>
                                    {lot.lotNumber} - {lot.commodityName} (
                                    {lot.supplierName}) [ကျန်{" "}
                                    {lot.remainingBags} အိတ် -{" "}
                                    {lot.warehouseName}]
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            /* Depot Stock Pickers */
                            <>
                              <div className="col-span-6 sm:col-span-3">
                                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                                  သီးနှံအမည် ရွေးပါ *
                                </label>
                                <select
                                  value={line.commodityId}
                                  onChange={(e) =>
                                    handleLineFieldChange(
                                      line.id,
                                      "commodityId",
                                      e.target.value
                                    )
                                  }
                                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white cursor-pointer"
                                >
                                  {COMMODITY_OPTIONS.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="col-span-6 sm:col-span-3">
                                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                                  ထုတ်ယူမည့် ဂိုဒေါင် *
                                </label>
                                <select
                                  value={line.warehouseId}
                                  onChange={(e) =>
                                    handleLineFieldChange(
                                      line.id,
                                      "warehouseId",
                                      e.target.value
                                    )
                                  }
                                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white cursor-pointer"
                                >
                                  {WAREHOUSE_LIST.map((w) => (
                                    <option key={w.id} value={w.id}>
                                      {w.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </>
                          )}

                          {/* Bag Count */}
                          <div className="col-span-6 sm:col-span-3">
                            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                              ရောင်းအိတ်ရေ (အိတ်) *
                            </label>
                            <input
                              type="number"
                              min="1"
                              max={maxBags}
                              value={line.bagCount || ""}
                              onChange={(e) =>
                                handleLineFieldChange(
                                  line.id,
                                  "bagCount",
                                  Number(e.target.value)
                                )
                              }
                              className={`w-full text-xs font-bold p-2.5 rounded-xl border bg-white focus:outline-hidden focus:border-[#547a95] ${
                                isExceeding
                                  ? "border-rose-400 text-rose-600"
                                  : "border-slate-200"
                              }`}
                              placeholder="0"
                              required
                            />
                          </div>

                          {/* Unit Price */}
                          <div className="col-span-6 sm:col-span-3">
                            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                              ရောင်းဈေး (၁ တင်း/ကျပ်) *
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={line.unitPrice || ""}
                              onChange={(e) =>
                                handleLineFieldChange(
                                  line.id,
                                  "unitPrice",
                                  Number(e.target.value)
                                )
                              }
                              className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white text-right"
                              placeholder="0"
                              required
                            />
                          </div>
                        </div>

                        {/* Weight Breakdown and Status Badges */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-200/60 text-[11px]">
                          <div>
                            <label className="text-slate-500 block mb-1 font-medium">
                              ချိန်တွယ်အလေးချိန် (ပိဿာ)
                            </label>
                            <input
                              type="number"
                              value={line.grossWeightViss || ""}
                              onChange={(e) =>
                                handleLineFieldChange(
                                  line.id,
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
                              value={line.tareWeightViss || ""}
                              onChange={(e) =>
                                handleLineFieldChange(
                                  line.id,
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
                              {line.netWeightViss.toLocaleString()} ပိဿာ (
                              {line.tinsCount} တင်း)
                            </div>
                          </div>

                          <div className="flex flex-col justify-end text-right">
                            <span className="text-slate-500 text-[10px] block">
                              ကျသင့်ငွေ စုစုပေါင်း:
                            </span>
                            <span className="text-slate-900 font-extrabold text-xs">
                              {line.totalPrice.toLocaleString()} ကျပ်
                            </span>
                          </div>
                        </div>

                        {/* Lot / Stock Status Helper Footer */}
                        <div className="pt-2 border-t border-slate-200/50 flex flex-wrap justify-between items-center text-[11px] gap-2">
                          {isConsignment ? (
                            <>
                              <span className="text-slate-600 font-medium">
                                တောင်သူ:{" "}
                                <b className="text-slate-800">
                                  {currentLot?.supplierName}
                                </b>{" "}
                                | တည်နေရာ:{" "}
                                <b className="text-slate-800">
                                  {currentLot?.warehouseName}
                                </b>
                              </span>
                              <span
                                className={
                                  isExceeding
                                    ? "text-rose-600 font-bold"
                                    : "text-slate-700 font-bold"
                                }
                              >
                                လက်ကျန်: {currentLot?.remainingBags || 0} အိတ်
                                (ပွဲခ:{" "}
                                {currentLot?.commissionRate.toLocaleString()}{" "}
                                ကျပ်/အိတ်)
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-slate-600 font-medium">
                                🏢 ပွဲရုံပိုင် စတော့ (Auto FIFO နုတ်ယူပါမည်)
                              </span>
                              <span
                                className={
                                  isExceeding
                                    ? "text-rose-600 font-bold"
                                    : "text-slate-700 font-bold"
                                }
                              >
                                ပွဲရုံပိုင် လက်ကျန်: {depotAvailable} အိတ်
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Exceeds Credit Limit Alert Banner */}
              {exceedsCreditLimit && selectedBuyer && (
                <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 flex items-center gap-2 text-amber-900 text-xs">
                  <AlertCircle size={16} className="text-amber-700 shrink-0" />
                  <span>
                    သတိပြုရန်: {selectedBuyer.name} ၏ အကြွေးကန့်သတ်ငွေ (
                    {selectedBuyer.creditLimit.toLocaleString()} ကျပ်) ထက်
                    ကျော်လွန်နေပါသည် (စုစုပေါင်းအကြွေး ဖြစ်လာမည့်ငွေ:{" "}
                    {projectedBuyerDebt.toLocaleString()} ကျပ်)
                  </span>
                </div>
              )}

              {/* Due Date if Credit Sale */}
              {!isCashPaidFull && (
                <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/90">
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    အကြွေးပေးဆပ်ရမည့် သတ်မှတ်ရက် (Due Date)
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                  />
                </div>
              )}

              {/* ================= SETTLEMENT SUMMARY CARD ================= */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-3">
                <div className="text-xs font-bold text-slate-800 border-b border-slate-200/80 pb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CreditCard size={15} className="text-slate-600" />
                    အရောင်းငွေ ရှင်းလင်းခြင်း (Settlement)
                  </span>
                  {isCashPaidFull ? (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      လက်ငင်း အပြည့်ရှင်းပြီး
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      ရက်ချိန်း အကြွေးအရောင်း
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>စုစုပေါင်း အရောင်းတန်ဖိုး:</span>
                    <span className="font-bold text-slate-900">
                      {totalSaleAmount.toLocaleString()} ကျပ်
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        (-) လျှော့ပေါ့ငွေ / ခရီးစရိတ်နုတ် (ကျပ်):
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={totalSaleAmount}
                        value={discountAmount || ""}
                        onChange={(e) =>
                          setDiscountAmount(Number(e.target.value))
                        }
                        placeholder="0"
                        className="w-full text-xs font-bold p-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white text-right"
                      />
                    </div>

                    <div className="flex flex-col justify-end text-right">
                      <span className="text-[11px] text-slate-500 font-medium">
                        အသားတင် ကျသင့်ငွေ:
                      </span>
                      <span className="text-base font-black text-slate-900">
                        {netSaleAmount.toLocaleString()} ကျပ်
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Method & Down-payment Logic */}
                {isCashPaidFull ? (
                  /* လက်ငင်းအရောင်း - ပေးချေငွေ ထည့်စရာမလိုဘဲ ငွေလက်ခံနည်းလမ်းသာ ရွေးရန် */
                  <div className="pt-2 border-t border-slate-200/80">
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      ငွေလက်ခံသည့် နည်းလမ်း ရွေးချယ်ပါ
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
                ) : (
                  /* အကြွေးအရောင်း - ယခုအရင်ပေးငွေ/စရန်ငွေ ထည့်နိုင်သော input နှင့် ကျန်ရှိငွေ တွက်ချက်ခြင်း */
                  <div className="space-y-3 pt-2 border-t border-slate-200/80">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          ယခု အရင်ပေးငွေ / စရန်ငွေ (ကျပ်)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={netSaleAmount}
                          value={creditPaidAmount || ""}
                          onChange={(e) =>
                            setCreditPaidAmount(Number(e.target.value))
                          }
                          className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                          placeholder="၀ (လုံးဝမပေးသေးပါက ၀ ထားပါ)"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          ငွေလက်ခံ နည်းလမ်း
                        </label>
                        <select
                          value={paymentMethod}
                          onChange={(e) =>
                            setPaymentMethod(e.target.value as PaymentMethod)
                          }
                          disabled={effectivePaidAmount <= 0}
                          className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white cursor-pointer disabled:opacity-50"
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

                    <div className="flex justify-between items-center pt-2 border-t border-slate-200/80 text-xs">
                      <span className="text-slate-600 font-semibold">
                        ကျန်ရှိမည့် အကြွေးကျန်ငွေ:
                      </span>
                      <span className="font-black text-sm text-rose-600">
                        {balanceDueAmount.toLocaleString()} ကျပ်
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* မှတ်ချက် / Textarea */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  မှတ်ချက် / အထူးမှာကြားချက်
                </label>
                <textarea
                  rows={2}
                  placeholder="ကုန်အရည်အသွေး၊ ကားတင်ပို့မှု အခြေအနေ၊ အကြွေးပေးဆပ်မည့် သဘောတူညီချက် စသည်..."
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
                  အရောင်းဘောက်ချာ အတည်ပြုဖွင့်မည်
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesInvoices;
