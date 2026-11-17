import React, { useState, useMemo } from "react";

import {
  TrendingUp,
  ArrowDownToLine,
  Boxes,
  Plus,
  Edit3,
  Percent,
  X,
  ArrowUpRight,
  Receipt,
  CheckCircle,
} from "lucide-react";

// ================= CHART DATA =================
const data7Days = [
  { day: "တနင်္လာ", paddy: 2800, beans: 1900, commission: 2.8 },
  { day: "အင်္ဂါ", paddy: 3200, beans: 2400, commission: 3.4 },
  { day: "ဗုဒ္ဓဟူး", paddy: 2600, beans: 3100, commission: 3.9 },
  { day: "ကြာသပတေး", paddy: 3900, beans: 2800, commission: 4.2 },
  { day: "သောကြာ", paddy: 4200, beans: 3600, commission: 5.1 },
  { day: "စနေ", paddy: 4800, beans: 4200, commission: 6.2 },
  { day: "တနင်္ဂနွေ", paddy: 3100, beans: 2500, commission: 3.6 },
];

const data30Days = [
  { day: "အပတ် ၁", paddy: 14500, beans: 12200, commission: 14.5 },
  { day: "အပတ် ၂", paddy: 18200, beans: 15400, commission: 18.2 },
  { day: "အပတ် ၃", paddy: 16800, beans: 17100, commission: 16.8 },
  { day: "အပတ် ၄", paddy: 21500, beans: 19800, commission: 21.5 },
];

const stockCropRatio = [
  {
    name: "မတ်ပဲ (အိတ်)",
    value: 35,
    amount: "၃၅,၀၀၀ အိတ်",
    color: "#10b981",
    percent: 35,
  },
  {
    name: "စပါး/ဆန် (တင်း)",
    value: 30,
    amount: "၃၀,၀၀၀ တင်း",
    color: "#547a95",
    percent: 30,
  },
  {
    name: "ပဲတီစိမ်း (အိတ်)",
    value: 20,
    amount: "၂၀,၀၀၀ အိတ်",
    color: "#f59e0b",
    percent: 20,
  },
  {
    name: "ကုလားပဲ/အခြား",
    value: 15,
    amount: "၁၅,၀၀၀ အိတ်",
    color: "#6366f1",
    percent: 15,
  },
];

// သီးနှံတစ်ခုချင်းစီ၏ ၇ ရက်တာ အဝယ်/အရောင်း ဈေးနှုန်းမှတ်တမ်း (Graph အတွက်)
export interface CommodityRate {
  id: string;
  category: "ပဲမျိုးစုံ" | "ဆန်/စပါး";
  name: string;
  unit: string;
  buyPrice: number;
  buyPriceStr: string;
  sellPrice: number;
  sellPriceStr: string;
  spread: number;
  spreadStr: string;
  change: string;
  isUp: boolean;
  history: { day: string; buy: number; sell: number }[];
}

const initialCommodityRates: CommodityRate[] = [
  {
    id: "p1",
    category: "ပဲမျိုးစုံ",
    name: "မတ်ပဲ (FAQ/RC)",
    unit: "၁ တင်း (၂၀ ပိဿာ)",
    buyPrice: 112000,
    buyPriceStr: "၁၁၂,၀၀၀",
    sellPrice: 114500,
    sellPriceStr: "၁၁၄,၅၀၀",
    spread: 2500,
    spreadStr: "၂,၅၀၀",
    change: "+၁,၅၀၀",
    isUp: true,
    history: [
      { day: "တနင်္လာ", buy: 108500, sell: 111000 },
      { day: "အင်္ဂါ", buy: 109500, sell: 112000 },
      { day: "ဗုဒ္ဓဟူး", buy: 110000, sell: 112500 },
      { day: "ကြာသပတေး", buy: 110500, sell: 113000 },
      { day: "သောကြာ", buy: 111000, sell: 113500 },
      { day: "စနေ", buy: 111500, sell: 114000 },
      { day: "တနင်္ဂနွေ", buy: 112000, sell: 114500 },
    ],
  },
  {
    id: "p2",
    category: "ပဲမျိုးစုံ",
    name: "ပဲတီစိမ်း (ရွှေဝါ)",
    unit: "၁ တင်း",
    buyPrice: 78000,
    buyPriceStr: "၇၈,၀၀၀",
    sellPrice: 80000,
    sellPriceStr: "၈၀,၀၀၀",
    spread: 2000,
    spreadStr: "၂,၀၀၀",
    change: "+၅၀၀",
    isUp: true,
    history: [
      { day: "တနင်္လာ", buy: 76000, sell: 78000 },
      { day: "အင်္ဂါ", buy: 76500, sell: 78500 },
      { day: "ဗုဒ္ဓဟူး", buy: 77000, sell: 79000 },
      { day: "ကြာသပတေး", buy: 77000, sell: 79000 },
      { day: "သောကြာ", buy: 77500, sell: 79500 },
      { day: "စနေ", buy: 77500, sell: 79500 },
      { day: "တနင်္ဂနွေ", buy: 78000, sell: 80000 },
    ],
  },
  {
    id: "p3",
    category: "ဆန်/စပါး",
    name: "ဧည့်မထ စပါး (တင်း ၁၀၀)",
    unit: "၁၀၀ တင်း",
    buyPrice: 1840000,
    buyPriceStr: "၁,၈၄၀,၀၀၀",
    sellPrice: 1870000,
    sellPriceStr: "၁,၈၇၀,၀၀၀",
    spread: 30000,
    spreadStr: "၃၀,၀၀၀",
    change: "-၁၀,၀၀၀",
    isUp: false,
    history: [
      { day: "တနင်္လာ", buy: 1870000, sell: 1900000 },
      { day: "အင်္ဂါ", buy: 1860000, sell: 1890000 },
      { day: "ဗုဒ္ဓဟူး", buy: 1860000, sell: 1890000 },
      { day: "ကြာသပတေး", buy: 1850000, sell: 1880000 },
      { day: "သောကြာ", buy: 1850000, sell: 1880000 },
      { day: "စနေ", buy: 1840000, sell: 1870000 },
      { day: "တနင်္ဂနွေ", buy: 1840000, sell: 1870000 },
    ],
  },
  {
    id: "p4",
    category: "ဆန်/စပါး",
    name: "ပေါ်ဆန်းမွှေး စပါး",
    unit: "၁၀၀ တင်း",
    buyPrice: 3150000,
    buyPriceStr: "၃,၁၅၀,၀၀၀",
    sellPrice: 3220000,
    sellPriceStr: "၃,၂၂၀,၀၀၀",
    spread: 70000,
    spreadStr: "၇၀,၀၀၀",
    change: "+၃၀,၀၀၀",
    isUp: true,
    history: [
      { day: "တနင်္လာ", buy: 3080000, sell: 3150000 },
      { day: "အင်္ဂါ", buy: 3100000, sell: 3170000 },
      { day: "ဗုဒ္ဓဟူး", buy: 3110000, sell: 3180000 },
      { day: "ကြာသပတေး", buy: 3120000, sell: 3190000 },
      { day: "သောကြာ", buy: 3130000, sell: 3200000 },
      { day: "စနေ", buy: 3140000, sell: 3210000 },
      { day: "တနင်္ဂနွေ", buy: 3150000, sell: 3220000 },
    ],
  },
  {
    id: "p5",
    category: "ပဲမျိုးစုံ",
    name: "ကုလားပဲ (V2)",
    unit: "၁ တင်း",
    buyPrice: 89000,
    buyPriceStr: "၈၉,၀၀၀",
    sellPrice: 91000,
    sellPriceStr: "၉၁,၀၀၀",
    spread: 2000,
    spreadStr: "၂,၀၀၀",
    change: "၀",
    isUp: true,
    history: [
      { day: "တနင်္လာ", buy: 88000, sell: 90000 },
      { day: "အင်္ဂါ", buy: 88500, sell: 90500 },
      { day: "ဗုဒ္ဓဟူး", buy: 88500, sell: 90500 },
      { day: "ကြာသပတေး", buy: 89000, sell: 91000 },
      { day: "သောကြာ", buy: 89000, sell: 91000 },
      { day: "စနေ", buy: 89000, sell: 91000 },
      { day: "တနင်္ဂနွေ", buy: 89000, sell: 91000 },
    ],
  },
];

const recentBrokerageVouchers = [
  {
    id: "VCH-2026-104",
    partner: "ဦးတင်ဝင်း (ဖျာပုံ)",
    crop: "မတ်ပဲ (FAQ)",
    type: "အရောင်းဘောက်ချာ",
    qty: "၅၀၀ အိတ်",
    amount: "၅၆,၀၀၀,၀၀၀ ကျပ်",
    commission: "၅၆၀,၀၀၀ ကျပ်",
    status: "ရှင်းပြီး",
    statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  {
    id: "VCH-2026-103",
    partner: "ဒေါ်အေးအေးမာ (ဟင်္သာတ)",
    crop: "ပဲတီစိမ်း (ရွှေဝါ)",
    type: "တောင်သူအပ်ကုန်",
    qty: "၃၅၀ အိတ်",
    amount: "၂၇,၃၀၀,၀၀၀ ကျပ်",
    commission: "စောင့်ဆိုင်းဆဲ",
    status: "အပ်နှံဆဲ",
    statusColor: "text-amber-700 bg-amber-50 border-amber-200",
  },
  {
    id: "VCH-2026-102",
    partner: "ရွှေမင်းသား ဆန်ပွဲရုံ (ဘုရင့်နောင်)",
    crop: "ဧည့်မထ စပါး",
    type: "ကုန်အဝင်ဘောက်ချာ",
    qty: "၁,၂၀၀ တင်း",
    amount: "၂၂,၂၀၀,၀၀၀ ကျပ်",
    commission: "၂၂၂,၀၀၀ ကျပ်",
    status: "ရှင်းပြီး",
    statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  {
    id: "VCH-2026-101",
    partner: "ဦးစိုးနိုင် (ဒေးဒရဲ)",
    crop: "ပေါ်ဆန်းမွှေး",
    type: "ကြိုထုတ်ငွေရှင်းတမ်း",
    qty: "၈၀၀ တင်း",
    amount: "၂၅,၆၀၀,၀၀၀ ကျပ်",
    commission: "၂၅၆,၀၀၀ ကျပ်",
    status: "စာရင်းစစ်ပြီး",
    statusColor: "text-blue-700 bg-blue-50 border-blue-200",
  },
];

export const Home: React.FC = () => {
  const [rates, setRates] = useState<CommodityRate[]>(initialCommodityRates);
  const [selectedCommodityId, setSelectedCommodityId] = useState<string>("p1");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<CommodityRate | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<
    "အားလုံး" | "ပဲမျိုးစုံ" | "ဆန်/စပါး"
  >("အားလုံး");
  const [timeRange, setTimeRange] = useState<"7d" | "30d">("7d");
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(
    null
  );

  const trendData = timeRange === "7d" ? data7Days : data30Days;

  // Selected Commodity for Featured Rate Graph
  const activeRate = useMemo(() => {
    return rates.find((r) => r.id === selectedCommodityId) || rates[0];
  }, [rates, selectedCommodityId]);

  // ================= GPU FEATURED RATE GRAPH MATH =================
  const rateGraphData = useMemo(() => {
    const history = activeRate.history;
    const allVals = history.flatMap((h) => [h.buy, h.sell]);
    const minVal = Math.min(...allVals) * 0.985;
    const maxVal = Math.max(...allVals) * 1.015;
    const paddingX = 45;
    const width = 680;
    const height = 180;
    const startY = 210;

    const getX = (idx: number) =>
      paddingX + (idx / (history.length - 1)) * (width - paddingX);
    const getY = (val: number) =>
      startY - ((val - minVal) / (maxVal - minVal)) * height;

    const buyPts = history.map((h, i) => ({ x: getX(i), y: getY(h.buy) }));
    const sellPts = history.map((h, i) => ({ x: getX(i), y: getY(h.sell) }));

    const makeLine = (pts: { x: number; y: number }[]) => {
      let d = `M ${pts[0].x},${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i].y + pts[i + 1].y) / 2;
        d += ` Q ${pts[i].x},${pts[i].y} ${xc},${yc}`;
      }
      d += ` T ${pts[pts.length - 1].x},${pts[pts.length - 1].y}`;
      return d;
    };

    const buyLine = makeLine(buyPts);
    const sellLine = makeLine(sellPts);
    const buyArea = `${buyLine} L ${buyPts[buyPts.length - 1].x},${startY} L ${
      buyPts[0].x
    },${startY} Z`;

    return {
      buyPts,
      sellPts,
      buyLine,
      sellLine,
      buyArea,
      startY,
      minVal,
      maxVal,
    };
  }, [activeRate]);

  // Main Volume Graph Math
  const chartPoints = useMemo(() => {
    const maxVal =
      Math.max(...trendData.map((d) => Math.max(d.paddy, d.beans))) * 1.15;
    const paddingX = 40;
    const width = 760;
    const height = 200;
    const startY = 220;

    const getX = (idx: number) =>
      paddingX + (idx / (trendData.length - 1)) * (width - paddingX);
    const getY = (val: number) => startY - (val / maxVal) * height;

    const paddyCoords = trendData.map((d, i) => ({
      x: getX(i),
      y: getY(d.paddy),
    }));
    const beansCoords = trendData.map((d, i) => ({
      x: getX(i),
      y: getY(d.beans),
    }));

    const makeCurvedPath = (pts: { x: number; y: number }[]) => {
      let d = `M ${pts[0].x},${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i].y + pts[i + 1].y) / 2;
        d += ` Q ${pts[i].x},${pts[i].y} ${xc},${yc}`;
      }
      d += ` T ${pts[pts.length - 1].x},${pts[pts.length - 1].y}`;
      return d;
    };

    const paddyLine = makeCurvedPath(paddyCoords);
    const beansLine = makeCurvedPath(beansCoords);
    const paddyArea = `${paddyLine} L ${
      paddyCoords[paddyCoords.length - 1].x
    },${startY} L ${paddyCoords[0].x},${startY} Z`;
    const beansArea = `${beansLine} L ${
      beansCoords[beansCoords.length - 1].x
    },${startY} L ${beansCoords[0].x},${startY} Z`;

    return {
      paddyCoords,
      beansCoords,
      paddyLine,
      beansLine,
      paddyArea,
      beansArea,
      startY,
    };
  }, [trendData]);

  const filteredRates = rates.filter((item) => {
    if (selectedCategory === "အားလုံး") return true;
    return item.category === selectedCategory;
  });

  const handleSaveRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrice) return;
    setRates((prev) =>
      prev.map((r) => (r.id === editingPrice.id ? editingPrice : r))
    );
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6 select-none pb-3 ">
      {/* ================= 1. GREETING & HEADER ================= */}
      <div className="relative overflow-hidden  py-4 sm:py-6 ">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">
              မင်္ဂလာပါ ဦးအောင်ကျော် (ရွှေစပါးနှင့် သီးနှံစုံ ပွဲရုံ)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-3 max-w-xl leading-relaxed">
              ဆန်/စပါးနှင့် ပဲမျိုးစုံ ကုန်အဝင်၊
              ပွဲရုံဖွင့်လှစ်ဈေးနှုန်းများနှင့် ပွဲခ ကော်မရှင် အကျဉ်းချုပ်
            </p>
          </div>

          <div className="w-full sm:w-auto">
            <button
              type="button"
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-3 text-xs text-white bg-btn-color hover:bg-btn-hover active:scale-95 rounded-full shadow-sm transition cursor-pointer"
            >
              <Plus size={18} />
              <span>ဘောက်ချာသစ် ဖွင့်မည်</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= 2. KPI METRICS (4 CARDS) ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {/* Card 1: ကုန်အဝင် */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              ယနေ့ သီးနှံစုံ အဝင်
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ArrowDownToLine size={18} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              ၃,၂၅၀{" "}
              <span className="text-xs font-normal text-slate-500">
                အိတ်/တင်း
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              ပဲမျိုးစုံ: ၁,၈၅၀ အိတ် | စပါး: ၁,၄၀၀ တင်း
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
            <span className="flex items-center">
              <TrendingUp size={14} className="mr-1 shrink-0" /> +၁၄%
            </span>
            <span className="text-[11px] text-slate-400 font-normal truncate ml-2">
              မနေ့ကထက် ကုန်စည်အဝင်များ
            </span>
          </div>
        </div>

        {/* Card 2: ပွဲခရငွေ */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              ယနေ့ ပွဲခ (Commission) ရငွေ
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Percent size={18} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              ၃,၈၅၀,၀၀၀{" "}
              <span className="text-xs font-normal text-slate-500">ကျပ်</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              အရောင်းအဝယ် တန်ဖိုး: ၃၈၅ သန်း ကျပ်
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
            <span className="flex items-center">
              <TrendingUp size={14} className="mr-1 shrink-0" /> ပွဲခ ၁%
              စံနှုန်း
            </span>
            <span className="text-[11px] text-slate-400 font-normal truncate ml-2">
              ဘောက်ချာ ၁၂ စောင်
            </span>
          </div>
        </div>

        {/* Card 3: လက်ကျန်ကုန် သိုလှောင်မှု */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              လက်ကျန်ကုန် သိုလှောင်မှု
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Boxes size={18} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              ၁၀၀,၀၀၀{" "}
              <span className="text-xs font-normal text-slate-500">
                အိတ်/တင်း
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              တောင်သူအပ်ကုန်: <strong>၆၅%</strong> | ပွဲရုံပိုင်:{" "}
              <strong>၃၅%</strong>
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-purple-700 font-bold">
            <span className="truncate">အပ်ကုန်: ၆၅,၀၀၀ အိတ်</span>
            <span className="text-[11px] text-slate-400 font-normal truncate ml-2">
              ဈေးစောင့်ကုန်များ
            </span>
          </div>
        </div>

        {/* Card 4: တောင်သူ ကြိုထုတ်ငွေ */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              တောင်သူ ကြိုထုတ်ငွေ စာရင်း
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Receipt size={18} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              ၁၄၅.၂{" "}
              <span className="text-xs font-normal text-slate-500">
                သန်း ကျပ်
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              တောင်သူ ၃၄ ဦး (မတ်ပဲနှင့် စပါးပေါ်ချိန် ရှင်းရန်)
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-600 font-bold">
            <span className="truncate">အာမခံရယူပြီး</span>
            <span className="text-[11px] text-slate-400 font-normal truncate ml-2">
              စာရင်းရှင်းဆဲ ၆ ဦး
            </span>
          </div>
        </div>
      </div>

      {/* ================= 3. TRADING VOLUME CHART + CROP RATIO ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left: GPU-Accelerated Real-Time Vector Area Chart */}
        <div className="lg:col-span-2 bg-card p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between min-w-0 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={18} className="text-[#547a95] shrink-0" />
                <span>ဆန်/စပါး နှင့် ပဲမျိုးစုံ နေ့စဉ် အရောင်းအဝယ် လားရာ</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                စပါး/ဆန် အဝင် (တင်း) နှင့် ပဲမျိုးစုံ အဝင် (အိတ်)
                နှိုင်းယှဉ်ချက်
              </p>
            </div>

            <div className="flex items-center self-start sm:self-auto">
              <div className="flex items-center bg-app p-1 rounded-full text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setTimeRange("7d")}
                  className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                    timeRange === "7d"
                      ? "bg-btn-color text-app"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  ၇ ရက်
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange("30d")}
                  className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                    timeRange === "30d"
                      ? "bg-btn-color text-app"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  ၁ လ
                </button>
              </div>
            </div>
          </div>

          <div className="h-56 sm:h-72 w-full relative select-none">
            <svg
              viewBox="0 0 800 250"
              preserveAspectRatio="none"
              className="w-full h-full overflow-visible transition-transform duration-300 ease-in-out"
            >
              <defs>
                <linearGradient id="gpuBeansGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="gpuPaddyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#547a95" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#547a95" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line
                x1="20"
                y1="40"
                x2="780"
                y2="40"
                stroke="#f1f5f9"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <line
                x1="20"
                y1="100"
                x2="780"
                y2="100"
                stroke="#f1f5f9"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <line
                x1="20"
                y1="160"
                x2="780"
                y2="160"
                stroke="#f1f5f9"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <line
                x1="20"
                y1="220"
                x2="780"
                y2="220"
                stroke="#e2e8f0"
                strokeWidth="1.5"
              />

              <path d={chartPoints.beansArea} fill="url(#gpuBeansGrad)" />
              <path d={chartPoints.paddyArea} fill="url(#gpuPaddyGrad)" />
              <path
                d={chartPoints.beansLine}
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d={chartPoints.paddyLine}
                fill="none"
                stroke="#547a95"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {chartPoints.beansCoords.map((pt, idx) => (
                <g
                  key={`beans-pt-${idx}`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPointIndex(idx)}
                  onTouchStart={() => setHoveredPointIndex(idx)}
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredPointIndex === idx ? 6 : 4}
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                </g>
              ))}

              {chartPoints.paddyCoords.map((pt, idx) => (
                <g
                  key={`paddy-pt-${idx}`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPointIndex(idx)}
                  onTouchStart={() => setHoveredPointIndex(idx)}
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredPointIndex === idx ? 6 : 4}
                    fill="#547a95"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <text
                    x={pt.x}
                    y={242}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#64748b"
                    fontWeight="500"
                  >
                    {trendData[idx]?.day}
                  </text>
                </g>
              ))}
            </svg>

            {hoveredPointIndex !== null && trendData[hoveredPointIndex] && (
              <div
                className="absolute top-2 bg-slate-900/95 text-white p-2.5 sm:p-3 rounded-2xl shadow-xl text-xs backdrop-blur-md border border-slate-700 pointer-events-none transition-all duration-150 z-20"
                style={{
                  left: `${Math.min(
                    Math.max(
                      (hoveredPointIndex / (trendData.length - 1)) * 80 + 5,
                      10
                    ),
                    70
                  )}%`,
                }}
              >
                <p className="font-bold border-b border-slate-700 pb-1 mb-1.5 text-slate-300">
                  {trendData[hoveredPointIndex].day}
                </p>
                <p className="text-emerald-400 font-semibold">
                  ပဲမျိုးစုံ:{" "}
                  {trendData[hoveredPointIndex].beans.toLocaleString()} အိတ်
                </p>
                <p className="text-[#38bdf8] font-semibold mt-0.5">
                  စပါး/ဆန်:{" "}
                  {trendData[hoveredPointIndex].paddy.toLocaleString()} တင်း
                </p>
                <p className="text-amber-300 font-bold mt-1 pt-1 border-t border-slate-800">
                  ပွဲခ: {trendData[hoveredPointIndex].commission} သိန်း ကျပ်
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-3 pt-3 border-t border-slate-100 text-xs">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#10b981]" />
              <span className="text-slate-600 font-medium">
                ပဲမျိုးစုံ (အိတ်)
              </span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#547a95]" />
              <span className="text-slate-600 font-medium">
                စပါး/ဆန် (တင်း)
              </span>
            </span>
          </div>
        </div>

        {/* Right: Smooth Donut Chart */}
        <div className="bg-card p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between min-w-0 overflow-hidden">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              <Boxes size={18} className="text-[#547a95] shrink-0" />
              <span>သီးနှံစုံ လက်ကျန် အချိုးအစား</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              လက်ရှိ ပွဲရုံသိုလှောင်ရုံအတွင်းရှိ စုစုပေါင်း ကုန်စည်များ
            </p>

            <div className="h-44 sm:h-52 w-full relative flex items-center justify-center my-2">
              <svg
                viewBox="0 0 200 200"
                className="w-36 h-36 sm:w-44 sm:h-44 -rotate-90 transform overflow-visible"
              >
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="24"
                  strokeDasharray="153.9 439.8"
                  strokeDashoffset="0"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="transparent"
                  stroke="#547a95"
                  strokeWidth="24"
                  strokeDasharray="131.9 439.8"
                  strokeDashoffset="-153.9"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="24"
                  strokeDasharray="87.9 439.8"
                  strokeDashoffset="-285.8"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="transparent"
                  stroke="#6366f1"
                  strokeWidth="24"
                  strokeDasharray="65.9 439.8"
                  strokeDashoffset="-373.7"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl sm:text-2xl font-black text-slate-800">
                  ၁ သိန်း
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  စုစုပေါင်းစတော့
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2 sm:grid-cols-1">
              {stockCropRatio.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50"
                >
                  <div className="flex items-center gap-1.5 truncate mr-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold text-slate-700 truncate text-[11px] sm:text-xs">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-bold text-slate-800 shrink-0 text-[11px] sm:text-xs">
                    {item.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= 4. REDESIGNED HIGH-TECH BROKERAGE RATE BOARD ================= */}
      <div className="bg-card p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 sm:space-y-6">
        {/* Board Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-slate-800">
              သီးနှံပေါက်ဈေးနှင့် အဝယ်/အရောင်း ကွာဟချက်
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ယနေ့ ပွဲရုံဖွင့်ဈေးနှုန်းများနှင့် အဝယ်/အရောင်း ပေါက်ဈေး ကွာဟချက်
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center bg-app p-1 rounded-full text-xs font-semibold">
              {(["အားလုံး", "ပဲမျိုးစုံ", "ဆန်/စပါး"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full transition-all cursor-pointer text-xs ${
                    selectedCategory === cat
                      ? "bg-btn-color text-app"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingPrice(activeRate);
                setIsEditModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 sm:py-2.5 text-xs  text-white bg-btn-color hover:bg-btn-hover active:scale-95 rounded-full shadow-sm transition cursor-pointer"
            >
              <Edit3 size={14} />
              <span>ပေါက်ဈေး ပြင်ဆင်မည်</span>
            </button>
          </div>
        </div>

        {/* ================= 2-COLUMN GRID ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
          {/* LEFT (7 COLS): FEATURED COMMODITY BUY/SELL SPREAD GRAPH */}
          <div className="lg:col-span-7 bg-slate-50/70 p-4 sm:p-6 rounded-2xl border border-slate-200/80 flex flex-col justify-between min-w-0">
            <div>
              {/* Active Commodity Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                      {activeRate.category}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-slate-800 truncate">
                      {activeRate.name}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    စံနှုန်း: {activeRate.unit} &bull; ၇ ရက်တာ ဈေးကွက်လားရာ
                  </p>
                </div>

                {/* Responsive Buy vs Sell Badge Summary (Mobile: 3-column grid, Desktop: flex) */}
                <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-2 w-full sm:w-auto">
                  <div className="bg-white p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200/80 shadow-2xs text-center sm:text-right">
                    <span className="text-[9px] font-semibold text-slate-400 block uppercase">
                      အဝယ်ဈေး
                    </span>
                    <span className="text-xs sm:text-sm font-black text-emerald-600 truncate block">
                      {activeRate.buyPriceStr}
                    </span>
                  </div>
                  <div className="bg-white p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200/80 shadow-2xs text-center sm:text-right">
                    <span className="text-[9px] font-semibold text-slate-400 block uppercase">
                      အရောင်းဈေး
                    </span>
                    <span className="text-xs sm:text-sm font-black text-blue-600 truncate block">
                      {activeRate.sellPriceStr}
                    </span>
                  </div>
                  <div className="bg-[#547a95]/10 p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-[#547a95]/20 text-center sm:text-right">
                    <span className="text-[9px] font-semibold text-[#547a95] block uppercase">
                      Margin
                    </span>
                    <span className="text-xs font-bold text-[#547a95] truncate block">
                      +{activeRate.spreadStr}
                    </span>
                  </div>
                </div>
              </div>

              {/* DUAL LINE VECTOR CHART */}
              <div className="h-48 sm:h-64 w-full relative select-none mt-2">
                <svg
                  viewBox="0 0 700 230"
                  preserveAspectRatio="none"
                  className="w-full h-full overflow-visible"
                >
                  <defs>
                    <linearGradient
                      id="rateBuyGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                      <stop
                        offset="100%"
                        stopColor="#10b981"
                        stopOpacity="0.0"
                      />
                    </linearGradient>
                  </defs>

                  <line
                    x1="30"
                    y1="35"
                    x2="680"
                    y2="35"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <line
                    x1="30"
                    y1="95"
                    x2="680"
                    y2="95"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <line
                    x1="30"
                    y1="155"
                    x2="680"
                    y2="155"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <line
                    x1="30"
                    y1="210"
                    x2="680"
                    y2="210"
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                  />

                  <path d={rateGraphData.buyArea} fill="url(#rateBuyGrad)" />
                  <path
                    d={rateGraphData.sellLine}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d={rateGraphData.buyLine}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {rateGraphData.sellPts.map((pt, i) => (
                    <circle
                      key={`sell-pt-${i}`}
                      cx={pt.x}
                      cy={pt.y}
                      r={3.5}
                      fill="#3b82f6"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  ))}

                  {rateGraphData.buyPts.map((pt, i) => (
                    <g key={`buy-pt-${i}`}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={3.5}
                        fill="#10b981"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                      <text
                        x={pt.x}
                        y={226}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#64748b"
                        fontWeight="600"
                      >
                        {activeRate.history[i]?.day}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Bottom Legend */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3 border-t border-slate-200/80 text-xs">
              <div className="flex items-center gap-4 sm:gap-5">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>အရောင်းဈေး</span>
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>အဝယ်ဈေး</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                * နေ့စဉ် ပွဲရုံစံသတ်မှတ်ချက်
              </span>
            </div>
          </div>

          {/* RIGHT (5 COLS): INTERACTIVE COMMODITY CARDS WITH MINI SPARKLINES */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-2 sm:space-y-2.5">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              သီးနှံရွေးချယ်ပြီး Graph ကြည့်ရှုရန်:
            </div>

            <div className="space-y-2 flex-1">
              {filteredRates.map((item) => {
                const isSelected = item.id === activeRate.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedCommodityId(item.id)}
                    className={`p-2.5 sm:p-3 rounded-2xl border transition-all duration-150 cursor-pointer flex items-center justify-between gap-2 sm:gap-3 ${
                      isSelected
                        ? "bg-white border-[#547a95] shadow-md ring-1 ring-[#547a95]/30"
                        : "bg-slate-50/70 border-slate-200/70 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200/60 text-slate-700 shrink-0">
                          {item.category}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 truncate">
                          {item.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-1 text-[11px]">
                        <span className="text-emerald-600 font-bold truncate">
                          {item.buyPriceStr}
                        </span>
                        <span className="text-slate-300">/</span>
                        <span className="text-blue-600 font-bold truncate">
                          {item.sellPriceStr}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 flex items-center ${
                          item.isUp
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {item.change}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-blue-800 flex items-center gap-2">
              <CheckCircle size={14} className="text-blue-600 shrink-0" />
              <span className="leading-tight">
                သီးနှံကတ်တစ်ခုစီကို နှိပ်ပြီး ၇ ရက်တာ ဈေးနှုန်း Graph
                အပြောင်းအလဲကို စစ်ဆေးနိုင်ပါသည်
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 5. RECENT BROKERAGE VOUCHERS TABLE ================= */}
      <div className="bg-card rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              လတ်တလော ဆန်/စပါး နှင့် ပဲမျိုးစုံ ဘောက်ချာများ
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              တောင်သူအပ်ကုန်၊ အရောင်းအဝယ်နှင့် ပွဲခ ရှင်းတမ်း ဘောက်ချာများ
            </p>
          </div>
          <button
            type="button"
            className="text-xs font-bold text-[#547a95] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>ဘောက်ချာအားလုံး ကြည့်မည်</span>
            <ArrowUpRight size={15} />
          </button>
        </div>

        <div className="overflow-x-auto sidebar-scrollbar">
          <table className="w-full text-left text-xs sm:text-sm text-slate-600 min-w-[720px]">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase text-[11px] border-b border-slate-100">
              <tr>
                <th className="px-4 sm:px-6 py-3.5">ဘောက်ချာအမှတ်</th>
                <th className="px-4 sm:px-6 py-3.5">တောင်သူ / ကုန်သည်</th>
                <th className="px-4 sm:px-6 py-3.5">ကုန်စည်အမျိုးအမည်</th>
                <th className="px-4 sm:px-6 py-3.5">အမျိုးအစား</th>
                <th className="px-4 sm:px-6 py-3.5">ပမာဏ</th>
                <th className="px-4 sm:px-6 py-3.5">ကျသင့်ငွေ</th>
                <th className="px-4 sm:px-6 py-3.5">ပွဲခ (Commission)</th>
                <th className="px-4 sm:px-6 py-3.5 text-center">အခြေအနေ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentBrokerageVouchers.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-4 sm:px-6 py-3.5 font-bold text-[#547a95] whitespace-nowrap">
                    {row.id}
                  </td>
                  <td className="px-4 sm:px-6 py-3.5 font-medium text-slate-800 whitespace-nowrap">
                    {row.partner}
                  </td>
                  <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap font-semibold text-slate-700">
                    {row.crop}
                  </td>
                  <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {row.type}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3.5 font-medium whitespace-nowrap">
                    {row.qty}
                  </td>
                  <td className="px-4 sm:px-6 py-3.5 font-bold text-slate-800 whitespace-nowrap">
                    {row.amount}
                  </td>
                  <td className="px-4 sm:px-6 py-3.5 font-bold text-emerald-600 whitespace-nowrap">
                    {row.commission}
                  </td>
                  <td className="px-4 sm:px-6 py-3.5 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] font-bold border ${row.statusColor}`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= 6. MODAL (MOBILE KEYBOARD COMPATIBLE) ================= */}
      {isEditModalOpen && editingPrice && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-card w-full max-w-md rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xl max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  ပွဲရုံဖွင့်ဈေး အသစ် သတ်မှတ်ရန်
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ရွေးချယ်ထားသော ကုန်စည်၏ အဝယ်/အရောင်းဈေး ပြင်ဆင်ခြင်း
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRate} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  ကုန်စည် အမျိုးအစား ရွေးချယ်ပါ
                </label>
                <select
                  value={editingPrice.id}
                  onChange={(e) => {
                    const found = rates.find((r) => r.id === e.target.value);
                    if (found) setEditingPrice(found);
                  }}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#547a95]"
                >
                  {rates.map((r) => (
                    <option key={r.id} value={r.id}>
                      [{r.category}] {r.name} - {r.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    အဝယ်ဈေး (တောင်သူထံမှ)
                  </label>
                  <input
                    type="text"
                    value={editingPrice.buyPriceStr}
                    onChange={(e) =>
                      setEditingPrice({
                        ...editingPrice,
                        buyPriceStr: e.target.value,
                      })
                    }
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                    placeholder="ဥပမာ- ၁၁၂,၀၀၀"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    အရောင်းဈေး (ဝယ်လက်သို့)
                  </label>
                  <input
                    type="text"
                    value={editingPrice.sellPriceStr}
                    onChange={(e) =>
                      setEditingPrice({
                        ...editingPrice,
                        sellPriceStr: e.target.value,
                      })
                    }
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                    placeholder="ဥပမာ- ၁၁၄,၅၀၀"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer text-center"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2 text-xs font-bold text-white bg-[#547a95] hover:bg-[#43647b] rounded-xl shadow-sm transition cursor-pointer text-center"
                >
                  ပေါက်ဈေး အတည်ပြုမည်
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
