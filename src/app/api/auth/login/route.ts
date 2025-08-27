import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { email, password } = await request.json();
    console.log('Login attempt for email:', email);

    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Find employee by email only
    const employee = await Employee.findOne({ email });
    console.log('Employee found:', employee ? employee.email : 'None');
    
    if (!employee) {
      console.log('No employee found with email:', email);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Debug: Check what's stored in passwordHash
    console.log('Stored passwordHash exists:', !!employee.passwordHash);
    if (employee.passwordHash) {
      console.log('Hash length:', employee.passwordHash.length);
      console.log('Hash prefix:', employee.passwordHash.substring(0, 20));
    }

    // Compare passwords
    console.log('Comparing provided password with hash...');
    const isMatch = await bcrypt.compare(password, employee.passwordHash);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('Password mismatch for email:', email);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: employee._id, email: employee.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log('Login successful for:', email);
    return NextResponse.json({
      token,
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        position: employee.position,
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}