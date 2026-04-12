"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AddAssetForm from "@/components/forms/add-asset-form/add-asset-form";
import { getFormData, addAsset } from "@/lib/fetchers/inventory/inventory";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"; // adjust path if needed
import "@/app/globals.css"; // ensure global styles are applied

export default function AddAssetPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    serialNumber: "",
    assetType: "",
    vendor: "",
    modelName: "",
    assignedTo: "",
    department: "",
    location: "",
    purchaseDate: "",
  });

  const [formOptions, setFormOptions] = useState({
    assetTypes: [],
    vendors: [],
    models: [],
    users: [],
    departments: [],
    locations: [],
  });

  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    async function loadOptions() {
      const data = await getFormData();

      setFormOptions({
        assetTypes: data.assetTypes || data.asset_types || [],
        vendors: data.vendors || [],
        models: data.models || [],
        users: data.users || [],
        departments: data.departments || [],
        locations: data.locations || [],
      });
    }
    loadOptions();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!formSubmitted) e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formSubmitted]);

  const handleSubmit = async () => {
    

    const requiredFields = [
      "serialNumber",
      "assetType",
      "department",
      "location",
      "purchaseDate",
    ] as const;

    for (const field of requiredFields) {
      if (!formData[field]) {
      alert("Please fill all required fields");
      return;
  }
}

    try {
      await addAsset({
        serialNumber: formData.serialNumber,
        modelName: formData.modelName,
        vendorId: Number(formData.vendor || null),
        assetTypeId: Number(formData.assetType || null),
        assignedTo: formData.assignedTo ? Number(formData.assignedTo) : null,
        departmentId: Number(formData.department || null),
        locationId: Number(formData.location || null),
        purchaseDate: new Date(formData.purchaseDate),
      });


      setFormSubmitted(true);
      router.push("/inventory");
      router.refresh();
    } catch (err) {
      console.error("New asset insert failed:", err);
      alert("Failed to add asset");
    }
  };

  return (
    <div className="page">
      <Breadcrumb className="page-header">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/inventory">Inventory</Link>
            </BreadcrumbLink>
          <BreadcrumbSeparator />
          </BreadcrumbItem>

          <BreadcrumbItem>
            <BreadcrumbPage>Add Asset</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <AddAssetForm
        formData={formData}
        setFormData={setFormData}
        formOptions={formOptions}
        onSubmit={handleSubmit}
      />
    </div>
  );
}