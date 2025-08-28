import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Notification from "@/models/Notification";

export async function POST(request: NextRequest) {
  await dbConnect();
  const body = await request.json();
  
  const notification = await Notification.create({
    toEmployeeId: body.toEmployeeId,
    fromAdminId: body.fromAdminId,
    message: body.message,
  });

  return NextResponse.json({ message: "Notification sent", notification });
}

export async function GET(request: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employeeId");

  const notifications = await Notification.find({ toEmployeeId: employeeId, read: false })
    .sort({ createdAt: -1 });

  return NextResponse.json(notifications);
}
