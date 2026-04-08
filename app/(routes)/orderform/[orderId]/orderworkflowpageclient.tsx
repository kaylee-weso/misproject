'use client';

import { useState, useEffect } from "react";
import OrderWorkflow from "@/components/forms/order-workflow/order-workflow";
import { fetchOrderForm } from "@/lib/fetchers/orderform/orderform";
import { normalizeOrderApi } from "@/lib/service/normalizeOrder";

interface Props {
  orderId: number;
  formData: any;
  initialStep: number;
}

export default function OrderWorkflowPageClient({ orderId, formData, initialStep }: Props) {
  const [formState, setFormState] = useState(formData);
  const [stepState, setStepState] = useState(initialStep);

  
  if (!formData) return <p>Failed to load order.</p>;

  return (
    <OrderWorkflow
      orderId={orderId}
      formData={formState}
      setFormData={setFormState}
      initialStep={stepState}
    />
  );
}