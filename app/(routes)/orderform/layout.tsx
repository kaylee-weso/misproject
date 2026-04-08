"use client";

import { ReactNode } from "react";
import { OrderWorkflowStepProvider } from "@/lib/service/order-workflow-step-context";

export default function OrderformLayout({ children }: { children: ReactNode }) {
  return (
    <OrderWorkflowStepProvider>
      {children}
    </OrderWorkflowStepProvider>
  );
}