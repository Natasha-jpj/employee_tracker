import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Notification from "@/models/Notification";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const notification = await Notification.findByIdAndUpdate(
    params.id,
    { read: true },
    { new: true }
  );
  return NextResponse.json(notification);
}
