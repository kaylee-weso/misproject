"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  fetchOrderAssets,
  fetchOrderWorkflowFields,
  scheduleOrderRequest,
  confirmAssetTransferRequest,
  completeOrderRequest,
} from "@/lib/fetchers/orderform/orderform";

import { Button } from "@/components/ui/button";
import Table from "@/components/ui/table";
import { useServerTable, Column } from "@/lib/hooks/useServerTable";

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";

import { TextInput } from "@/components/ui/textinput";
import AppCombobox from "@/components/ui/app-combobox";
import { DatePickerInput2 } from "@/components/ui/datepickerinput2";
import { ScrollArea } from "@/components/ui/scroll-area";
import MapComponent from "@/components/map/map";
import { getFirstIncompleteStep } from "@/lib/service/normalizeOrder";

type Props = {
  orderId: number | null;
  formData: any;
  setFormData: (data: any) => void;
  initialStep: number;
};

export default function OrderWorkflow({
  orderId,
  formData,
  setFormData,
  initialStep,
}: Props) {
  const router = useRouter();

  // -------------------------
  // STEP STATE (controlled, not reactive to form typing)
  // -------------------------
  const [stepState, setStepState] = useState<number>(initialStep || 1);

  const [custodyConfirmed, setCustodyConfirmed] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [workflowFields, setWorkflowFields] = useState<{ facilities: any[] }>({
    facilities: [],
  });

  const [loadingFields, setLoadingFields] = useState(true);

  const [companyFilter, setCompanyFilter] = useState("");
  const [companyOpen, setCompanyOpen] = useState(false);

  const [addressFilter, setAddressFilter] = useState("");
  const [addressOpen, setAddressOpen] = useState(false);

  // -------------------------
  // Load workflow fields
  // -------------------------
  useEffect(() => {
    if (!orderId) return;

    const loadFields = async () => {
      try {
        const data = await fetchOrderWorkflowFields(orderId);
        setWorkflowFields({ facilities: data.facilities || [] });
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingFields(false);
      }
    };

    loadFields();
  }, [orderId]);

  // -------------------------
  // SAFE INITIAL STEP LOAD (only once)
  // -------------------------
  useEffect(() => {
    if (!orderId) return;
    setStepState(getFirstIncompleteStep(formData));
  }, [orderId]); // 👈 IMPORTANT: NOT formData

  // -------------------------
  // TABLE
  // -------------------------
  const fetchAssetsTable = async ({
    filters,
    sortKey,
    sortDirection,
  }: any) => {
    if (!orderId) return { data: [], total: 0, filterOptions: {} };

    const res = await fetchOrderAssets({
      orderId,
      filters,
      sortKey,
      sortDirection,
    });

    return {
      data: res.data,
      total: Array.isArray(res.data) ? res.data.length : 0,
      filterOptions: res.filterOptions ?? {},
    };
  };

  const {
    data: assets,
    filters,
    setFilters,
    sortKey,
    setSortKey,
    sortDirection,
    setSortDirection,
    clearAll,
  } = useServerTable({
    endpoint: fetchAssetsTable,
    columns: [],
    limit: 1000,
    deps: [orderId],
    disablePagination: true,
  });

  const assetColumns: Column[] = [
    { key: "serial_number", label: "Serial Number", sortable: true },
    { key: "asset_name", label: "Asset Name", sortable: true },
    { key: "type_name", label: "Type", sortable: true },
  ];

  // -------------------------
  // CONDITIONS
  // -------------------------
  const canSchedule =
    formData.company &&
    formData.address &&
    formData.scheduledPickupDate;

  const canConfirm =
    formData.actualPickupDate &&
    formData.vendorOrderId &&
    formData.pickupContact &&
    custodyConfirmed;

  const canComplete = orderCompleted && pdfFile;

  // -------------------------
  // HANDLERS (ONLY place step changes happen)
  // -------------------------
  const handleSchedule = async () => {
    if (!canSchedule || !orderId) return;
    if (!window.confirm("Schedule pickup?")) return;

    try {
      await scheduleOrderRequest(
        orderId,
        assets,
        1,
        formData.scheduledPickupDate,
        formData.address
      );

      setStepState(2); // ✅ manual progression
    } catch (err) {
      console.error(err);
      alert("Failed to schedule pickup.");
    }
  };

  const handleConfirm = async () => {
    if (!canConfirm || !orderId) return;
    if (!window.confirm("Confirm transfer?")) return;

    try {
      await confirmAssetTransferRequest(
        orderId,
        assets,
        1,
        formData.actualPickupDate,
        formData.vendorOrderId,
        formData.pickupContact,
        formData.notes
      );

      setStepState(3); // ✅ manual progression
    } catch (err) {
      console.error(err);
      alert("Failed to confirm transfer.");
    }
  };

  const handleComplete = async () => {
    if (!canComplete || !orderId) return;
    if (!window.confirm("Complete order?")) return;

    try {
      const completedDate = new Date().toISOString();

      await completeOrderRequest(
        orderId,
        assets,
        1,
        completedDate,
        formData.certificateReceived
      );

      setStepState(4);

      alert("Order completed!");
      router.push("/orderform");
    } catch (err) {
      console.error(err);
      alert("Failed to complete order.");
    }
  };

  if (!orderId) return <p>Loading order...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">

      {/* TABLE */}
      <FieldSet>
        <FieldLegend>Order Assets</FieldLegend>

        <ScrollArea className="h-[300px]">
          <Table
            columns={assetColumns}
            data={assets}
            filters={filters}
            globalFilterOptions={{}}   // ✅ FIXED
            onFilterChange={setFilters}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortChange={(key) => {
              if (sortKey === key) {
                setSortDirection(sortDirection === "asc" ? "desc" : "asc");
              } else {
                setSortKey(key);
                setSortDirection("asc");
              }
            }}
            rowKey="asset_id"
          />
        </ScrollArea>
      </FieldSet>

      <FieldSeparator />

      {/* STEP 1 */}
      <div className={stepState > 1 ? "opacity-50 pointer-events-none" : ""}>
        <FieldSet>
          <FieldLegend>Scheduled Pickup</FieldLegend>

          <Field>
            <FieldLabel>Company</FieldLabel>
            <AppCombobox
              options={[...new Set(workflowFields.facilities.map(f => f.Company))].map(c => ({
                value: c,
                label: c,
              }))}
              value={formData.company || ""}
              onChange={(val) =>
                setFormData({ ...formData, company: val, address: "" })
              }
              placeholder="Company"
              filter={companyFilter}
              setFilter={setCompanyFilter}
              open={companyOpen}
              setOpen={setCompanyOpen}
            />
          </Field>

          <Field>
            <FieldLabel>Address</FieldLabel>
            <AppCombobox
              options={workflowFields.facilities
                .filter(f => f.Company === formData.company)
                .map(f => ({
                  value: f.facility_id,
                  label: f.Full_Address,
                }))}
              value={formData.address || ""}
              onChange={(val) =>
                setFormData({ ...formData, address: val })
              }
              placeholder="Address"
              disabled={!formData.company}
              filter={addressFilter}
              setFilter={setAddressFilter}
              open={addressOpen}
              setOpen={setAddressOpen}
            />
          </Field>

          <Field>
            <FieldLabel>Pickup Date</FieldLabel>
            <DatePickerInput2
              value={formData.scheduledPickupDate || ""}
              onChange={(v) =>
                setFormData({
                  ...formData,
                  scheduledPickupDate: v,
                })
              }
            />
          </Field>

          <Button onClick={handleSchedule} disabled={!canSchedule}>
            Schedule
          </Button>
        </FieldSet>
      </div>

      <FieldSeparator />

      {/* STEP 2 */}
      <div className={stepState > 2 ? "opacity-50 pointer-events-none" : ""}>
        <FieldSet>
          <FieldLegend>Confirm Transfer</FieldLegend>

          <Field>
            <FieldLabel>Actual Pickup Date</FieldLabel>
            <DatePickerInput2
              value={formData.actualPickupDate || ""}
              onChange={(v) =>
                setFormData({ ...formData, actualPickupDate: v })
              }
            />
          </Field>

          <Field>
            <FieldLabel>Vendor Order ID</FieldLabel>
            <TextInput
              value={formData.vendorOrderId || ""}
              onChange={(v) =>
                setFormData({ ...formData, vendorOrderId: v })
              }
            />
          </Field>

          <Field>
            <FieldLabel>Pickup Contact</FieldLabel>
            <TextInput
              value={formData.pickupContact || ""}
              onChange={(v) =>
                setFormData({ ...formData, pickupContact: v })
              }
            />
          </Field>

          <label>
            <input
              type="checkbox"
              checked={custodyConfirmed}
              onChange={(e) => setCustodyConfirmed(e.target.checked)}
            />
            Confirm custody transfer
          </label>

          <Button onClick={handleConfirm} disabled={!canConfirm}>
            Confirm
          </Button>
        </FieldSet>
      </div>

      <FieldSeparator />

      {/* STEP 3 */}
      <div className={stepState > 3 ? "opacity-50 pointer-events-none" : ""}>
        <FieldSet>
          <FieldLegend>Complete</FieldLegend>

          <label>
            <input
              type="checkbox"
              checked={orderCompleted}
              onChange={(e) => setOrderCompleted(e.target.checked)}
            />
            Recycling completed
          </label>

          <input
            type="file"
            accept="application/pdf"
            onChange={(e) =>
              setPdfFile(e.target.files?.[0] || null)
            }
          />

          <Button onClick={handleComplete} disabled={!canComplete}>
            Complete
          </Button>
        </FieldSet>
      </div>
    </div>
  );
}