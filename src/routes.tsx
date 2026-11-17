import { createBrowserRouter } from "react-router";
import Error from "./pages/Error";
import { Home } from "./pages/Home";
import { RootLayout } from "./pages/RootLayout";
import { SystemSettings } from "./pages/SystemSettings";
import { Partners } from "./pages/Partners";
import { CashAdvances } from "./pages/CashAdvances";
import { InwardGoodsReceipts } from "./pages/InwardGoodsReceipts";
import SalesInvoices from "./pages/SalesInvoices";
import FarmerSettlements from "./pages/FarmerSettlements";
import DailyMarketRates from "./pages/DailyMarketRates";
import WarehouseInventory from "./pages/WarehouseInventory";
import StockAdjustments from "./pages/StockAdjustments";
import PaddyMillingReprocessing from "./pages/PaddyMillingReprocessing";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "settings",
        element: <SystemSettings />,
      },
      {
        path: "partners",
        element: <Partners />,
      },
      {
        path: "advances",
        element: <CashAdvances />,
      },
      {
        path: "purchase",
        element: <InwardGoodsReceipts />,
      },
      {
        path: "sales",
        element: <SalesInvoices />,
      },
      {
        path: "settlement",
        element: <FarmerSettlements />,
      },
      {
        path: "prices",
        element: <DailyMarketRates />,
      },
      {
        path: "stock",
        element: <WarehouseInventory />,
      },
      {
        path: "adjustments",
        element: <StockAdjustments />,
      },
      {
        path: "milling",
        element: <PaddyMillingReprocessing />,
      },
    ],
  },
]);
