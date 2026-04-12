"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
}: Props) {
  const router = useRouter();

  // -------------------------
  // LOCAL UI STATE ONLY
  // -------------------------
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
  // STEP ENGINE
  // -------------------------
  const steps = useMemo(() => {
    return [
      {
        id: 1,
        key: "schedule",
        title: "Scheduled Pickup",

        isUnlocked: () => true,
        isComplete: () => !!formData.scheduleCompleted,

        canSubmit: () =>
          !!formData.company &&
          !!formData.address &&
          !!formData.scheduledPickupDate,

        onSubmit: async () => {
          if (!orderId) return;

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
        },
      },

      {
        id: 2,
        key: "confirm",
        title: "Confirm Asset Transfer",

        isUnlocked: () => !!formData.scheduleCompleted,
        isComplete: () => !!formData.confirmCompleted,

        canSubmit: () =>
          !!formData.actualPickupDate &&
          !!formData.vendorOrderId &&
          !!formData.pickupContact &&
          custodyConfirmed,

        onSubmit: async () => {
          if (!orderId) return;

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
        },
      },

      {
        id: 3,
        key: "complete",
        title: "Verify Recycling Completion",

        isUnlocked: () => !!formData.confirmCompleted,
        isComplete: () => !!formData.completeCompleted,

        canSubmit: () => !!orderCompleted && !!pdfFile,

        onSubmit: async () => {
          if (!orderId) return;

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
        },
      },
    ];
  }, [formData, custodyConfirmed, orderCompleted, pdfFile, orderId]);

  // -------------------------
  // ACTIVE STEP
  // -------------------------
  const activeStepIndex = steps.findIndex((s) => !s.isComplete());
  const activeStep = steps[Math.max(activeStepIndex, 0)];

  // -------------------------
  // LOAD WORKFLOW FIELDS
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
      total: res.data?.length || 0,
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
  // RENDER STEP
  // -------------------------
  const renderStep = (step: any) => {
    const locked = !step.isUnlocked();
    const completed = step.isComplete();

    return (
      <div
        className={
          locked
            ? "hidden"
            : completed
            ? "opacity-50 pointer-events-none"
            : ""
        }
      >
        <FieldSet>
          <FieldLegend className="text-lg font-semibold mb-6">
            {step.title}
          </FieldLegend>

          {/* ---------------- STEP 1 ---------------- */}
          {step.id === 1 && (
            <div className="flex gap-6">
              <div className="flex-1 space-y-6">
                <Field>
                  <FieldLabel>Company</FieldLabel>
                  <AppCombobox
                    options={workflowFields.facilities.map((f) => ({
                      value: f.Company,
                      label: f.Company,
                    }))}
                    value={formData.company || ""}
                    onChange={(val) =>
                      setFormData({ ...formData, company: val, address: "" })
                    }
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
                      .filter((f) => f.Company === formData.company)
                      .map((f) => ({
                        value: f.facility_id,
                        label: f.Full_Address,
                      }))}
                    value={formData.address || ""}
                    onChange={(val) =>
                      setFormData({ ...formData, address: val })
                    }
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
              </div>

              {/* ✅ RESTORED MAP COMPONENT */}
              <div className="flex-1">
                <MapComponent />
              </div>
            </div>
          )}

          {/* ---------------- STEP 2 ---------------- */}
          {step.id === 2 && (
            <div className="space-y-6">
              <Field>
                <FieldLabel>Pickup Date</FieldLabel>
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

              <label className="flex gap-2">
                <input
                  type="checkbox"
                  checked={custodyConfirmed}
                  onChange={(e) =>
                    setCustodyConfirmed(e.target.checked)
                  }
                />
                Custody confirmed
              </label>
            </div>
          )}

          {/* ---------------- STEP 3 ---------------- */}
          {step.id === 3 && (
            <div className="space-y-6">
              <label className="flex gap-2">
                <input
                  type="checkbox"
                  checked={orderCompleted}
                  onChange={(e) =>
                    setOrderCompleted(e.target.checked)
                  }
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
            </div>
          )}

          <Button
            className="mt-4"
            disabled={!step.canSubmit()}
            onClick={step.onSubmit}
          >
            Continue
          </Button>
        </FieldSet>
      </div>
    );
  };

  if (!orderId) return <p>Loading order...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <FieldSeparator />
      {steps.map(renderStep)}
    </div>
  );
}