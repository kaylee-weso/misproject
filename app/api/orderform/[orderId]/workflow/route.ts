import { NextResponse } from "next/server";
import { getOrderWorkflowFields } from "@/lib/query/orderform/orderform-query";

export async function GET() { 
  try { 
    const fields = await getOrderWorkflowFields(); 
    return NextResponse.json(fields); 
  } catch (err: any) { 
    console.error("Workflow Fields API Error:", err); 
    return NextResponse.json({ error: err.message || "Failed to fetch workflow fields" }, { status: 500 }); 
  }
}
