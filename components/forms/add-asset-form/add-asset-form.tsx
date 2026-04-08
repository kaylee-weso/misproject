"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation"; // <- added for navigation
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

export default function AddAssetForm({
  formData,
  setFormData,
  formOptions,
  onSubmit,
}: Props) {
  const router = useRouter(); // initialize router

  const selectedAssetType = formOptions.assetTypes.find(
    (a: any) => a.asset_type_id === Number(formData.assetType)
  )?.type_name;

  const isAssignable = isAssetAssignable(selectedAssetType);

  // --- Option arrays ---
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

  // --- Filter & open states ---
  const [vendorFilter, setVendorFilter] = useState("");
  const [vendorOpen, setVendorOpen] = useState(false);
  const vendorRef = useRef<HTMLInputElement>(null);

  const [assetTypeFilter, setAssetTypeFilter] = useState("");
  const [assetTypeOpen, setAssetTypeOpen] = useState(false);
  const assetTypeRef = useRef<HTMLInputElement>(null);

  const [userFilter, setUserFilter] = useState("");
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef<HTMLInputElement>(null);

  const [departmentFilter, setDepartmentFilter] = useState("");
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const departmentRef = useRef<HTMLInputElement>(null);

  const [locationFilter, setLocationFilter] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);
  const locationRef = useRef<HTMLInputElement>(null);

  // --- Cancel handler ---
  const handleCancel = () => {
    const confirmCancel = window.confirm("Are you sure you want to cancel adding an asset?");
    if (!confirmCancel) return;

    // Reset form data
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

    // Reset filters and close comboboxes
    setVendorFilter("");
    setVendorOpen(false);
    setAssetTypeFilter("");
    setAssetTypeOpen(false);
    setUserFilter("");
    setUserOpen(false);
    setDepartmentFilter("");
    setDepartmentOpen(false);
    setLocationFilter("");
    setLocationOpen(false);

    router.push("/inventory");
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={onSubmit} className="w-full bg-white rounded-xl shadow-sm p-6">
        <FieldGroup className="space-y-4">
          {/* ---------------------- Add New Asset ---------------------- */}
          <FieldSet>
            <FieldLegend>Add New Asset</FieldLegend>
            <FieldDescription>
              Fill out the form below to add a new asset to the inventory.
            </FieldDescription>

            <FieldGroup>
              {/* Serial Number */}
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
                {/* Vendor */}
                <Field>
                  <FieldLabel>Manufacturer</FieldLabel>
                  <Combobox
                    value={
                      vendorOptions.find((o: any) => o.value === formData.vendor)?.label || ""
                    }
                    onValueChange={(val) => {
                      const selected = vendorOptions.find((o: any) => o.label === val);
                      setFormData({ ...formData, vendor: selected?.value || "" });
                      setVendorOpen(false);
                      vendorRef.current?.blur();
                    }}
                    open={vendorOpen}
                    onOpenChange={setVendorOpen}
                  >
                    <ComboboxInput
                      ref={vendorRef}
                      placeholder="Select vendor"
                      showTrigger
                      showClear
                      onChange={(e) => setVendorFilter(e.target.value)}
                      onFocus={() => setVendorOpen(true)}
                    />
                    <ComboboxContent>
                      <ComboboxList>
                        {vendorOptions
                          .filter((o: any) =>
                            o.label.toLowerCase().includes(vendorFilter.toLowerCase())
                          )
                          .map((o: any) => (
                            <ComboboxItem key={o.value} value={o.label}>
                              {o.label}
                            </ComboboxItem>
                          ))}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </Field>

                {/* Model Name */}
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

                {/* Asset Type */}
                <Field>
                  <FieldLabel>Asset Type</FieldLabel>
                  <Combobox
                    value={
                      assetTypeOptions.find((o: any) => o.value === formData.assetType)?.label ||
                      ""
                    }
                    onValueChange={(val) => {
                      const selected = assetTypeOptions.find((o: any) => o.label === val);
                      setFormData({
                        ...formData,
                        assetType: selected?.value || "",
                        assignedTo: "",
                        department: "",
                        location: "",
                      });
                      setAssetTypeOpen(false);
                      assetTypeRef.current?.blur();
                    }}
                    open={assetTypeOpen}
                    onOpenChange={setAssetTypeOpen}
                  >
                    <ComboboxInput
                      ref={assetTypeRef}
                      placeholder="Select asset type"
                      showTrigger
                      showClear
                      onChange={(e) => setAssetTypeFilter(e.target.value)}
                      onFocus={() => setAssetTypeOpen(true)}
                    />
                    <ComboboxContent>
                      <ComboboxList>
                        {assetTypeOptions
                          .filter((o: any) =>
                            o.label.toLowerCase().includes(assetTypeFilter.toLowerCase())
                          )
                          .map((o: any) => (
                            <ComboboxItem key={o.value} value={o.label}>
                              {o.label}
                            </ComboboxItem>
                          ))}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          {/* ---------------------- Assignment Information ---------------------- */}
          <FieldSet>
            <FieldLegend>Assignment Information</FieldLegend>
            <FieldDescription>Enter assignment details for this asset.</FieldDescription>

            <FieldGroup>
              {/* Assigned To */}
              <Field>
                <FieldLabel>Assigned To</FieldLabel>
                <Combobox
                  value={
                    userOptions.find((o: any) => o.value === formData.assignedTo)?.label || ""
                  }
                  onValueChange={(val) => {
                    const user = userOptions.find((o: any) => o.label === val);
                    if (user) {
                      setFormData({
                        ...formData,
                        assignedTo: user.value,
                        department: String(
                          formOptions.users.find((u: any) => String(u.user_id) === user.value)
                            ?.department_id || ""
                        ),
                        location: String(
                          formOptions.users.find((u: any) => String(u.user_id) === user.value)
                            ?.primary_location_id || ""
                        ),
                      });
                    } else {
                      setFormData({ ...formData, assignedTo: "", department: "", location: "" });
                    }
                    setUserOpen(false);
                    userRef.current?.blur();
                  }}
                  open={userOpen}
                  onOpenChange={setUserOpen}
                  disabled={!isAssignable}
                >
                  <ComboboxInput
                    ref={userRef}
                    placeholder="Select user"
                    showTrigger
                    showClear
                    disabled={!isAssignable}
                    onChange={(e) => setUserFilter(e.target.value)}
                    onFocus={() => isAssignable && setUserOpen(true)}
                  />
                  <ComboboxContent>
                    <ComboboxList>
                      {userOptions
                        .filter((o: any) =>
                          o.label.toLowerCase().includes(userFilter.toLowerCase())
                        )
                        .map((o: any) => (
                          <ComboboxItem key={o.value} value={o.label}>
                            {o.label}
                          </ComboboxItem>
                        ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                {/* Department */}
                <Field>
                  <FieldLabel>Department</FieldLabel>
                  <Combobox
                    value={
                      departmentOptions.find((o: any) => o.value === formData.department)?.label ||
                      ""
                    }
                    onValueChange={(val) => {
                      const selected = departmentOptions.find((o: any) => o.label === val);
                      setFormData({ ...formData, department: selected?.value || "" });
                      setDepartmentOpen(false);
                      departmentRef.current?.blur();
                    }}
                    open={departmentOpen}
                    onOpenChange={setDepartmentOpen}
                    disabled={!!formData.assignedTo}
                  >
                    <ComboboxInput
                      ref={departmentRef}
                      placeholder="Select department"
                      showTrigger
                      showClear
                      disabled={!!formData.assignedTo}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      onFocus={() => !formData.assignedTo && setDepartmentOpen(true)}
                    />
                    <ComboboxContent>
                      <ComboboxList>
                        {departmentOptions
                          .filter((o: any) =>
                            o.label.toLowerCase().includes(departmentFilter.toLowerCase())
                          )
                          .map((o: any) => (
                            <ComboboxItem key={o.value} value={o.label}>
                              {o.label}
                            </ComboboxItem>
                          ))}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </Field>

                {/* Location */}
                <Field>
                  <FieldLabel>Location</FieldLabel>
                  <Combobox
                    value={
                      locationOptions.find((o: any) => o.value === formData.location)?.label || ""
                    }
                    onValueChange={(val) => {
                      const selected = locationOptions.find((o: any) => o.label === val);
                      setFormData({ ...formData, location: selected?.value || "" });
                      setLocationOpen(false);
                      locationRef.current?.blur();
                    }}
                    open={locationOpen}
                    onOpenChange={setLocationOpen}
                    disabled={!!formData.assignedTo}
                  >
                    <ComboboxInput
                      ref={locationRef}
                      placeholder="Select location"
                      showTrigger
                      showClear
                      disabled={!!formData.assignedTo}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      onFocus={() => !formData.assignedTo && setLocationOpen(true)}
                    />
                    <ComboboxContent>
                      <ComboboxList>
                        {locationOptions
                          .filter((o: any) =>
                            o.label.toLowerCase().includes(locationFilter.toLowerCase())
                          )
                          .map((o: any) => (
                            <ComboboxItem key={o.value} value={o.label}>
                              {o.label}
                            </ComboboxItem>
                          ))}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          {/* ---------------------- Purchase Date ---------------------- */}
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