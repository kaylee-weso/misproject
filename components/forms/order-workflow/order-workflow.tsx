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
  // Step state (ONLY FOR INITIAL LOAD)
  // -------------------------
  const [stepState, setStepState] = useState<number>(1);

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

  const companyRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);

  // -------------------------
  // LOAD FIELDS
  // -------------------------
  useEffect(() => {
    if (!orderId) return;

    const loadFields = async () => {
      try {
        const data = await fetchOrderWorkflowFields(orderId);
        setWorkflowFields({ facilities: data.facilities || [] });
      } finally {
        setLoadingFields(false);
      }
    };

    loadFields();
  }, [orderId]);

  // -------------------------
  // INITIAL STEP ONLY ON LOAD
  // -------------------------
  useEffect(() => {
    const nextStep = getFirstIncompleteStep(formData);
    setStepState(nextStep);
  }, []);

  // -------------------------
  // TABLE
  // -------------------------
  const fetchAssetsTable = async ({ filters, sortKey, sortDirection }: any) => {
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
    { key: "serial_number", label: "Serial Number", sortable: true, filterable: true },
    { key: "asset_name", label: "Asset Name", sortable: true, filterable: true },
    { key: "type_name", label: "Type", sortable: true, filterable: true },
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
  // STEP FLOW CONTROL (KEY FIX)
  // -------------------------

  const handleSchedule = async () => {
    if (!canSchedule || !orderId) return;
    if (!window.confirm("Are you sure you want to schedule this pickup?")) return;

    try {
      await scheduleOrderRequest(
        orderId,
        assets,
        1,
        formData.scheduledPickupDate,
        formData.address
      );

      setFormData({
        ...formData,
        scheduleCompleted: true,
      });

      setStepState(2); // unlock next step immediately
    } catch (err) {
      console.error(err);
      alert("Failed to schedule pickup.");
    }
  };

  const handleConfirm = async () => {
    if (!canConfirm || !orderId) return;
    if (!window.confirm("Are you sure you want to confirm asset transfer?")) return;

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

      setFormData({
        ...formData,
        confirmCompleted: true,
      });

      setStepState(3);
    } catch (err) {
      console.error(err);
      alert("Failed to confirm asset transfer.");
    }
  };

  const handleComplete = async () => {
    if (!canComplete || !orderId) return;
    if (!window.confirm("Are you sure you want to mark this order as completed?")) return;

    try {
      const completedDate = new Date().toISOString();

      await completeOrderRequest(
        orderId,
        assets,
        1,
        completedDate,
        formData.certificateReceived
      );

      setFormData({
        ...formData,
        completeCompleted: true,
        completedDate,
      });

      alert("Order completed!");
      router.push("/orderform");
    } catch (err) {
      console.error(err);
      alert("Failed to complete the order.");
    }
  };

  if (!orderId) return <p>Loading order...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">

      {/* ORDER ASSETS */}
      <FieldSet>
        <FieldLegend className="ml-3 text-lg font-semibold mb-6">
          Order Assets
        </FieldLegend>

        <div className="flex justify-end mb-2">
          {(Object.keys(filters).length > 0 || sortKey || sortDirection) && (
            <button className="btn-outline" onClick={clearAll}>
              Clear All
            </button>
          )}
        </div>

        <ScrollArea className="h-[300px] w-full rounded-md">
          <Table
            columns={assetColumns}
            data={assets}
            filters={filters}
            globalFilterOptions={{}}
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
          <FieldLegend className="text-lg font-semibold mb-6">
            Scheduled Pickup
          </FieldLegend>

          {loadingFields ? (
            <p>Loading form...</p>
          ) : (
            <div className="flex gap-6">
              <div className="mt-20 space-y-10">
                <Field>
                  <FieldLabel>Company</FieldLabel>
                  <AppCombobox
                    options={Array.from(new Set(workflowFields.facilities.map(f => f.Company)))
                      .map(c => ({ value: c, label: c }))}
                    value={formData.company || ""}
                    onChange={(val) => {
                      const selected = workflowFields.facilities.find(f => f.Company === val);
                      setFormData({ ...formData, company: selected?.Company || "", address: "" });
                    }}
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
                      .map(f => ({ value: f.facility_id, label: f.Full_Address }))}
                    value={formData.address || ""}
                    onChange={(val) => setFormData({ ...formData, address: val })}
                    disabled={!formData.company}
                    filter={addressFilter}
                    setFilter={setAddressFilter}
                    open={addressOpen}
                    setOpen={setAddressOpen}
                  />
                </Field>

                <Field>
                  <FieldLabel>Scheduled Pickup Date</FieldLabel>
                  <DatePickerInput2
                    value={formData.scheduledPickupDate || ""}
                    onChange={(v) => setFormData({ ...formData, scheduledPickupDate: v })}
                  />
                </Field>
              </div>

              {/* ✅ MAP RESTORED */}
              <div className="flex-1">
                <MapComponent />
              </div>
            </div>
          )}

          <Button onClick={handleSchedule} disabled={!canSchedule} className="mt-4">
            Schedule
          </Button>
        </FieldSet>
      </div>

      <FieldSeparator />

      {/* STEP 2 */}
      <div className={stepState > 2 ? "opacity-50 pointer-events-none" : ""}>
        <FieldSet>
          <FieldLegend className="text-lg font-semibold mb-8">
            Confirm Asset Transfer
          </FieldLegend>

          <FieldGroup>
            <div className="space-y-10">

              <Field>
                <FieldLabel>Actual Pickup Date</FieldLabel>
                <DatePickerInput2
                  value={formData.actualPickupDate || ""}
                  onChange={(v) => setFormData({ ...formData, actualPickupDate: v })}
                />
              </Field>

              <Field>
                <FieldLabel>Vendor Order ID</FieldLabel>
                <TextInput
                  value={formData.vendorOrderId || ""}
                  onChange={(v) => setFormData({ ...formData, vendorOrderId: v })}
                />
              </Field>

              <Field>
                <FieldLabel>Pickup Contact Name</FieldLabel>
                <TextInput
                  value={formData.pickupContact || ""}
                  onChange={(v) => setFormData({ ...formData, pickupContact: v })}
                />
              </Field>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={custodyConfirmed}
                  onChange={(e) => setCustodyConfirmed(e.target.checked)}
                />
                <span>I confirm custody transfer</span>
              </label>

              <Field>
                <FieldLabel>Notes</FieldLabel>
                <TextInput
                  value={formData.notes || ""}
                  onChange={(v) => setFormData({ ...formData, notes: v })}
                />
              </Field>
            </div>
          </FieldGroup>

          <Button onClick={handleConfirm} disabled={!canConfirm} className="mt-4">
            Confirm
          </Button>
        </FieldSet>
      </div>

      <FieldSeparator />

      {/* STEP 3 */}
      <div className={stepState > 3 ? "opacity-50 pointer-events-none" : ""}>
        <FieldSet>
          <FieldLegend className="text-lg font-semibold mb-8">
            Verify Recycling Completion
          </FieldLegend>

          <div className="space-y-10">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={orderCompleted}
                onChange={(e) => setOrderCompleted(e.target.checked)}
              />
              <span>Recycling completed</span>
            </label>

            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files ? e.target.files[0] : null)}
            />
          </div>

          <Button onClick={handleComplete} disabled={!canComplete} className="mt-4">
            Complete
          </Button>
        </FieldSet>
      </div>
    </div>
  );
}