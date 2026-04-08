import OrderWorkflowPageClient from "./orderworkflowpageclient";
import Link from "next/link";
import { getOrder } from "@/lib/query/orderform/orderform-query";
import { normalizeOrderApi, getFirstIncompleteStep } from "@/lib/service/normalizeOrder";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default async function OrderWorkflowPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;

  // Fetch order from DB
  const order = await getOrder(Number(orderId));

  // Normalize order data for form
  const normalizedForm = normalizeOrderApi(order);

  // Determine first incomplete step
  const initialStep = getFirstIncompleteStep(normalizedForm);

  return (
    <div className= "page">
      <Breadcrumb className="page-header">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/orderform">Recycling Order Form</Link>
            </BreadcrumbLink>
          <BreadcrumbSeparator />
          </BreadcrumbItem>

          <BreadcrumbItem>
            <BreadcrumbPage>Order Form Workflow</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <OrderWorkflowPageClient
        orderId={Number(orderId)}
        formData={normalizedForm}   // pass down the normalized form
        initialStep={initialStep}   // pass down the correct step
      />

    </div>


  );
}