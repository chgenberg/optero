import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Update a Q&A pair
export async function PATCH(req: NextRequest) {
  try {
    const { id, question, answer, verified, confidence, category } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "id required" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    
    if (question !== undefined) updateData.question = question;
    if (answer !== undefined) updateData.answer = answer;
    if (category !== undefined) updateData.category = category;
    if (confidence !== undefined) updateData.confidence = confidence;
    
    if (verified !== undefined) {
      updateData.verified = verified;
      if (verified) {
        updateData.verifiedAt = new Date();
        // TODO: Add verifiedBy from auth token
      }
    }

    const updated = await prisma.botQA.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      qa: updated
    });

  } catch (error) {
    console.error("Q&A update error:", error);
    return NextResponse.json(
      { error: "Failed to update Q&A pair" },
      { status: 500 }
    );
  }
}

// Delete a Q&A pair
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "id required" },
        { status: 400 }
      );
    }

    await prisma.botQA.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: "Q&A pair deleted"
    });

  } catch (error) {
    console.error("Q&A delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete Q&A pair" },
      { status: 500 }
    );
  }
}

