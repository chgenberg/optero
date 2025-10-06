import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    console.log("🔧 Resolving failed migration...");

    // Mark the migration as rolled back so we can apply it again
    const { stdout, stderr } = await execAsync(
      "npx prisma migrate resolve --rolled-back 20250106_add_language_to_cache",
      {
        env: process.env,
        cwd: process.cwd(),
      }
    );

    console.log("✅ Migration marked as resolved");
    console.log("STDOUT:", stdout);
    if (stderr) {
      console.warn("STDERR:", stderr);
    }

    return NextResponse.json({
      success: true,
      message: "Migration marked as resolved, you can now run migrate again",
      output: stdout,
      warnings: stderr || null,
    });
  } catch (error: any) {
    console.error("❌ Resolve failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Resolve failed",
        message: error.message,
        output: error.stdout || null,
        stderr: error.stderr || null,
      },
      { status: 500 }
    );
  }
}
