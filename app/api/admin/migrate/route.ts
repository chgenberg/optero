import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication check here
    // const apiKey = request.headers.get("x-api-key");
    // if (apiKey !== process.env.ADMIN_API_KEY) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    console.log("🚀 Starting Prisma migration...");

    // Run prisma migrate deploy
    const { stdout, stderr } = await execAsync("npx prisma migrate deploy", {
      env: process.env,
      cwd: process.cwd(),
    });

    console.log("✅ Migration completed");
    console.log("STDOUT:", stdout);
    if (stderr) {
      console.warn("STDERR:", stderr);
    }

    return NextResponse.json({
      success: true,
      message: "Database migration completed successfully",
      output: stdout,
      warnings: stderr || null,
    });
  } catch (error: any) {
    console.error("❌ Migration failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Migration failed",
        message: error.message,
        output: error.stdout || null,
        stderr: error.stderr || null,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check migration status
export async function GET(request: NextRequest) {
  try {
    const { stdout } = await execAsync("npx prisma migrate status", {
      env: process.env,
      cwd: process.cwd(),
    });

    return NextResponse.json({
      status: "ok",
      migrations: stdout,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message,
        output: error.stdout || null,
      },
      { status: 500 }
    );
  }
}
