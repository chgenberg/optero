import { NextRequest, NextResponse } from "next/server";
import { getIntegrationAvailability } from "@/lib/integrations";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return NextResponse.json(getIntegrationAvailability());
}


