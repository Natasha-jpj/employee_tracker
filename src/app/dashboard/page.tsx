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
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [adminMessage, setAdminMessage] = useState<string | null>(null);
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

  // Auto "I'm working" popup every 15 min
  useEffect(() => {
    const interval = setInterval(() => {
      const confirmWorking = window.confirm('Are you working? Click OK to confirm.');
      if (confirmWorking) {
        console.log(`${employeeName} confirmed they are working at ${new Date().toLocaleString()}`);
      }
    }, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [employeeName]);

  // Fetch admin messages (simulate)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/messages?employeeId=${employeeId}`);
        const data = await res.json();
        if (data.message) {
          setAdminMessage(data.message);
          alert(`Admin message: ${data.message}`);
        }
      } catch (err) {
        console.error('Failed to fetch admin message', err);
      }
    }, 60000); // check every 1 min
    return () => clearInterval(interval);
  }, [employeeId]);

  const handleCheckInOut = (data: CheckInOutData) => {
    setCheckRecords(prev => [{ ...data }, ...prev]);
    console.log('Check in/out data:', data);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('employee');
    router.push('/');
  };

  // Task actions
  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      loadTasks(employeeId);
    } catch (err) {
      console.error('Failed to update task status', err);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      loadTasks(employeeId);
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  const sendProgressMessage = async () => {
    if (!progressMessage.trim()) return;
    try {
      await fetch(`/api/tasks/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          message: progressMessage,
        }),
      });
      alert('Progress message sent!');
      setProgressMessage('');
    } catch (err) {
      console.error('Failed to send progress message', err);
    }
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
                <li key={task._id} style={{ marginBottom: '10px' }}>
                  <strong>{task.title}</strong> - {task.description} 
                  <span style={{ marginLeft: '10px', color: 'gray' }}>
                    ({task.status})
                  </span>
                  <div style={{ marginTop: '5px' }}>
                    <button onClick={() => updateTaskStatus(task._id, 'in-progress')}>
                      Mark In Progress
                    </button>
                    <button onClick={() => updateTaskStatus(task._id, 'completed')} style={{ marginLeft: '5px' }}>
                      Mark Completed
                    </button>
                    <button onClick={() => deleteTask(task._id)} style={{ marginLeft: '5px', color: 'red' }}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Progress Message Section */}
        <div style={{ marginTop: '30px' }}>
          <h3>Send Progress Update</h3>
          <textarea
            value={progressMessage}
            onChange={(e) => setProgressMessage(e.target.value)}
            placeholder="What are you working on?"
            style={{ width: '100%', height: '80px', marginBottom: '10px' }}
          />
          <br />
          <button onClick={sendProgressMessage}>Send Update</button>
        </div>
      </div>
    </div>
  );
}
