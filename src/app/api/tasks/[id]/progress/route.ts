import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const body = await request.json();

  const task = await Task.findById(params.id);
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  task.progressUpdates.push({
    message: body.message,
    timestamp: new Date(),
  });

  if (body.status) task.status = body.status; // optional status update

  await task.save();

  return NextResponse.json({ message: "Progress update saved", task });
}
