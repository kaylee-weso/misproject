import { NextResponse } from "next/server";
import { getFormFields} from "@/lib/query/inventory/inventory-query";
import { createAsset } from "@/lib/service/asset-service";

export async function GET() {
    try {
        const formFields = await getFormFields();
        return NextResponse.json(formFields);
    }
        catch (error) {
            console.log("Form field fetch failed:", error);
            return NextResponse.json (
                {error : "Failed to fetch form fields"},
                {status: 500}
            );
        }
    }

export async function POST(req: Request) {
  try {
    const newAsset = await req.json();


    console.log("Incoming asset:", newAsset);

    await createAsset(newAsset);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("New asset insert failed:", error);
    return NextResponse.json(
      { error: "Failed to insert asset into HA table" },
      { status: 500 }
    );
  }
}
 


