'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CheckInOut from '@/components/CheckInOut';

type CheckInOutData = {
  type: 'checkin' | 'checkout';
  timestamp: Date;
  employeeId: string;
};

type Task = {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
};

export default function Dashboard() {
  const [employeeId, setEmployeeId] = useState<string>('');
  const [employeeName, setEmployeeName] = useState<string>('');
  const [checkRecords, setCheckRecords] = useState<CheckInOutData[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const router = useRouter();

  // Read employee from storage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('employee');
      if (!raw) {
        router.push('/');
        return;
      }
      const emp = JSON.parse(raw);
      setEmployeeId(emp.id);
      setEmployeeName(emp.name);
    } catch {
      router.push('/');
    }
  }, [router]);

  // Fetch attendance
  const loadAttendance = useCallback(async (empId: string) => {
    if (!empId) return;
    try {
      const res = await fetch(`/api/admin/attendance?employeeId=${empId}&limit=20`);
      const data = await res.json();
      const items = (data.attendance ?? data?.attendance) || [];
      const mapped: CheckInOutData[] = items.map((r: any) => ({
        type: r.type,
        timestamp: new Date(r.timestamp),
        employeeId: typeof r.employeeId === 'object' ? r.employeeId?._id : r.employeeId,
      }));
      setCheckRecords(mapped);
    } catch (e) {
      console.error('Failed to load attendance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch tasks
  const loadTasks = useCallback(async (empId: string) => {
    if (!empId) return;
    try {
      const res = await fetch(`/api/tasks?employeeId=${empId}`);
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (e) {
      console.error('Failed to load tasks', e);
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  useEffect(() => {
    if (employeeId) {
      loadAttendance(employeeId);
      loadTasks(employeeId);
    }
  }, [employeeId, loadAttendance, loadTasks]);

  const handleCheckInOut = (data: CheckInOutData) => {
    setCheckRecords(prev => [{ ...data }, ...prev]);
    console.log('Check in/out data:', data);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('employee');
    router.push('/');
  };

  if (!employeeId) {
    return null;
  }

  return (
    <div>
      <div style={{ position: 'relative', padding: '20px', backgroundColor: '#f8f9fa' }}>
        <h1>Employee Dashboard - {employeeName}</h1>
        <button
          onClick={handleLogout}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '8px 15px',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2>Welcome, {employeeName}!</h2>
        <p>Please use the camera below to check in or check out.</p>

        <CheckInOut
          employeeId={employeeId}
          employeeName={employeeName}
          onCheckInOut={handleCheckInOut}
        />

        {/* Attendance Section */}
        <div style={{ marginTop: '30px' }}>
          <h3>Recent Check-ins/Check-outs</h3>
          {loading ? (
            <p>Loading...</p>
          ) : checkRecords.length === 0 ? (
            <p>No records yet</p>
          ) : (
            <ul>
              {checkRecords.map((record, index) => (
                <li key={`${record.employeeId}-${record.timestamp.toISOString()}-${index}`}>
                  {record.type === 'checkin' ? 'Checked in' : 'Checked out'} at{' '}
                  {record.timestamp.toLocaleString()}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tasks Section */}
        <div style={{ marginTop: '30px' }}>
          <h3>Your Tasks</h3>
          {loadingTasks ? (
            <p>Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p>No tasks assigned</p>
          ) : (
            <ul>
              {tasks.map(task => (
                <li key={task._id}>
                  <strong>{task.title}</strong> - {task.description} 
                  <span style={{ marginLeft: '10px', color: 'gray' }}>
                    ({task.status})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
