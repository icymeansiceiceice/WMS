import React, { useState, useId, useRef, useEffect } from "react";
import {
  Factory,
  Boxes,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Scale,
  X,
  AlertCircle,
  Sparkles,
  Wheat,
  UserCheck,
} from "lucide-react";

// Types
export type ProcessType = "PADDY_MILLING" | "SEED_CLEANING" | "PULSE_SPLITTING";
export type ProcessStatus = "IN_PROGRESS" | "COMPLETED";

export interface MillingOutputItem {
  productName: string;
  category: "HEAD_PRODUCT" | "BROKEN_PRODUCT" | "BY_PRODUCT" | "WASTE";
  bags: number;
  weightViss: number;
  warehouseName: string;
  bayLocation: string;
}

export interface MillingBatchRecord {
  id: string;
  batchNo: string;
  date: string;
  processType: ProcessType;
  status: ProcessStatus;
  machineLine: string; // ဥပမာ- စက်လိုင်း (၁) - ရွှေဝါလင်း
  sourceLotNo: string;
  rawMaterialName: string;
  ownerType: "CONSIGNMENT" | "DEPOT_STOCK";
  ownerName: string; // တောင်သူအမည် သို့မဟုတ် ပွဲရုံပိုင်
  sourceWarehouse: string;
  sourceBay: string;
  // Input Metrics
  inputBags: number;
  inputWeightViss: number;
  inputBaskets: number; // တင်းရေ (စပါးအတွက်)
  moisturePercent: number; // အစိုဓာတ် %
  // Output Products
  outputs: MillingOutputItem[];
  totalOutputBags: number;
  totalOutputWeightViss: number;
  recoveryRatePercent: number; // အထွက်နှုန်း %
  // Financials & Administration
  millingFeePerBag: number;
  totalMillingFee: number;
  feePayer: "FARMER" | "DEPOT";
  operatorInCharge: string;
  notes: string;
  createdAt: string;
  completedAt?: string;
}

// Available Raw Material Lots for Input
interface RawMaterialLot {
  id: string;
  lotNo: string;
  commodityName: string;
  ownerType: "CONSIGNMENT" | "DEPOT_STOCK";
  ownerName: string;
  warehouseName: string;
  bayLocation: string;
  availableBags: number;
  availableWeightViss: number;
  moisturePercent: number;
}

// Initial Mock Raw Material Stock Lots
const initialRawMaterialLots: RawMaterialLot[] = [
  {
    id: "RAW-001",
    lotNo: "LOT-2024-009",
    commodityName: "မနောသုခ စပါး (သစ်)",
    ownerType: "CONSIGNMENT",
    ownerName: "ဦးတင်ဝင်း (ရွှေဘို)",
    warehouseName: "ဂိုဒေါင် အမှတ် (၃)",
    bayLocation: "Zone C-01",
    availableBags: 200,
    availableWeightViss: 6000,
    moisturePercent: 13.5,
  },
  {
    id: "RAW-002",
    lotNo: "LOT-2024-015",
    commodityName: "ရွှေဘိုပေါ်ဆန်း စပါး (အဟောင်း)",
    ownerType: "CONSIGNMENT",
    ownerName: "ဦးဘခင် (ဒီပဲယင်း)",
    warehouseName: "ဂိုဒေါင် အမှတ် (၃)",
    bayLocation: "Zone C-04",
    availableBags: 350,
    availableWeightViss: 10500,
    moisturePercent: 12.0,
  },
  {
    id: "RAW-003",
    lotNo: "DPT-2024-022",
    commodityName: "ဧရာမင်း စပါး",
    ownerType: "DEPOT_STOCK",
    ownerName: "ပွဲရုံပိုင် စတော့",
    warehouseName: "ဂိုဒေါင် အမှတ် (၁)",
    bayLocation: "Zone A-05",
    availableBags: 500,
    availableWeightViss: 15000,
    moisturePercent: 12.8,
  },
  {
    id: "RAW-004",
    lotNo: "LOT-2024-018",
    commodityName: "ပဲတီစိမ်း (အညာ ရွှေဝါ - ပဲကြမ်း)",
    ownerType: "CONSIGNMENT",
    ownerName: "ဒေါ်မြင့်မြင့် (နွားထိုးကြီး)",
    warehouseName: "ဂိုဒေါင် အမှတ် (၂)",
    bayLocation: "Zone B-02",
    availableBags: 120,
    availableWeightViss: 3600,
    moisturePercent: 11.5,
  },
  {
    id: "RAW-005",
    lotNo: "DPT-2024-030",
    commodityName: "ကုလားပဲလုံး (ဗွတ်ဖြူ - ကြမ်း)",
    ownerType: "DEPOT_STOCK",
    ownerName: "ပွဲရုံပိုင် စတော့",
    warehouseName: "ဂိုဒေါင် အမှတ် (၂)",
    bayLocation: "Zone B-04",
    availableBags: 180,
    availableWeightViss: 5400,
    moisturePercent: 10.8,
  },
];

// Initial Milling Batches
const initialMillingBatches: MillingBatchRecord[] = [
  {
    id: "BAT-001",
    batchNo: "ML-2024-0015",
    date: "2024-11-16",
    processType: "PADDY_MILLING",
    status: "COMPLETED",
    machineLine: "စက်လိုင်း (၁) - ရွှေဝါလင်း",
    sourceLotNo: "LOT-2024-009",
    rawMaterialName: "မနောသုခ စပါး (သစ်)",
    ownerType: "CONSIGNMENT",
    ownerName: "ဦးတင်ဝင်း (ရွှေဘို)",
    sourceWarehouse: "ဂိုဒေါင် အမှတ် (၃)",
    sourceBay: "Zone C-01",
    inputBags: 100,
    inputWeightViss: 3000,
    inputBaskets: 500,
    moisturePercent: 13.5,
    outputs: [
      {
        productName: "မနောသုခ ဆန်ချော (White Rice)",
        category: "HEAD_PRODUCT",
        bags: 52,
        weightViss: 1560,
        warehouseName: "ဂိုဒေါင် အမှတ် (၁)",
        bayLocation: "Zone A-02",
      },
      {
        productName: "မနောသုခ ဆန်ကွဲ (Broken Rice)",
        category: "BROKEN_PRODUCT",
        bags: 12,
        weightViss: 360,
        warehouseName: "ဂိုဒေါင် အမှတ် (၁)",
        bayLocation: "Zone A-03",
      },
      {
        productName: "စပါးဖွဲနု (Rice Bran)",
        category: "BY_PRODUCT",
        bags: 15,
        weightViss: 450,
        warehouseName: "ဂိုဒေါင် အမှတ် (၄)",
        bayLocation: "Zone D-01",
      },
      {
        productName: "စပါးခွံ/အလေအလွင့် (Husk & Dust)",
        category: "WASTE",
        bags: 18,
        weightViss: 540,
        warehouseName: "ပြင်ပ စွန့်ပစ်ကွင်း",
        bayLocation: "Yard-01",
      },
    ],
    totalOutputBags: 97,
    totalOutputWeightViss: 2910,
    recoveryRatePercent: 53.6,
    millingFeePerBag: 3000,
    totalMillingFee: 300000,
    feePayer: "FARMER",
    operatorInCharge: "ဦးကျော်ဆန်း (စက်ရုံမှူး)",
    notes: "အစိုဓာတ်သင့်တင့်ပြီး ဆန်ကျိုးနည်းပါးသည်၊ ဆန်သားကြည်လင်။",
    createdAt: "08:30 AM",
    completedAt: "02:15 PM",
  },
  {
    id: "BAT-002",
    batchNo: "ML-2024-0016",
    date: "2024-11-16",
    processType: "PADDY_MILLING",
    status: "IN_PROGRESS",
    machineLine: "စက်လိုင်း (၂) - ပုလဲသွယ်",
    sourceLotNo: "DPT-2024-022",
    rawMaterialName: "ဧရာမင်း စပါး",
    ownerType: "DEPOT_STOCK",
    ownerName: "ပွဲရုံပိုင် စတော့",
    sourceWarehouse: "ဂိုဒေါင် အမှတ် (၁)",
    sourceBay: "Zone A-05",
    inputBags: 150,
    inputWeightViss: 4500,
    inputBaskets: 750,
    moisturePercent: 12.8,
    outputs: [
      {
        productName: "ဧရာမင်း ဆန်သန့် (ခန့်မှန်း)",
        category: "HEAD_PRODUCT",
        bags: 78,
        weightViss: 2340,
        warehouseName: "ဂိုဒေါင် အမှတ် (၁)",
        bayLocation: "Zone A-01",
      },
      {
        productName: "ဧရာမင်း ဆန်ကွဲ (ခန့်မှန်း)",
        category: "BROKEN_PRODUCT",
        bags: 18,
        weightViss: 540,
        warehouseName: "ဂိုဒေါင် အမှတ် (၁)",
        bayLocation: "Zone A-03",
      },
    ],
    totalOutputBags: 96,
    totalOutputWeightViss: 2880,
    recoveryRatePercent: 52.0,
    millingFeePerBag: 2800,
    totalMillingFee: 420000,
    feePayer: "DEPOT",
    operatorInCharge: "ဦးမြင့်အောင် (စက်ပြင်ခေါင်းဆောင်)",
    notes: "စက်လိုင်း (၂) တွင် လည်ပတ်ဆဲ၊ ညနေ ၅ နာရီ ပြီးစီးမည်။",
    createdAt: "01:00 PM",
  },
  {
    id: "BAT-003",
    batchNo: "CP-2024-0008",
    date: "2024-11-15",
    processType: "SEED_CLEANING",
    status: "COMPLETED",
    machineLine: "သန့်စင်စက်လိုင်း (A)",
    sourceLotNo: "LOT-2024-018",
    rawMaterialName: "ပဲတီစိမ်း (အညာ ရွှေဝါ - ပဲကြမ်း)",
    ownerType: "CONSIGNMENT",
    ownerName: "ဒေါ်မြင့်မြင့် (နွားထိုးကြီး)",
    sourceWarehouse: "ဂိုဒေါင် အမှတ် (၂)",
    sourceBay: "Zone B-02",
    inputBags: 60,
    inputWeightViss: 1800,
    inputBaskets: 300,
    moisturePercent: 11.5,
    outputs: [
      {
        productName: "ပဲတီစိမ်း (Special Grade A)",
        category: "HEAD_PRODUCT",
        bags: 48,
        weightViss: 1440,
        warehouseName: "ဂိုဒေါင် အမှတ် (၂)",
        bayLocation: "Zone B-01",
      },
      {
        productName: "ပဲတီစိမ်း အစေ့သေး (Under Grade)",
        category: "BROKEN_PRODUCT",
        bags: 8,
        weightViss: 240,
        warehouseName: "ဂိုဒေါင် အမှတ် (၂)",
        bayLocation: "Zone B-03",
      },
      {
        productName: "ဖုန်မှုန့်နှင့် အဖျင်း (Waste Refuse)",
        category: "WASTE",
        bags: 3,
        weightViss: 90,
        warehouseName: "ပြင်ပ စွန့်ပစ်ကွင်း",
        bayLocation: "Yard-02",
      },
    ],
    totalOutputBags: 59,
    totalOutputWeightViss: 1770,
    recoveryRatePercent: 80.0,
    millingFeePerBag: 2000,
    totalMillingFee: 120000,
    feePayer: "FARMER",
    operatorInCharge: "ကိုအောင်နိုင် (သန့်စင်မှူး)",
    notes: "လိုင်းခွဲစက်ဖြင့် ဖုန်ခါ၊ အရွယ်အစားခွဲထုတ်မှု ပြီးစီး။",
    createdAt: "09:00 AM",
    completedAt: "12:30 PM",
  },
  {
    id: "BAT-004",
    batchNo: "PS-2024-0004",
    date: "2024-11-14",
    processType: "PULSE_SPLITTING",
    status: "COMPLETED",
    machineLine: "ပဲခြမ်းစက်လိုင်း (B)",
    sourceLotNo: "DPT-2024-030",
    rawMaterialName: "ကုလားပဲလုံး (ဗွတ်ဖြူ - ကြမ်း)",
    ownerType: "DEPOT_STOCK",
    ownerName: "ပွဲရုံပိုင် စတော့",
    sourceWarehouse: "ဂိုဒေါင် အမှတ် (၂)",
    sourceBay: "Zone B-04",
    inputBags: 80,
    inputWeightViss: 2400,
    inputBaskets: 400,
    moisturePercent: 10.8,
    outputs: [
      {
        productName: "ကုလားပဲခြမ်း (Chana Dal)",
        category: "HEAD_PRODUCT",
        bags: 62,
        weightViss: 1860,
        warehouseName: "ဂိုဒေါင် အမှတ် (၂)",
        bayLocation: "Zone B-05",
      },
      {
        productName: "ပဲဖွဲနုနှင့် အခွံ (Gram Husk)",
        category: "BY_PRODUCT",
        bags: 16,
        weightViss: 480,
        warehouseName: "ဂိုဒေါင် အမှတ် (၄)",
        bayLocation: "Zone D-02",
      },
    ],
    totalOutputBags: 78,
    totalOutputWeightViss: 2340,
    recoveryRatePercent: 77.5,
    millingFeePerBag: 2500,
    totalMillingFee: 200000,
    feePayer: "DEPOT",
    operatorInCharge: "ဦးကျော်ဆန်း (စက်ရုံမှူး)",
    notes: "အလုံးချော ကုလားပဲခြမ်း အရည်အသွေး ကောင်းမွန်။",
    createdAt: "10:15 AM",
    completedAt: "04:00 PM",
  },
];

export const PaddyMillingReprocessing: React.FC = () => {
  // State
  const [batches, setBatches] = useState<MillingBatchRecord[]>(
    initialMillingBatches
  );
  const [rawLots] = useState<RawMaterialLot[]>(initialRawMaterialLots);

  // Filter Tabs & Search
  const [activeTab, setActiveTab] = useState<
    "ALL" | "PADDY_MILLING" | "SEED_CLEANING" | "IN_PROGRESS"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingBatch, setViewingBatch] = useState<MillingBatchRecord | null>(
    null
  );

  // Form State
  const [processType, setProcessType] = useState<ProcessType>("PADDY_MILLING");
  const [selectedRawLotId, setSelectedRawLotId] = useState(
    initialRawMaterialLots[0]?.id || ""
  );
  const [machineLine, setMachineLine] = useState("စက်လိုင်း (၁) - ရွှေဝါလင်း");
  const [inputBags, setInputBags] = useState<number | "">(50);
  const [moisturePercent, setMoisturePercent] = useState<number | "">(13.0);
  const [millingFeePerBag, setMillingFeePerBag] = useState<number | "">(3000);
  const [operatorInCharge, setOperatorInCharge] = useState(
    "ဦးကျော်ဆန်း (စက်ရုံမှူး)"
  );
  const [status, setStatus] = useState<ProcessStatus>("IN_PROGRESS");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Target output estimation values
  const [headRiceBags, setHeadRiceBags] = useState<number | "">(26);
  const [brokenRiceBags, setBrokenRiceBags] = useState<number | "">(6);
  const [branBags, setBranBags] = useState<number | "">(8);
  const [targetWarehouse, setTargetWarehouse] = useState("ဂိုဒေါင် အမှတ် (၁)");
  const [targetBay, setTargetBay] = useState("Zone A-02");

  // Click outside ref for filter
  const filterRef = useRef<HTMLDivElement>(null);
  const searchInputId = useId();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsStatusFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Currently selected raw material lot
  const selectedLot = rawLots.find((l) => l.id === selectedRawLotId);

  // Auto Calculations
  const numericInputBags = typeof inputBags === "number" ? inputBags : 0;
  const numericInputWeight = numericInputBags * 30; // Approx 30 viss per bag
  const numericInputBaskets = numericInputBags * 5; // Approx 5 baskets per bag (paddy standard)
  const numericMillingFee =
    typeof millingFeePerBag === "number" ? millingFeePerBag : 0;
  const totalCalculatedFee = numericInputBags * numericMillingFee;

  // Auto calculate estimated head recovery
  const numHead = typeof headRiceBags === "number" ? headRiceBags : 0;
  const numBroken = typeof brokenRiceBags === "number" ? brokenRiceBags : 0;
  const numBran = typeof branBags === "number" ? branBags : 0;
  const estimatedRecoveryRate =
    numericInputBags > 0
      ? ((numHead / numericInputBags) * 100).toFixed(1)
      : "0.0";

  // Filter batches
  const filteredBatches = batches.filter((b) => {
    if (activeTab === "PADDY_MILLING" && b.processType !== "PADDY_MILLING")
      return false;
    if (
      activeTab === "SEED_CLEANING" &&
      b.processType !== "SEED_CLEANING" &&
      b.processType !== "PULSE_SPLITTING"
    )
      return false;
    if (activeTab === "IN_PROGRESS" && b.status !== "IN_PROGRESS") return false;

    if (selectedStatusFilter !== "ALL" && b.status !== selectedStatusFilter)
      return false;

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchBatch = b.batchNo.toLowerCase().includes(q);
      const matchLot = b.sourceLotNo.toLowerCase().includes(q);
      const matchName = b.rawMaterialName.toLowerCase().includes(q);
      const matchOwner = b.ownerName.toLowerCase().includes(q);
      const matchMachine = b.machineLine.toLowerCase().includes(q);
      const matchOperator = b.operatorInCharge.toLowerCase().includes(q);
      return (
        matchBatch ||
        matchLot ||
        matchName ||
        matchOwner ||
        matchMachine ||
        matchOperator
      );
    }
    return true;
  });

  // KPI Calculations
  const totalBatchesCount = batches.length;
  const runningBatchesCount = batches.filter(
    (b) => b.status === "IN_PROGRESS"
  ).length;
  const totalInputBagsProcessed = batches.reduce(
    (sum, b) => sum + b.inputBags,
    0
  );
  const totalHeadProductBags = batches.reduce((sum, b) => {
    const head = b.outputs.find((o) => o.category === "HEAD_PRODUCT");
    return sum + (head ? head.bags : 0);
  }, 0);
  const totalByProductBags = batches.reduce((sum, b) => {
    const byProducts = b.outputs.filter(
      (o) => o.category === "BROKEN_PRODUCT" || o.category === "BY_PRODUCT"
    );
    return sum + byProducts.reduce((s, p) => s + p.bags, 0);
  }, 0);
  const overallAvgRecovery =
    totalInputBagsProcessed > 0
      ? ((totalHeadProductBags / totalInputBagsProcessed) * 100).toFixed(1)
      : "0.0";

  // Open Modal Handler
  const handleOpenNewBatchModal = () => {
    setSelectedRawLotId(rawLots[0]?.id || "");
    setProcessType("PADDY_MILLING");
    setMachineLine("စက်လိုင်း (၁) - ရွှေဝါလင်း");
    setInputBags(50);
    setMoisturePercent(13.0);
    setMillingFeePerBag(3000);
    setHeadRiceBags(26);
    setBrokenRiceBags(6);
    setBranBags(8);
    setTargetWarehouse("ဂိုဒေါင် အမှတ် (၁)");
    setTargetBay("Zone A-02");
    setOperatorInCharge("ဦးကျော်ဆန်း (စက်ရုံမှူး)");
    setStatus("IN_PROGRESS");
    setNotes("");
    setErrorMsg("");
    setIsModalOpen(true);
  };

  // Submit Handler
  const handleSubmitBatch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLot) {
      setErrorMsg("ကျေးဇူးပြု၍ ကုန်ကြမ်း Lot ရွေးချယ်ပေးပါ");
      return;
    }

    if (numericInputBags <= 0) {
      setErrorMsg("သွင်းမည့် အိတ်အရေအတွက် မှန်ကန်စွာ ဖြည့်သွင်းပါ");
      return;
    }

    if (numericInputBags > selectedLot.availableBags) {
      setErrorMsg(
        `သွင်းမည့် အိတ်ရေသည် ကုန်ကြမ်းလက်ကျန် (${selectedLot.availableBags} အိတ်) ထက် မကျော်လွန်နိုင်ပါ`
      );
      return;
    }

    // Build Outputs
    const outputsList: MillingOutputItem[] = [];
    if (processType === "PADDY_MILLING") {
      outputsList.push({
        productName: `${selectedLot.commodityName
          .replace("စပါး", "")
          .trim()} ဆန်ချော`,
        category: "HEAD_PRODUCT",
        bags: numHead,
        weightViss: numHead * 30,
        warehouseName: targetWarehouse,
        bayLocation: targetBay,
      });
      if (numBroken > 0) {
        outputsList.push({
          productName: `${selectedLot.commodityName
            .replace("စပါး", "")
            .trim()} ဆန်ကွဲ`,
          category: "BROKEN_PRODUCT",
          bags: numBroken,
          weightViss: numBroken * 30,
          warehouseName: targetWarehouse,
          bayLocation: "Zone A-03",
        });
      }
      if (numBran > 0) {
        outputsList.push({
          productName: "ဖွဲနု / ဖွဲကြမ်း",
          category: "BY_PRODUCT",
          bags: numBran,
          weightViss: numBran * 30,
          warehouseName: "ဂိုဒေါင် အမှတ် (၄)",
          bayLocation: "Zone D-01",
        });
      }
    } else {
      outputsList.push({
        productName: `${selectedLot.commodityName} (သန့်စင်ပြီး)`,
        category: "HEAD_PRODUCT",
        bags: numHead,
        weightViss: numHead * 30,
        warehouseName: targetWarehouse,
        bayLocation: targetBay,
      });
      if (numBroken > 0) {
        outputsList.push({
          productName: "အစေ့သေး / ပဲခြမ်း",
          category: "BROKEN_PRODUCT",
          bags: numBroken,
          weightViss: numBroken * 30,
          warehouseName: targetWarehouse,
          bayLocation: "Zone B-03",
        });
      }
    }

    const totalOutBags = outputsList.reduce((sum, o) => sum + o.bags, 0);
    const totalOutWeight = outputsList.reduce(
      (sum, o) => sum + o.weightViss,
      0
    );

    const prefix =
      processType === "PADDY_MILLING"
        ? "ML"
        : processType === "SEED_CLEANING"
        ? "CP"
        : "PS";
    const newBatch: MillingBatchRecord = {
      id: `BAT-${Date.now().toString().slice(-4)}`,
      batchNo: `${prefix}-2024-${String(batches.length + 17).padStart(4, "0")}`,
      date: new Date().toISOString().split("T")[0],
      processType,
      status,
      machineLine,
      sourceLotNo: selectedLot.lotNo,
      rawMaterialName: selectedLot.commodityName,
      ownerType: selectedLot.ownerType,
      ownerName: selectedLot.ownerName,
      sourceWarehouse: selectedLot.warehouseName,
      sourceBay: selectedLot.bayLocation,
      inputBags: numericInputBags,
      inputWeightViss: numericInputWeight,
      inputBaskets: numericInputBaskets,
      moisturePercent:
        typeof moisturePercent === "number" ? moisturePercent : 13.0,
      outputs: outputsList,
      totalOutputBags: totalOutBags,
      totalOutputWeightViss: totalOutWeight,
      recoveryRatePercent: parseFloat(estimatedRecoveryRate) || 0,
      millingFeePerBag: numericMillingFee,
      totalMillingFee: totalCalculatedFee,
      feePayer: selectedLot.ownerType === "CONSIGNMENT" ? "FARMER" : "DEPOT",
      operatorInCharge: operatorInCharge.trim() || "စက်ရုံတာဝန်ခံ",
      notes: notes.trim() || "စက်ကြိတ်ခွဲမှု မှတ်တမ်း",
      createdAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      completedAt:
        status === "COMPLETED"
          ? new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : undefined,
    };

    setBatches([newBatch, ...batches]);
    setIsModalOpen(false);
  };

  // Mark In-Progress Batch as Completed
  const handleMarkCompleted = (id: string) => {
    setBatches(
      batches.map((b) =>
        b.id === id
          ? {
              ...b,
              status: "COMPLETED",
              completedAt: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }
          : b
      )
    );
    if (viewingBatch && viewingBatch.id === id) {
      setViewingBatch({
        ...viewingBatch,
        status: "COMPLETED",
        completedAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    }
  };

  const getProcessTypeBadge = (type: ProcessType) => {
    switch (type) {
      case "PADDY_MILLING":
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            စပါးကြိတ်ခွဲခြင်း
          </span>
        );
      case "SEED_CLEANING":
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            သီးနှံသန့်စင်/အဆင့်ခွဲ
          </span>
        );
      case "PULSE_SPLITTING":
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            ပဲခွဲခြမ်းခြင်း
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="relative overflow-hidden py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
          စပါးကြိတ်ခွဲခြင်းနှင့် သီးနှံသန့်စင် ပြုပြင်ထုတ်လုပ်မှု
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          စပါးမှ ဆန်၊ ဆန်ကွဲ၊ ဖွဲနု ကြိတ်ခွဲထုတ်လုပ်ခြင်းနှင့်
          သီးနှံအဆင့်ခွဲသန့်စင်မှု လုပ်ငန်းစဉ်များ စီမံခန့်ခွဲမှု
        </p>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Batches */}
        <div className="bg-card rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              စုစုပေါင်း ထုတ်လုပ်မှုအသုတ်
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
              <Factory size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold text-slate-800 font-mono">
              {totalBatchesCount}{" "}
              <span className="text-xs font-normal text-slate-500">သုတ်</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              လည်ပတ်ဆဲ:{" "}
              <span className="font-bold text-amber-600">
                {runningBatchesCount}
              </span>{" "}
              သုတ်
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>စက်လိုင်းလည်ပတ်မှု</span>
            <span className="text-slate-700 font-bold">
              {runningBatchesCount > 0 ? "လည်ပတ်နေဆဲ" : "ပုံမှန်"}
            </span>
          </div>
        </div>

        {/* Card 2: Total Input Processed */}
        <div className="bg-card rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              သွင်းပြီး ကုန်ကြမ်းအိတ်ပေါင်း
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Wheat size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold text-amber-600 font-mono">
              {totalInputBagsProcessed.toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-500">အိတ်</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              ခန့်မှန်း တင်းရေ: {(totalInputBagsProcessed * 5).toLocaleString()}{" "}
              တင်း
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-amber-600 font-medium">
            <span>ကုန်ကြမ်း သွင်းအားစု</span>
            <span className="font-bold">Raw Input</span>
          </div>
        </div>

        {/* Card 3: Head Rice & Main Product Output */}
        <div className="bg-card rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              ဆန်သန့်/အဆင့်မီ ထွက်ရှိမှု
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold text-emerald-600 font-mono">
              {totalHeadProductBags.toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-500">အိတ်</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              ပျမ်းမျှ အထွက်နှုန်း: {overallAvgRecovery}%
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-600 font-medium">
            <span>အဓိက ကုန်ချောထွက်ရှိမှု</span>
            <span className="font-bold">Head Product</span>
          </div>
        </div>

        {/* Card 4: By-products (Broken Rice & Bran) */}
        <div className="bg-card rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              ဆန်ကွဲနှင့် ဖွဲနု ဘေးထွက်ပစ္စည်း
            </span>
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Boxes size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold text-indigo-600 font-mono">
              {totalByProductBags.toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-500">အိတ်</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              တိရစ္ဆာန်အစာနှင့် ဆီကြိတ်စက်သုံး
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-indigo-600 font-medium">
            <span>ဘေးထွက်ပစ္စည်း စုစုပေါင်း</span>
            <span className="font-bold">By-Products</span>
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
              အားလုံး ({batches.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("PADDY_MILLING")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer ${
                activeTab === "PADDY_MILLING"
                  ? "bg-btn-color text-white border-btn-color"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              စပါးကြိတ်ခွဲမှု (
              {batches.filter((b) => b.processType === "PADDY_MILLING").length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("SEED_CLEANING")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer ${
                activeTab === "SEED_CLEANING"
                  ? "bg-btn-color text-white border-btn-color"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              သီးနှံသန့်စင်/ပဲခွဲခြမ်း (
              {
                batches.filter(
                  (b) =>
                    b.processType === "SEED_CLEANING" ||
                    b.processType === "PULSE_SPLITTING"
                ).length
              }
              )
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("IN_PROGRESS")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer ${
                activeTab === "IN_PROGRESS"
                  ? "bg-btn-color text-white border-btn-color"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              လည်ပတ်ဆဲ (
              {batches.filter((b) => b.status === "IN_PROGRESS").length})
            </button>
          </div>

          <div className="text-xs font-medium text-slate-500 self-end sm:self-auto">
            လက်ရှိဖော်ပြစာရင်း:{" "}
            <span className="font-bold text-slate-700">
              {filteredBatches.length}
            </span>{" "}
            သုတ်
          </div>
        </div>

        {/* Card Container: Search, Status Filter Popover, New Milling Action */}
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
                placeholder="အသုတ်နံပါတ်၊ Lot နံပါတ်၊ သီးနှံ၊ စက်လိုင်း၊ တာဝန်ခံ ရှာရန်..."
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

            {/* Status Filter Popover */}
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
                className={`w-full sm:w-auto px-3.5 py-2 rounded-full border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                  selectedStatusFilter !== "ALL"
                    ? "bg-slate-100 border-[#547a95] text-slate-800"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Filter size={14} />
                <span>
                  {selectedStatusFilter === "ALL"
                    ? "အခြေအနေ အားလုံး"
                    : selectedStatusFilter === "IN_PROGRESS"
                    ? "လည်ပတ်ဆဲ"
                    : "ပြီးစီး"}
                </span>
              </button>

              {isStatusFilterOpen && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl z-20 py-1.5 text-xs font-medium">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    အခြေအနေ စစ်ထုတ်ရန်
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStatusFilter("ALL");
                      setIsStatusFilterOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 cursor-pointer ${
                      selectedStatusFilter === "ALL"
                        ? "font-bold text-btn-color bg-slate-50"
                        : "text-slate-700"
                    }`}
                  >
                    အခြေအနေ အားလုံး
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStatusFilter("IN_PROGRESS");
                      setIsStatusFilterOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 cursor-pointer ${
                      selectedStatusFilter === "IN_PROGRESS"
                        ? "font-bold text-btn-color bg-slate-50"
                        : "text-slate-700"
                    }`}
                  >
                    လည်ပတ်ဆဲ (In-Progress)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStatusFilter("COMPLETED");
                      setIsStatusFilterOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 cursor-pointer ${
                      selectedStatusFilter === "COMPLETED"
                        ? "font-bold text-btn-color bg-slate-50"
                        : "text-slate-700"
                    }`}
                  >
                    ပြီးစီးပြီး (Completed)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action: New Batch Button */}
          <button
            type="button"
            onClick={handleOpenNewBatchModal}
            className="px-4 py-2 bg-btn-color hover:bg-btn-hover text-white rounded-full text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Plus size={16} />
            <span>ကြိတ်ခွဲထုတ်လုပ်မှု အသစ်စတင်မည်</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Responsive Dual View */}
      {filteredBatches.length === 0 ? (
        <div className="bg-card rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Factory size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-700">
            ထုတ်လုပ်မှု မှတ်တမ်း ရှာမတွေ့ပါ
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            ရှာဖွေမှုစကားလုံး (သို့မဟုတ်) စစ်ထုတ်ထားမှုများကို ပြန်လည်စစ်ဆေးပါ
          </p>
        </div>
      ) : (
        <>
          {/* Mobile & Tablet Card View (< lg) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 lg:hidden">
            {filteredBatches.map((b) => (
              <div
                key={b.id}
                onClick={() => setViewingBatch(b)}
                className="bg-card rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 cursor-pointer hover:border-slate-300"
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {b.batchNo}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({b.date})
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5">
                      {b.rawMaterialName}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      Lot:{" "}
                      <span className="font-mono font-semibold">
                        {b.sourceLotNo}
                      </span>{" "}
                      ({b.ownerName})
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {b.status === "IN_PROGRESS" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock size={11} />
                        လည်ပတ်ဆဲ
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={11} />
                        ပြီးစီး
                      </span>
                    )}
                    {getProcessTypeBadge(b.processType)}
                  </div>
                </div>

                {/* Machine line & Moisture */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <Factory size={13} className="text-slate-400" />
                    <span>{b.machineLine}</span>
                  </div>
                  <span className="text-slate-500 text-[11px]">
                    အစိုဓာတ်:{" "}
                    <span className="font-mono font-bold text-slate-700">
                      {b.moisturePercent}%
                    </span>
                  </span>
                </div>

                {/* Production Metrics Strip */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <div className="text-[10px] text-slate-400 font-medium">
                      သွင်းကုန်ကြမ်း
                    </div>
                    <div className="font-mono font-bold text-slate-700">
                      {b.inputBags} အိတ်
                    </div>
                    <div className="font-mono text-[10px] text-slate-400">
                      {b.inputBaskets} တင်း
                    </div>
                  </div>
                  <div className="bg-emerald-50 p-2 rounded-xl text-emerald-800">
                    <div className="text-[10px] opacity-80 font-medium">
                      ဆန်သန့်/ကုန်ချော
                    </div>
                    <div className="font-mono font-bold">
                      {b.outputs.find((o) => o.category === "HEAD_PRODUCT")
                        ?.bags || 0}{" "}
                      အိတ်
                    </div>
                    <div className="font-mono text-[10px] font-bold text-emerald-600">
                      နှုန်း: {b.recoveryRatePercent}%
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <div className="text-[10px] text-slate-400 font-medium">
                      ဆန်ကွဲ+ဖွဲနု
                    </div>
                    <div className="font-mono font-bold text-slate-700">
                      {b.outputs
                        .filter(
                          (o) =>
                            o.category === "BROKEN_PRODUCT" ||
                            o.category === "BY_PRODUCT"
                        )
                        .reduce((sum, o) => sum + o.bags, 0)}{" "}
                      အိတ်
                    </div>
                    <div className="font-mono text-[10px] text-slate-400">
                      By-product
                    </div>
                  </div>
                </div>

                {/* Footer Fee & Operator */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div>
                    ကြိတ်ခ:{" "}
                    <span className="font-mono font-bold text-slate-800">
                      {b.totalMillingFee.toLocaleString()}
                    </span>{" "}
                    ကျပ်
                  </div>
                  <div className="flex items-center gap-1 font-medium text-slate-700">
                    <UserCheck size={12} className="text-slate-400" />
                    <span>{b.operatorInCharge.split(" ")[0]}</span>
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
                    <th className="py-3 px-4">အသုတ်နံပါတ် / ရက်စွဲ</th>
                    <th className="py-3 px-4">လုပ်ငန်းစဉ် & စက်လိုင်း</th>
                    <th className="py-3 px-4">ကုန်ကြမ်း Lot & ပိုင်ရှင်</th>
                    <th className="py-3 px-4 text-right">သွင်းကုန်ကြမ်း</th>
                    <th className="py-3 px-4 text-right">ဆန်သန့်/ကုန်ချော</th>
                    <th className="py-3 px-4 text-right">အထွက်နှုန်း %</th>
                    <th className="py-3 px-4 text-right">ကြိတ်ခွဲခ (ကျပ်)</th>
                    <th className="py-3 px-4 text-center">အခြေအနေ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredBatches.map((b) => (
                    <tr
                      key={b.id}
                      onClick={() => setViewingBatch(b)}
                      className="hover:bg-slate-50/70 cursor-pointer"
                    >
                      {/* Batch & Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-800">
                          {b.batchNo}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {b.date} ({b.createdAt})
                        </div>
                      </td>

                      {/* Process & Machine */}
                      <td className="py-3.5 px-4">
                        <div className="mb-1">
                          {getProcessTypeBadge(b.processType)}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                          <Factory size={11} className="text-slate-400" />
                          <span>{b.machineLine}</span>
                        </div>
                      </td>

                      {/* Raw Lot & Owner */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">
                          {b.rawMaterialName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {b.sourceLotNo} •{" "}
                          <span className="font-sans font-medium">
                            {b.ownerName}
                          </span>
                        </div>
                      </td>

                      {/* Raw Input */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-mono font-bold text-slate-800">
                          {b.inputBags} အိတ်
                        </div>
                        <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                          {b.inputBaskets} တင်း ({b.moisturePercent}% စို)
                        </div>
                      </td>

                      {/* Head Product */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-mono font-bold text-emerald-700">
                          {b.outputs.find((o) => o.category === "HEAD_PRODUCT")
                            ?.bags || 0}{" "}
                          အိတ်
                        </div>
                        <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                          {(
                            b.outputs.find((o) => o.category === "HEAD_PRODUCT")
                              ?.weightViss || 0
                          ).toLocaleString()}{" "}
                          ပိဿာ
                        </div>
                      </td>

                      {/* Recovery Rate */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                          {b.recoveryRatePercent}%
                        </span>
                      </td>

                      {/* Milling Fee */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-mono font-bold text-slate-800">
                          {b.totalMillingFee.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {b.feePayer === "FARMER"
                            ? "တောင်သူကျခံ"
                            : "ပွဲရုံကျခံ"}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {b.status === "IN_PROGRESS" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock size={11} />
                            လည်ပတ်ဆဲ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={11} />
                            ပြီးစီး
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* MODAL: Start New Milling Batch */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-card w-full max-w-3xl rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xl max-h-[92vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-btn-color text-white flex items-center justify-center font-bold">
                  <Factory size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    ကြိတ်ခွဲထုတ်လုပ်မှု အသုတ်သစ် စတင်ခြင်း
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    စပါးကြိတ်ခွဲခြင်း၊ ပဲသန့်စင်အဆင့်ခွဲခြင်းနှင့်
                    ပဲခွဲခြမ်းခြင်း လုပ်ငန်းမှတ်တမ်း
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
              onSubmit={handleSubmitBatch}
              className="mt-4 space-y-4 text-xs font-semibold"
            >
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Process Type Switcher */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                  လုပ်ငန်းစဉ် အမျိုးအစား ရွေးချယ်ပါ *
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setProcessType("PADDY_MILLING");
                      setMachineLine("စက်လိုင်း (၁) - ရွှေဝါလင်း");
                      setMillingFeePerBag(3000);
                      setHeadRiceBags(26);
                      setBrokenRiceBags(6);
                      setBranBags(8);
                    }}
                    className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                      processType === "PADDY_MILLING"
                        ? "bg-amber-700 text-white shadow-xs"
                        : "text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Wheat size={14} />
                    <span>၁။ စပါးကြိတ်ခွဲခြင်း</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProcessType("SEED_CLEANING");
                      setMachineLine("သန့်စင်စက်လိုင်း (A)");
                      setMillingFeePerBag(2000);
                      setHeadRiceBags(40);
                      setBrokenRiceBags(5);
                      setBranBags(0);
                    }}
                    className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                      processType === "SEED_CLEANING"
                        ? "bg-emerald-700 text-white shadow-xs"
                        : "text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Sparkles size={14} />
                    <span>၂။ သီးနှံသန့်စင်/အဆင့်ခွဲ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProcessType("PULSE_SPLITTING");
                      setMachineLine("ပဲခြမ်းစက်လိုင်း (B)");
                      setMillingFeePerBag(2500);
                      setHeadRiceBags(38);
                      setBrokenRiceBags(0);
                      setBranBags(10);
                    }}
                    className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                      processType === "PULSE_SPLITTING"
                        ? "bg-indigo-700 text-white shadow-xs"
                        : "text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Boxes size={14} />
                    <span>၃။ ပဲခွဲခြမ်းခြင်း</span>
                  </button>
                </div>
              </div>

              {/* Section 1: Raw Material Input Details */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Wheat size={14} className="text-[#547a95]" />
                  <span>၁။ အသွင်းကုန်ကြမ်း ရွေးချယ်ခြင်း</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Select Raw Lot */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      ကုန်ကြမ်း Lot ရွေးချယ်ပါ *
                    </label>
                    <select
                      value={selectedRawLotId}
                      onChange={(e) => setSelectedRawLotId(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white cursor-pointer"
                    >
                      {rawLots.map((lot) => (
                        <option key={lot.id} value={lot.id}>
                          [{lot.lotNo}] {lot.commodityName} - {lot.ownerName} (
                          {lot.warehouseName}) - လက်ကျန်: {lot.availableBags}{" "}
                          အိတ်
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Machine Line */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      ကြိတ်ခွဲမည့် စက်လိုင်း *
                    </label>
                    <input
                      type="text"
                      value={machineLine}
                      onChange={(e) => setMachineLine(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                      placeholder="ဥပမာ- စက်လိုင်း (၁) - ရွှေဝါလင်း"
                      required
                    />
                  </div>
                </div>

                {/* Input Bags, Moisture % */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      ကြိတ်ခွဲမည့် အိတ်အရေအတွက် *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max={selectedLot?.availableBags}
                        value={inputBags}
                        onChange={(e) =>
                          setInputBags(
                            e.target.value === ""
                              ? ""
                              : Math.max(0, parseInt(e.target.value) || 0)
                          )
                        }
                        className="w-full text-xs font-bold font-mono p-2.5 pr-12 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                        placeholder="0"
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none">
                        အိတ်
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      ခန့်မှန်း တင်းရေ
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={`${numericInputBaskets.toLocaleString()} တင်း`}
                      className="w-full text-xs font-bold font-mono p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      အစိုဓာတ် ရာခိုင်နှုန်း (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={moisturePercent}
                        onChange={(e) =>
                          setMoisturePercent(
                            e.target.value === ""
                              ? ""
                              : parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full text-xs font-bold font-mono p-2.5 pr-8 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                        placeholder="13.0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none">
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Expected Output Products & Yield Estimation */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Sparkles size={14} className="text-[#547a95]" />
                  <span>
                    ၂။ ကုန်ချောထွက်ရှိမှုနှင့် ဘေးထွက်ပစ္စည်း ခန့်မှန်းချက်
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      {processType === "PADDY_MILLING"
                        ? "ဆန်သန့်/ဆန်ချော (Head Rice)"
                        : "အဆင့်မီ ကုန်ချော (အိတ်)"}{" "}
                      *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={headRiceBags}
                        onChange={(e) =>
                          setHeadRiceBags(
                            e.target.value === ""
                              ? ""
                              : Math.max(0, parseInt(e.target.value) || 0)
                          )
                        }
                        className="w-full text-xs font-bold font-mono p-2.5 pr-12 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                        placeholder="0"
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none">
                        အိတ်
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      {processType === "PADDY_MILLING"
                        ? "ဆန်ကွဲ (Broken Rice)"
                        : "အစေ့သေး/အောက်စ (အိတ်)"}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={brokenRiceBags}
                        onChange={(e) =>
                          setBrokenRiceBags(
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
                      {processType === "PADDY_MILLING"
                        ? "ဖွဲနု / ဖွဲကြမ်း (Rice Bran)"
                        : "ပဲဖွဲ/အခြား (အိတ်)"}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={branBags}
                        onChange={(e) =>
                          setBranBags(
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
                </div>

                {/* Warehouse Location Allocation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      ကုန်ချော သိုလှောင်မည့် ဂိုဒေါင် *
                    </label>
                    <select
                      value={targetWarehouse}
                      onChange={(e) => setTargetWarehouse(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white cursor-pointer"
                    >
                      <option value="ဂိုဒေါင် အမှတ် (၁)">
                        ဂိုဒေါင် အမှတ် (၁) - ဆန်သန့်ဂိုဒေါင်
                      </option>
                      <option value="ဂိုဒေါင် အမှတ် (၂)">
                        ဂိုဒေါင် အမှတ် (၂) - ပဲနှင့်သီးနှံစုံဂိုဒေါင်
                      </option>
                      <option value="ဂိုဒေါင် အမှတ် (၃)">
                        ဂိုဒေါင် အမှတ် (၃) - စပါးဂိုဒေါင်
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      နေရာ / အကွက် (Bay / Zone) *
                    </label>
                    <input
                      type="text"
                      value={targetBay}
                      onChange={(e) => setTargetBay(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                      placeholder="ဥပမာ- Zone A-02"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Financials & Operator */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Scale size={14} className="text-[#547a95]" />
                  <span>၃။ ကြိတ်ခွဲခနှင့် ကြီးကြပ်သူ</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      ၁ အိတ် ကြိတ်ခွဲခ (ကျပ်)
                    </label>
                    <input
                      type="number"
                      value={millingFeePerBag}
                      onChange={(e) =>
                        setMillingFeePerBag(
                          e.target.value === ""
                            ? ""
                            : Math.max(0, parseInt(e.target.value) || 0)
                        )
                      }
                      className="w-full text-xs font-bold font-mono p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                      placeholder="3000"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      စုစုပေါင်း ကြိတ်ခွဲခ
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={`${totalCalculatedFee.toLocaleString()} ကျပ်`}
                      className="w-full text-xs font-bold font-mono p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      စက်ရုံမှူး / တာဝန်ခံ *
                    </label>
                    <input
                      type="text"
                      value={operatorInCharge}
                      onChange={(e) => setOperatorInCharge(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                      placeholder="ဥပမာ- ဦးကျော်ဆန်း"
                      required
                    />
                  </div>
                </div>

                {/* Status Switcher & Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      စတင်မှု အခြေအနေ *
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setStatus("IN_PROGRESS")}
                        className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                          status === "IN_PROGRESS"
                            ? "bg-amber-700 text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-700"
                        }`}
                      >
                        <Clock size={14} />
                        <span>လည်ပတ်ဆဲထားမည်</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus("COMPLETED")}
                        className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                          status === "COMPLETED"
                            ? "bg-emerald-700 text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-700"
                        }`}
                      >
                        <CheckCircle2 size={14} />
                        <span>တန်းပြီးစီးမည်</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      မှတ်ချက်
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="စက်ကြိတ်ခွဲမှုဆိုင်ရာ မှတ်ချက်..."
                      className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#547a95] bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Summary Strip */}
              <div className="p-3.5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block font-semibold">
                    ခန့်မှန်း အထွက်နှုန်း (Recovery Rate)
                  </span>
                  <span className="text-base font-bold font-mono text-emerald-700">
                    {estimatedRecoveryRate}%
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-semibold">
                    စုစုပေါင်း ကုန်ချောထွက်ရှိမှု
                  </span>
                  <span className="text-sm font-bold font-mono text-slate-800">
                    {numHead + numBroken + numBran} အိတ်
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-semibold">
                    ကျသင့်ငွေ စုစုပေါင်း
                  </span>
                  <span className="text-sm font-bold font-mono text-slate-800">
                    {totalCalculatedFee.toLocaleString()} ကျပ်
                  </span>
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
                  <span>ကြိတ်ခွဲထုတ်လုပ်မှု အတည်ပြုသိမ်းဆည်းမည်</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL: View Batch Record */}
      {viewingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-card w-full max-w-2xl rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Factory className="text-[#547a95]" size={18} />
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    ကြိတ်ခွဲထုတ်လုပ်မှု အသေးစိတ်မှတ်တမ်း
                  </h3>
                  <span className="font-mono text-xs text-slate-500">
                    {viewingBatch.batchNo}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingBatch(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Batch Info */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">
                    ရက်စွဲနှင့် အချိန်
                  </span>
                  <span className="font-mono font-bold text-slate-700">
                    {viewingBatch.date} ({viewingBatch.createdAt})
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">
                    လုပ်ငန်းစဉ်
                  </span>
                  <div className="mt-0.5">
                    {getProcessTypeBadge(viewingBatch.processType)}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">
                    အခြေအနေ
                  </span>
                  <div className="mt-0.5">
                    {viewingBatch.status === "IN_PROGRESS" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock size={11} /> လည်ပတ်ဆဲ
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={11} /> ပြီးစီး (
                        {viewingBatch.completedAt})
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">
                    စက်လိုင်း
                  </span>
                  <span className="font-bold text-slate-800">
                    {viewingBatch.machineLine}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">
                    စက်ရုံမှူး / တာဝန်ခံ
                  </span>
                  <span className="font-bold text-slate-800">
                    {viewingBatch.operatorInCharge}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">
                    အထွက်နှုန်း (Yield %)
                  </span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    {viewingBatch.recoveryRatePercent}%
                  </span>
                </div>
              </div>

              {/* Raw Input vs Output */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-800">
                    ကုန်ကြမ်း အသွင်းအချက်အလက်
                  </span>
                  <span className="font-mono text-slate-500 font-semibold">
                    {viewingBatch.sourceLotNo}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-medium">
                      သီးနှံအမည်
                    </span>
                    <span className="font-bold text-slate-800">
                      {viewingBatch.rawMaterialName}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-medium">
                      ပိုင်ဆိုင်မှု
                    </span>
                    <span className="font-bold text-slate-800">
                      {viewingBatch.ownerName}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-medium">
                      အိတ်ရေ / တင်းရေ
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {viewingBatch.inputBags} အိတ် ({viewingBatch.inputBaskets}{" "}
                      တင်း)
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-medium">
                      အစိုဓာတ်
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {viewingBatch.moisturePercent}%
                    </span>
                  </div>
                </div>

                {/* Outputs List Table */}
                <div className="pt-2">
                  <span className="font-bold text-slate-800 block mb-2">
                    ထွက်ရှိသည့် ကုန်ချောနှင့် ဘေးထွက်ပစ္စည်းများ
                  </span>
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                    {viewingBatch.outputs.map((out, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 flex items-center justify-between bg-slate-50/50"
                      >
                        <div>
                          <div className="font-bold text-slate-800">
                            {out.productName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            {out.warehouseName} ({out.bayLocation})
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-slate-800">
                            {out.bags} အိတ်
                          </div>
                          <div className="font-mono text-[10px] text-slate-400">
                            {out.weightViss.toLocaleString()} ပိဿာ
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Financials & Notes */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="text-slate-500 font-medium block">
                    ကြိတ်ခွဲခ ရှင်းတမ်း
                  </span>
                  <div className="font-mono font-bold text-slate-800 text-sm">
                    {viewingBatch.totalMillingFee.toLocaleString()} ကျပ်{" "}
                    <span className="text-xs font-normal text-slate-500">
                      (
                      {viewingBatch.feePayer === "FARMER"
                        ? "တောင်သူ့ရှင်းတမ်းမှနုတ်ယူမည်"
                        : "ပွဲရုံပိုင်ကျခံ"}
                      )
                    </span>
                  </div>
                </div>

                {viewingBatch.status === "IN_PROGRESS" && (
                  <button
                    type="button"
                    onClick={() => handleMarkCompleted(viewingBatch.id)}
                    className="px-4 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold cursor-pointer text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 size={14} />
                    <span>ကြိတ်ခွဲမှု ပြီးစီးကြောင်း သတ်မှတ်မည်</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewingBatch(null)}
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

export default PaddyMillingReprocessing;
