"use client";

import { useState } from "react";
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
import { DatePickerInput } from "@/components/ui/datepickerinput";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";

const nonAssignableTypes = [
  "Server",
  "Printer",
  "Tablet",
  "Scanner",
  "Router",
  "Switch",
  "Docking Station",
];

const isAssetAssignable = (assetTypeName: string | undefined) =>
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
  const vendorOptions = formOptions.vendors.map((v: any) => ({
    value: String(v.vendor_id),
    label: v.vendor_name,
  }));
  const assetTypeOptions = formOptions.assetTypes.map((a: any) => ({
    value: String(a.asset_type_id),
    label: a.type_name,
  }));
  const userOptions = formOptions.users.map((u: any) => ({
    value: String(u.user_id),
    label: `${u.firstname} ${u.lastname}`,
  }));
  const departmentOptions = formOptions.departments.map((d: any) => ({
    value: String(d.department_id),
    label: d.department_name,
  }));
  const locationOptions = formOptions.locations.map((l: any) => ({
    value: String(l.location_id),
    label: l.location_name,
  }));

  // --- Filter & open states for each combobox ---
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
    if (!window.confirm("Are you sure you want to cancel adding an asset?")) return;

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

  // --- Generic combobox renderer ---
  const renderCombobox = (
    options: any[],
    value: string,
    setValue: (v: string) => void,
    filter: string,
    setFilter: (f: string) => void,
    open: boolean,
    setOpen: (b: boolean) => void,
    placeholder: string,
    disabled?: boolean,
    onSelect?: (selectedValue: string) => void
  ) => (
    <Combobox
      value={options.find(o => o.value === value)?.label || ""}
      onValueChange={(label) => {
        const selected = options.find(o => o.label === label);
        const val = selected?.value || "";
        setValue(val);
        if (onSelect) onSelect(val);
        setFilter("");
        setOpen(false);
      }}
      open={open}
      onOpenChange={setOpen}
      disabled={disabled}
    >
      <div className="relative">
        <ComboboxInput
          value={options.find(o => o.value === value)?.label || ""}
          placeholder={placeholder}
          showTrigger
          showClear
          disabled={disabled}
          onChange={(e) => setFilter(e.target.value)}
          onFocus={() => !disabled && setOpen(true)}
        />
      </div>
      <ComboboxContent>
        <ComboboxList>
          {options
            .filter(o => o.label.toLowerCase().includes(filter.toLowerCase()))
            .map(o => (
              <ComboboxItem key={o.value} value={o.label}>{o.label}</ComboboxItem>
            ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={onSubmit} className="w-full bg-white rounded-xl shadow-sm p-6">
        <FieldGroup className="space-y-4">

          {/* Add New Asset */}
          <FieldSet>
            <FieldLegend>Add New Asset</FieldLegend>
            <FieldDescription>Fill out the form below to add a new asset to the inventory.</FieldDescription>

            <FieldGroup>
              <Field>
                <FieldLabel>Serial Number</FieldLabel>
                <input
                  type="text"
                  placeholder="Enter Serial number"
                  value={formData.serialNumber}
                  onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                  required
                  className="border rounded-[10px] px-3 py-1.25 w-full text-sm font-sans focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </Field>

              <div className="grid grid-cols-3 gap-4">
                <Field>
                  <FieldLabel>Manufacturer</FieldLabel>
                  {renderCombobox(
                    vendorOptions,
                    formData.vendor,
                    (v) => setFormData({ ...formData, vendor: v }),
                    vendorFilter, setVendorFilter,
                    vendorOpen, setVendorOpen,
                    "Select vendor"
                  )}
                </Field>

                <Field>
                  <FieldLabel>Model Name</FieldLabel>
                  <input
                    type="text"
                    placeholder="Model Name"
                    value={formData.modelName}
                    onChange={e => setFormData({ ...formData, modelName: e.target.value })}
                    className="border rounded-[10px] px-3 py-1.25 w-full text-sm font-sans focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </Field>

                <Field>
                  <FieldLabel>Asset Type</FieldLabel>
                  {renderCombobox(
                    assetTypeOptions,
                    formData.assetType,
                    (v) => setFormData({ ...formData, assetType: v, assignedTo: "", department: "", location: "" }),
                    assetTypeFilter, setAssetTypeFilter,
                    assetTypeOpen, setAssetTypeOpen,
                    "Select asset type"
                  )}
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          {/* Assignment Information */}
          <FieldSet>
            <FieldLegend>Assignment Information</FieldLegend>
            <FieldDescription>Enter assignment details for this asset.</FieldDescription>

            <FieldGroup>
              <Field>
                <FieldLabel>Assigned To</FieldLabel>
                {renderCombobox(
                  userOptions,
                  formData.assignedTo,
                  (v) => setFormData({
                    ...formData,
                    assignedTo: v,
                    department: userOptions.find((u:any) => u.value === v)
                      ? String(formOptions.users.find((u:any) => String(u.user_id) === v)?.department_id || "")
                      : "",
                    location: userOptions.find((u:any) => u.value === v)
                      ? String(formOptions.users.find((u:any) => String(u.user_id) === v)?.primary_location_id || "")
                      : ""
                  }),
                  userFilter, setUserFilter,
                  userOpen, setUserOpen,
                  "Select user",
                  !isAssignable
                )}
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Department</FieldLabel>
                  {renderCombobox(
                    departmentOptions,
                    formData.department,
                    (v) => setFormData({ ...formData, department: v }),
                    departmentFilter, setDepartmentFilter,
                    departmentOpen, setDepartmentOpen,
                    "Select department",
                    !!formData.assignedTo
                  )}
                </Field>

                <Field>
                  <FieldLabel>Location</FieldLabel>
                  {renderCombobox(
                    locationOptions,
                    formData.location,
                    (v) => setFormData({ ...formData, location: v }),
                    locationFilter, setLocationFilter,
                    locationOpen, setLocationOpen,
                    "Select location",
                    !!formData.assignedTo
                  )}
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          {/* Purchase Date */}
          <FieldSet>
            <FieldLegend>Date of Purchase</FieldLegend>
            <FieldDescription>Enter the date when this asset was purchased.</FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel>Purchase Date</FieldLabel>
                <DatePickerInput
                  value={formData.purchaseDate}
                  onChange={v => setFormData({ ...formData, purchaseDate: v })}
                  placeholder="Select purchase date"
                />
              </Field>
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldGroup>
              <div className="grid grid-cols-2 gap-4">
                <Button type="submit" className="w-full">Submit</Button>
                <Button variant="outline" type="button" className="w-full" onClick={handleCancel}>Cancel</Button>
              </div>
            </FieldGroup>
          </FieldSet>

        </FieldGroup>
      </form>
    </div>
  );
}