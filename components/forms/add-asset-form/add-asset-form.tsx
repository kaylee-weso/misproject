"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import dynamic from "next/dynamic";
import AppCombobox from "@/components/ui/app-combobox";

// Dynamically import DatePickerInput to avoid SSR issues
const DatePickerInput = dynamic(
  () => import("@/components/ui/datepickerinput").then(mod => mod.DatePickerInput),
  { ssr: false }
);

const nonAssignableTypes = [
  "Server",
  "Printer",
  "Tablet",
  "Scanner",
  "Router",
  "Switch",
  "Docking Station",
];

const isAssetAssignable = (assetTypeName?: string) =>
  assetTypeName ? !nonAssignableTypes.includes(assetTypeName) : true;

type Props = {
  formData: any;
  setFormData: (data: any) => void;
  formOptions: any;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export default function AddAssetForm({ formData, setFormData, formOptions, onSubmit }: Props) {
  const router = useRouter();

  const selectedAssetType = formOptions.assetTypes.find(
    (a: any) => a.asset_type_id === Number(formData.assetType)
  )?.type_name;

  const isAssignable = isAssetAssignable(selectedAssetType);

  // --- Options ---
  const vendorOptions = formOptions.vendors.map((v: any) => ({ value: String(v.vendor_id), label: v.vendor_name }));
  const assetTypeOptions = formOptions.assetTypes.map((a: any) => ({ value: String(a.asset_type_id), label: a.type_name }));
  const userOptions = formOptions.users.map((u: any) => ({ value: String(u.user_id), label: `${u.firstname} ${u.lastname}` }));
  const departmentOptions = formOptions.departments.map((d: any) => ({ value: String(d.department_id), label: d.department_name }));
  const locationOptions = formOptions.locations.map((l: any) => ({ value: String(l.location_id), label: l.location_name }));

  // --- State for Comboboxes ---
  const [vendorFilter, setVendorFilter] = useState("");
  const [vendorOpen, setVendorOpen] = useState(false);
  const [assetTypeFilter, setAssetTypeFilter] = useState("");
  const [assetTypeOpen, setAssetTypeOpen] = useState(false);
  const [userFilter, setUserFilter] = useState("");
  const [userOpen, setUserOpen] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [locationFilter, setLocationFilter] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);

  const handleCancel = () => {
    if (!window.confirm("Are you sure you want to cancel?")) return;

    setFormData({
      serialNumber: "",
      vendor: "",
      modelName: "",
      assetType: "",
      assignedTo: "",
      department: "",
      location: "",
      purchaseDate: null,
    });

    setVendorFilter(""); setVendorOpen(false);
    setAssetTypeFilter(""); setAssetTypeOpen(false);
    setUserFilter(""); setUserOpen(false);
    setDepartmentFilter(""); setDepartmentOpen(false);
    setLocationFilter(""); setLocationOpen(false);

    router.push("/inventory");
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={onSubmit} className="w-full bg-white rounded-xl shadow-sm p-6">
        <FieldGroup className="space-y-4">

          {/* Add New Asset */}
          <FieldSet>
            <FieldLegend>Add New Asset</FieldLegend>
            <FieldDescription>Fill out the form below to add a new asset.</FieldDescription>

            <FieldGroup>
              <Field>
                <FieldLabel>Serial Number</FieldLabel>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  required
                  className="border rounded-[10px] px-3 py-1.25 w-full text-sm"
                />
              </Field>

              <div className="grid grid-cols-3 gap-4">
                <Field>
                  <FieldLabel>Manufacturer</FieldLabel>
                  <AppCombobox
                    options={vendorOptions}
                    value={formData.vendor}
                    onChange={(v) => setFormData({ ...formData, vendor: v })}
                    filter={vendorFilter}
                    setFilter={setVendorFilter}
                    open={vendorOpen}
                    setOpen={setVendorOpen}
                    placeholder="Select vendor"
                  />
                </Field>

                <Field>
                  <FieldLabel>Model Name</FieldLabel>
                  <input
                    type="text"
                    value={formData.modelName}
                    onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                    className="border rounded-[10px] px-3 py-1.25 w-full text-sm"
                  />
                </Field>

                <Field>
                  <FieldLabel>Asset Type</FieldLabel>
                  <AppCombobox
                    options={assetTypeOptions}
                    value={formData.assetType}
                    onChange={(v) => setFormData({ ...formData, assetType: v, assignedTo: "", department: "", location: "" })}
                    filter={assetTypeFilter}
                    setFilter={setAssetTypeFilter}
                    open={assetTypeOpen}
                    setOpen={setAssetTypeOpen}
                    placeholder="Select asset type"
                  />
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          {/* Assignment */}
          <FieldSet>
            <FieldLegend>Assignment</FieldLegend>

            <Field>
              <FieldLabel>Assigned To</FieldLabel>
              <AppCombobox
                options={userOptions}
                value={formData.assignedTo}
                onChange={(v) => setFormData({ ...formData, assignedTo: v })}
                filter={userFilter}
                setFilter={setUserFilter}
                open={userOpen}
                setOpen={setUserOpen}
                placeholder="Select user"
                disabled={!isAssignable}
                onSelectExtra={(v) => {
                  const user = formOptions.users.find((u: any) => String(u.user_id) === v);
                  setFormData((prev: any) => ({
                    ...prev,
                    assignedTo: v,
                    department: user ? String(user.department_id || "") : "",
                    location: user ? String(user.primary_location_id || "") : "",
                  }));
                }}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Department</FieldLabel>
                <AppCombobox
                  options={departmentOptions}
                  value={formData.department}
                  onChange={(v) => setFormData({ ...formData, department: v })}
                  filter={departmentFilter}
                  setFilter={setDepartmentFilter}
                  open={departmentOpen}
                  setOpen={setDepartmentOpen}
                  placeholder="Select department"
                  disabled={!!formData.assignedTo}
                />
              </Field>

              <Field>
                <FieldLabel>Location</FieldLabel>
                <AppCombobox
                  options={locationOptions}
                  value={formData.location}
                  onChange={(v) => setFormData({ ...formData, location: v })}
                  filter={locationFilter}
                  setFilter={setLocationFilter}
                  open={locationOpen}
                  setOpen={setLocationOpen}
                  placeholder="Select location"
                  disabled={!!formData.assignedTo}
                />
              </Field>
            </div>
          </FieldSet>

          <FieldSeparator />

          {/* Purchase Date */}
          <FieldSet>
            <FieldLegend>Purchase Date</FieldLegend>
            <DatePickerInput
              value={formData.purchaseDate}
              onChange={(v) => setFormData({ ...formData, purchaseDate: v })}
              placeholder="Select purchase date"
            />
          </FieldSet>

          <FieldSet>
            <div className="grid grid-cols-2 gap-4">
              <Button type="submit">Submit</Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </FieldSet>

        </FieldGroup>
      </form>
    </div>
  );
}