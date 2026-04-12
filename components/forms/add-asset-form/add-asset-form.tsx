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
import { DatePickerInput2 } from "@/components/ui/datepickerinput2";
import AppCombobox from "@/components/ui/app-combobox";

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
  onSubmit: (data: any) => Promise<void>;
};

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

  // OPTIONS
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

  // FILTER STATES
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

  // CANCEL
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

    router.push("/inventory");
  };

  // SUBMIT
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !formData.serialNumber ||
      !formData.vendor ||
      !formData.modelName ||
      !formData.assetType ||
      !formData.purchaseDate
    ) {
      alert("Please fill out all required fields");
      return;
    }

    if (!window.confirm("Are you sure you want to add asset?")) return;

    try {
      await onSubmit(formData);

      router.push("/inventory");
    } catch (err) {
      console.error(err);
      alert("Failed to add asset");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="w-full bg-white rounded-xl shadow-sm p-6"
      >
        <FieldGroup className="space-y-4">

          <FieldSet>
            <FieldLegend>Add New Asset</FieldLegend>
            <FieldDescription>
              Fill out the form below to add a new asset.
            </FieldDescription>

            <FieldGroup>
              <Field>
                <FieldLabel>Serial Number</FieldLabel>
                <input
                  value={formData.serialNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, serialNumber: e.target.value })
                  }
                  className="border rounded-[10px] px-3 py-1.25 w-full text-sm"
                />
              </Field>

              <div className="grid grid-cols-3 gap-4">

                <Field>
                  <FieldLabel>Manufacturer</FieldLabel>
                  <AppCombobox
                    options={vendorOptions}
                    value={formData.vendor}
                    onChange={(v) =>
                      setFormData({ ...formData, vendor: v })
                    }
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
                    value={formData.modelName}
                    onChange={(e) =>
                      setFormData({ ...formData, modelName: e.target.value })
                    }
                    className="border rounded-[10px] px-3 py-1.25 w-full text-sm"
                  />
                </Field>

                <Field>
                  <FieldLabel>Asset Type</FieldLabel>
                  <AppCombobox
                    options={assetTypeOptions}
                    value={formData.assetType}
                    onChange={(v) =>
                      setFormData({
                        ...formData,
                        assetType: v,
                        assignedTo: "",
                        department: "",
                        location: "",
                      })
                    }
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

          <FieldSet>
            <FieldLegend>Assignment</FieldLegend>

            <Field>
              <FieldLabel>Assigned To</FieldLabel>
              <AppCombobox
                options={userOptions}
                value={formData.assignedTo}
                onChange={(v) =>
                  setFormData({ ...formData, assignedTo: v })
                }
                filter={userFilter}
                setFilter={setUserFilter}
                open={userOpen}
                setOpen={setUserOpen}
                disabled={!isAssignable}
                placeholder="Select user"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">

              <Field>
                <FieldLabel>Department</FieldLabel>
                <AppCombobox
                  options={departmentOptions}
                  value={formData.department}
                  onChange={(v) =>
                    setFormData({ ...formData, department: v })
                  }
                  filter={departmentFilter}
                  setFilter={setDepartmentFilter}
                  open={departmentOpen}
                  setOpen={setDepartmentOpen}
                  disabled={!!formData.assignedTo}
                  placeholder="Select department"
                />
              </Field>

              <Field>
                <FieldLabel>Location</FieldLabel>
                <AppCombobox
                  options={locationOptions}
                  value={formData.location}
                  onChange={(v) =>
                    setFormData({ ...formData, location: v })
                  }
                  filter={locationFilter}
                  setFilter={setLocationFilter}
                  open={locationOpen}
                  setOpen={setLocationOpen}
                  disabled={!!formData.assignedTo}
                  placeholder="Select location"
                />
              </Field>
            </div>
          </FieldSet>

          <FieldSeparator />

          <FieldSet>
            <FieldLegend>Purchase Date</FieldLegend>

            <DatePickerInput2
              value={formData.purchaseDate}
              onChange={(v) =>
                setFormData({ ...formData, purchaseDate: v })
              }
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