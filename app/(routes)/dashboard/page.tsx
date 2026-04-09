"use client";

import { useState, useEffect } from "react";
import { DashboardCards } from "@/components/ui/dashboard-cards";
import { StatusPieChart } from "@/components/ui/dashboard-piechart";
import { DispositionBarChart } from "@/components/ui/dashboard-barchart";
import { fetchDashboardData } from "@/lib/fetchers/dashboard/dashboard";
import AppCombobox from "@/components/ui/app-combobox";

interface AssetType {
  asset_type_id: number;
  type_name: string;
}

export default function DashboardPage() {
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  // AppCombobox states
  const [filterText, setFilterText] = useState("");
  const [comboboxOpen, setComboboxOpen] = useState(false);

  // Fetch all asset types for the combobox
  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => setAssetTypes(data.allAssetTypes))
      .catch((err) => console.error(err));
  }, []);

  // Fetch dashboard data whenever asset type changes
  useEffect(() => {
    const assetTypeId = selectedAssetType?.asset_type_id;
    fetchDashboardData(assetTypeId)
      .then((data) => setDashboardData(data))
      .catch((err) => console.error(err));
  }, [selectedAssetType]);

  if (!dashboardData) return <div>Loading dashboard...</div>;

  // Prepare data for pie chart
  const pieData = [
    { name: "In Use", value: dashboardData.statusBreakdown.inUse },
    { name: "Retired", value: dashboardData.statusBreakdown.retired },
    { name: "Disposed", value: dashboardData.statusBreakdown.disposed },
  ];

  // Prepare data for stacked bar chart
  const barData = [
    {
      status: "Assets",
      none: dashboardData.dispositionBreakdown.none,
      approved: dashboardData.dispositionBreakdown.approved_for_disposal,
      inTransit: dashboardData.dispositionBreakdown.in_transit,
      complete: dashboardData.dispositionBreakdown.complete,
      scheduled: dashboardData.dispositionBreakdown.scheduled_for_pickup,
    },
  ];

  // Transform asset types into AppCombobox options
  const assetTypeOptions = assetTypes.map((a) => ({
    value: a.asset_type_id.toString(),
    label: a.type_name,
  }));

  // Current selected value for AppCombobox
  const selectedValue = selectedAssetType ? selectedAssetType.asset_type_id.toString() : "";

  return (
    <div className="page relative">
      <h1 className="page-header">Dashboard</h1>
      <div className="flex-1 flex flex-col space-y-10 mt-2 bg-white rounded-xl shadow-lg p-6">
        <div className="p-4 space-y-8">
          {/* AppCombobox filter */}
          <AppCombobox
            options={assetTypeOptions}
            value={selectedValue}
            onChange={(val:any) => {
              const found = assetTypes.find((a) => a.asset_type_id.toString() === val);
              setSelectedAssetType(found || null);
            }}
            placeholder="Select Asset Type"
            filter={filterText}
            setFilter={setFilterText}
            open={comboboxOpen}
            setOpen={setComboboxOpen}
          />

          {/* Dashboard Cards */}
          <DashboardCards
            totalAssets={dashboardData.totalAssets}
            statusBreakdown={dashboardData.statusBreakdown}
            lifecycleCounts={dashboardData.lifecycleCounts}
          />

          {/* Charts */}
          <div className="flex justify-center flex-col lg:flex-row gap-15">
            <StatusPieChart data={pieData} />
            <DispositionBarChart data={barData} />
          </div>
        </div>
      </div>
    </div>
  );
}