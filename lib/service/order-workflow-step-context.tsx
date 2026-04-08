
"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type ContextType = {
  steps: Map<number, number>; // orderId -> step
  setStepForOrder: (orderId: number, step: number) => void;
};

const OrderWorkflowStepContext = createContext<ContextType | undefined>(undefined);

export const OrderWorkflowStepProvider = ({ children }: { children: ReactNode }) => {
  const [steps, setSteps] = useState<Map<number, number>>(new Map());

  const setStepForOrder = (orderId: number, step: number) => {
    setSteps((prev) => new Map(prev).set(orderId, step));
  };

  return (
    <OrderWorkflowStepContext.Provider value={{ steps, setStepForOrder }}>
      {children}
    </OrderWorkflowStepContext.Provider>
  );
};

export const useOrderWorkflowStep = () => {
  const context = useContext(OrderWorkflowStepContext);
  if (!context) throw new Error("useOrderWorkflowStep must be used within provider");
  return context;
};