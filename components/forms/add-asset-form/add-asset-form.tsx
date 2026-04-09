"use client";

import { useState, useRef, useEffect } from "react";
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

  // --- State for display + filter + open ---
  const [vendorDisplay, setVendorDisplay] = useState(
    vendorOptions.find((o:any) => o.value === formData.vendor)?.label || ""
  );
  const [vendorFilter, setVendorFilter] = useState("");
  const [vendorOpen, setVendorOpen] = useState(false);
  const vendorRef = useRef<HTMLDivElement>(null);

  const [assetTypeDisplay, setAssetTypeDisplay] = useState(
    assetTypeOptions.find((o:any) => o.value === formData.assetType)?.label || ""
  );
  const [assetTypeFilter, setAssetTypeFilter] = useState("");
  const [assetTypeOpen, setAssetTypeOpen] = useState(false);
  const assetTypeRef = useRef<HTMLDivElement>(null);

  const [userDisplay, setUserDisplay] = useState(
    userOptions.find((o:any) => o.value === formData.assignedTo)?.label || ""
  );
  const [userFilter, setUserFilter] = useState("");
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  const [departmentDisplay, setDepartmentDisplay] = useState(
    departmentOptions.find((o:any) => o.value === formData.department)?.label || ""
  );
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const departmentRef = useRef<HTMLDivElement>(null);

  const [locationDisplay, setLocationDisplay] = useState(
    locationOptions.find((o:any) => o.value === formData.location)?.label || ""
  );
  const [locationFilter, setLocationFilter] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  // --- Cancel handler ---
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

    // reset displays
    setVendorDisplay("");
    setAssetTypeDisplay("");
    setUserDisplay("");
    setDepartmentDisplay("");
    setLocationDisplay("");

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

  // --- Update displays if formData changes externally ---
  useEffect(() => {
    setVendorDisplay(vendorOptions.find((o:any) => o.value === formData.vendor)?.label || "");
    setAssetTypeDisplay(assetTypeOptions.find((o:any) => o.value === formData.assetType)?.label || "");
    setUserDisplay(userOptions.find((o:any) => o.value === formData.assignedTo)?.label || "");
    setDepartmentDisplay(departmentOptions.find((o:any) => o.value === formData.department)?.label || "");
    setLocationDisplay(locationOptions.find((o:any) => o.value === formData.location)?.label || "");
  }, [formData]);

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
                    value={vendorDisplay}
                    onValueChange={(label) => {
                      const selected = vendorOptions.find((o:any) => o.label === label);
                      setFormData({ ...formData, vendor: selected?.value || "" });
                      setVendorDisplay(selected?.label || "");
                      setVendorFilter("");
                      setVendorOpen(false);
                    }}
                    open={vendorOpen}
                    onOpenChange={setVendorOpen}
                  >
                    <ComboboxInput
                      placeholder="Select vendor"
                      showTrigger
                      showClear
                      onChange={(e) => setVendorFilter(e.target.value)}
                      onFocus={() => setVendorOpen(true)}
                    />
                    <ComboboxContent anchor={vendorRef}>
                      <ComboboxList>
                        {vendorOptions
                          .filter((o:any) =>
                            o.label.toLowerCase().includes(vendorFilter.toLowerCase())
                          )
                          .map((o:any) => (
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
                    value={assetTypeDisplay}
                    onValueChange={(label) => {
                      const selected = assetTypeOptions.find((o:any) => o.label === label);
                      setFormData({
                        ...formData,
                        assetType: selected?.value || "",
                        assignedTo: "",
                        department: "",
                        location: "",
                      });
                      setAssetTypeDisplay(selected?.label || "");
                      setAssetTypeFilter("");
                      setAssetTypeOpen(false);
                    }}
                    open={assetTypeOpen}
                    onOpenChange={setAssetTypeOpen}
                  >
                    <ComboboxInput
                      placeholder="Select asset type"
                      showTrigger
                      showClear
                      onChange={(e) => setAssetTypeFilter(e.target.value)}
                      onFocus={() => setAssetTypeOpen(true)}
                    />
                    <ComboboxContent anchor={assetTypeRef}>
                      <ComboboxList>
                        {assetTypeOptions
                          .filter((o:any) =>
                            o.label.toLowerCase().includes(assetTypeFilter.toLowerCase())
                          )
                          .map((o:any) => (
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

          {/* Assignment Information */}
          <FieldSet>
            <FieldLegend>Assignment Information</FieldLegend>
            <FieldDescription>Enter assignment details for this asset.</FieldDescription>

            <FieldGroup>
              {/* Assigned To */}
              <Field>
                <FieldLabel>Assigned To</FieldLabel>
                <Combobox
                  value={userDisplay}
                  onValueChange={(label) => {
                    const user = userOptions.find((o:any) => o.label === label);
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
                      setDepartmentDisplay(
                        departmentOptions.find(
                          (o:any) =>
                            o.value ===
                            String(
                              formOptions.users.find((u: any) => String(u.user_id) === user.value)
                                ?.department_id
                            )
                        )?.label || ""
                      );
                      setLocationDisplay(
                        locationOptions.find(
                          (o:any) =>
                            o.value ===
                            String(
                              formOptions.users.find((u: any) => String(u.user_id) === user.value)
                                ?.primary_location_id
                            )
                        )?.label || ""
                      );
                    } else {
                      setFormData({ ...formData, assignedTo: "", department: "", location: "" });
                      setDepartmentDisplay("");
                      setLocationDisplay("");
                    }
                    setUserDisplay(user?.label || "");
                    setUserFilter("");
                    setUserOpen(false);
                  }}
                  open={userOpen}
                  onOpenChange={setUserOpen}
                  disabled={!isAssignable}
                >
                  <ComboboxInput
                    placeholder="Select user"
                    showTrigger
                    showClear
                    disabled={!isAssignable}
                    onChange={(e) => setUserFilter(e.target.value)}
                    onFocus={() => isAssignable && setUserOpen(true)}
                  />
                  <ComboboxContent anchor={userRef}>
                    <ComboboxList>
                      {userOptions
                        .filter((o:any) =>
                          o.label.toLowerCase().includes(userFilter.toLowerCase())
                        )
                        .map((o:any) => (
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
                    value={departmentDisplay}
                    onValueChange={(label) => {
                      const selected = departmentOptions.find((o:any) => o.label === label);
                      setFormData({ ...formData, department: selected?.value || "" });
                      setDepartmentDisplay(selected?.label || "");
                      setDepartmentFilter("");
                      setDepartmentOpen(false);
                    }}
                    open={departmentOpen}
                    onOpenChange={setDepartmentOpen}
                    disabled={!!formData.assignedTo}
                  >
                    <ComboboxInput
                      placeholder="Select department"
                      showTrigger
                      showClear
                      disabled={!!formData.assignedTo}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      onFocus={() => !formData.assignedTo && setDepartmentOpen(true)}
                    />
                    <ComboboxContent anchor={departmentRef}>
                      <ComboboxList>
                        {departmentOptions
                          .filter((o:any) =>
                            o.label.toLowerCase().includes(departmentFilter.toLowerCase())
                          )
                          .map((o:any) => (
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
                    value={locationDisplay}
                    onValueChange={(label) => {
                      const selected = locationOptions.find((o:any) => o.label === label);
                      setFormData({ ...formData, location: selected?.value || "" });
                      setLocationDisplay(selected?.label || "");
                      setLocationFilter("");
                      setLocationOpen(false);
                    }}
                    open={locationOpen}
                    onOpenChange={setLocationOpen}
                    disabled={!!formData.assignedTo}
                  >
                    <ComboboxInput
                      placeholder="Select location"
                      showTrigger
                      showClear
                      disabled={!!formData.assignedTo}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      onFocus={() => !formData.assignedTo && setLocationOpen(true)}
                    />
                    <ComboboxContent anchor={locationRef}>
                      <ComboboxList>
                        {locationOptions
                          .filter((o:any) =>
                            o.label.toLowerCase().includes(locationFilter.toLowerCase())
                          )
                          .map((o:any) => (
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

          {/* Submit / Cancel */}
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