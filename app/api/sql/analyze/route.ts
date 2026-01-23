import { NextRequest, NextResponse } from "next/server";
import { handleSqlRequest } from "@/app/shared/lib/sql-transpiler";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("Analyzing SQL...", {
      sql_length: body.sql?.length,
      dialect: body.dialect,
    });

    const result = handleSqlRequest("analyze", body);

    return NextResponse.json(result);
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
