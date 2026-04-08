"use client";

import { useState, useEffect, useRef } from "react";
import { DashboardCards } from "@/components/ui/dashboard-cards";
import { StatusPieChart } from "@/components/ui/dashboard-piechart";
import { DispositionBarChart } from "@/components/ui/dashboard-barchart";
import { fetchDashboardData } from "@/lib/fetchers/dashboard/dashboard";
import { Combobox, ComboboxInput, ComboboxList, ComboboxItem, ComboboxContent } from "@/components/ui/combobox";

interface AssetType {
  asset_type_id: number;
  type_name: string;
}

export default function DashboardPage() {
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [filterText, setFilterText] = useState("");
  const comboboxRef = useRef<HTMLInputElement>(null);

  // Fetch all asset types for the combobox
  useEffect(() => {
    fetch("/api/dashboard")
      .then(res => res.json())
      .then(data => setAssetTypes(data.allAssetTypes))
      .catch(err => console.error(err));
  }, []);

  // Fetch dashboard data whenever asset type changes
  useEffect(() => {
    const assetTypeId = selectedAssetType?.asset_type_id;
    fetchDashboardData(assetTypeId)
      .then(data => setDashboardData(data))
      .catch(err => console.error(err));
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

  return (
    <div className="page relative">
      <h1 className="page-header">Dashboard</h1>
      <div className="flex-1 flex flex-col space-y-10 mt-2 bg-white rounded-xl shadow-lg p-6">
        <div className="p-4 space-y-8">
          {/* Combobox filter */}
          <Combobox
            value={selectedAssetType?.type_name || ""}
            onValueChange={(val) => {
              const found = assetTypes.find((a) => a.type_name === val);
              setSelectedAssetType(found || null); // null clears filter
              comboboxRef.current?.blur();
            }}
          >
            <ComboboxInput
              ref={comboboxRef}
              placeholder="Select Asset Type"
              onChange={(e) => setFilterText(e.target.value)}
              showClear
            />
            <ComboboxContent>
              <ComboboxList>
                {assetTypes
                  .filter((a) => a.type_name.toLowerCase().includes(filterText.toLowerCase()))
                  .map((a) => (
                    <ComboboxItem key={a.asset_type_id} value={a.type_name}>
                      {a.type_name}
                    </ComboboxItem>
                  ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>

          {/* Dashboard Cards */}
          <DashboardCards
            totalAssets={dashboardData.totalAssets}
            statusBreakdown={dashboardData.statusBreakdown}
            lifecycleCounts={dashboardData.lifecycleCounts} // pass lifecycle counts
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