import { NextRequest, NextResponse } from "next/server";
import { handleSqlRequest } from "@/app/shared/lib/sql-transpiler";
export const dynamic = 'force-static';
export const revalidate = 3600; // 1 час кэша

export async function GET(request: NextRequest) {
  try {
    const result = handleSqlRequest('supported_dialects', {});
    return NextResponse.json(result);
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
