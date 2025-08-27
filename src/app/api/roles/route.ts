import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Role from '@/models/Role';

export async function GET() {
  try {
    await dbConnect();
    
    const roles = await Role.find({}).sort({ department: 1, name: 1 }).lean();
    
    return NextResponse.json({ 
      success: true,
      roles 
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
    
    if (!body.name || !body.department) {
      return NextResponse.json(
        { success: false, error: 'Role name and department are required' },
        { status: 400 }
      );
    }

    const role = await Role.create({
      name: body.name,
      department: body.department,
      permissions: body.permissions || {}
    });

    return NextResponse.json(
      { success: true, role },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}