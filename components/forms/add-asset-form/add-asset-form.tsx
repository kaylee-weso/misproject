"use client";

import { useState, useEffect, useRef } from "react";
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

type ComboboxOption = { value: string; label: string };

type Props = {
  formData: any;
  setFormData: (data: any) => void;
  formOptions: any;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

type ControlledComboboxProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  disabled?: boolean;
};

function ControlledCombobox({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: ControlledComboboxProps) {
  const [display, setDisplay] = useState(
    options.find((o) => o.value === value)?.label || ""
  );
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDisplay(options.find((o) => o.value === value)?.label || "");
  }, [value, options]);

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Combobox
        value={display}
        onValueChange={(label) => {
          const selected = options.find((o) => o.label === label);
          onChange(selected?.value || "");
          setDisplay(selected?.label || "");
          setFilter("");
          setOpen(false);
        }}
        open={open}
        onOpenChange={setOpen}
        disabled={disabled}
      >
        <ComboboxInput
          placeholder={placeholder}
          showTrigger
          showClear
          disabled={disabled}
          onChange={(e) => setFilter(e.target.value)}
          onFocus={() => !disabled && setOpen(true)}
        />
        <ComboboxContent anchor={ref}>
          <ComboboxList>
            {options
              .filter((o) => o.label.toLowerCase().includes(filter.toLowerCase()))
              .map((o) => (
                <ComboboxItem key={o.value} value={o.label}>
                  {o.label}
                </ComboboxItem>
              ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  );
}

export default function AddAssetForm({
  formData,
  setFormData,
  formOptions,
  onSubmit,
}: Props) {
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

    router.push("/inventory");
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={onSubmit} className="w-full bg-white rounded-xl shadow-sm p-6">
        <FieldGroup className="space-y-4">
          {/* Add New Asset */}
          <FieldSet>
            <FieldLegend>Add New Asset</FieldLegend>
            <FieldDescription>
              Fill out the form below to add a new asset to the inventory.
            </FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel>Serial Number</FieldLabel>
                <input
                  type="text"
                  placeholder="Enter Serial number"
                  value={formData.serialNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, serialNumber: e.target.value })
                  }
                  required
                  className="border rounded-[10px] px-3 py-1.25 w-full text-sm font-sans focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </Field>

              <div className="grid grid-cols-3 gap-4">
                <ControlledCombobox
                  label="Manufacturer"
                  value={formData.vendor}
                  onChange={(val) => setFormData({ ...formData, vendor: val })}
                  options={vendorOptions}
                  placeholder="Select vendor"
                />
                <Field>
                  <FieldLabel>Model Name</FieldLabel>
                  <input
                    type="text"
                    placeholder="Model Name"
                    value={formData.modelName}
                    onChange={(e) =>
                      setFormData({ ...formData, modelName: e.target.value })
                    }
                    className="border rounded-[10px] px-3 py-1.25 w-full text-sm font-sans focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </Field>
                <ControlledCombobox
                  label="Asset Type"
                  value={formData.assetType}
                  onChange={(val) =>
                    setFormData({
                      ...formData,
                      assetType: val,
                      assignedTo: "",
                      department: "",
                      location: "",
                    })
                  }
                  options={assetTypeOptions}
                  placeholder="Select asset type"
                />
              </div>
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          {/* Assignment Info */}
          <FieldSet>
            <FieldLegend>Assignment Information</FieldLegend>
            <FieldDescription>Enter assignment details for this asset.</FieldDescription>
            <FieldGroup>
              <ControlledCombobox
                label="Assigned To"
                value={formData.assignedTo}
                onChange={(val) => {
                  const user = userOptions.find((u: any) => u.value === val);
                  if (user) {
                    const userObj = formOptions.users.find(
                      (u: any) => String(u.user_id) === val
                    );
                    setFormData({
                      ...formData,
                      assignedTo: val,
                      department: String(userObj?.department_id || ""),
                      location: String(userObj?.primary_location_id || ""),
                    });
                  } else {
                    setFormData({ ...formData, assignedTo: "", department: "", location: "" });
                  }
                }}
                options={userOptions}
                placeholder="Select user"
                disabled={!isAssignable}
              />
              <div className="grid grid-cols-2 gap-4">
                <ControlledCombobox
                  label="Department"
                  value={formData.department}
                  onChange={(val) => setFormData({ ...formData, department: val })}
                  options={departmentOptions}
                  placeholder="Select department"
                  disabled={!!formData.assignedTo}
                />
                <ControlledCombobox
                  label="Location"
                  value={formData.location}
                  onChange={(val) => setFormData({ ...formData, location: val })}
                  options={locationOptions}
                  placeholder="Select location"
                  disabled={!!formData.assignedTo}
                />
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
                  onChange={(v) => setFormData({ ...formData, purchaseDate: v })}
                  placeholder="Select purchase date"
                />
              </Field>
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldGroup>
              <div className="grid grid-cols-2 gap-4">
                <Button type="submit" className="w-full">
                  Submit
                </Button>
                <Button variant="outline" type="button" className="w-full" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      </form>
    </div>
  );
}