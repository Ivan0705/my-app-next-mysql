import { NextRequest, NextResponse } from "next/server";
import { handleSqlRequest } from "@/app/shared/lib/sql-transpiler";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action || 'transpile';
    
    console.log(`SQL action: ${action}`, {
      from: body.from_dialect,
      to: body.to_dialect,
      sql_length: body.sql?.length,
    });

    const result = handleSqlRequest(action, body);
    
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
