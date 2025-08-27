import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const assignedTo = searchParams.get('assignedTo');
    
    let query = {};
    if (assignedTo) {
      query = { assignedTo };
    }

    const tasks = await Task.find(query)
      .sort({ dueDate: 1, priority: -1 })
      .lean();
    
    return NextResponse.json({ 
      success: true,
      tasks 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    
    if (!body.title || !body.assignedBy || !body.assignedTo || !body.dueDate) {
      return NextResponse.json(
        { success: false, error: 'Title, assignedBy, assignedTo, and dueDate are required' },
        { status: 400 }
      );
    }

    const task = await Task.create({
      title: body.title,
      description: body.description,
      assignedBy: body.assignedBy,
      assignedTo: body.assignedTo,
      priority: body.priority || 'medium',
      dueDate: new Date(body.dueDate)
    });

    return NextResponse.json(
      { success: true, task },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}