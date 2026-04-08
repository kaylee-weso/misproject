"use client";

import Link from "next/dist/client/link";
import CreateOrderForm from "@/components/forms/create-order-form/create-order-form";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"; // adjust path if needed
import "@/app/globals.css";


export default function CreateOrderFormPage() {
  return (
    <div className="page">
      <Breadcrumb className="page-header">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/orderform">Recycling Order Form</Link>
            </BreadcrumbLink>
          <BreadcrumbSeparator />
          </BreadcrumbItem>

          <BreadcrumbItem>
            <BreadcrumbPage>Create Order Form</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <CreateOrderForm />
    </div>
  );
}