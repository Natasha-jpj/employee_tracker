'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Employee {
  _id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  position: string;
}

interface Department {
  _id: string;
  name: string;
  description?: string;
}

interface Role {
  _id: string;
  name: string;
  department: string;
  permissions: {
    canCheckIn: boolean;
    canManageEmployees: boolean;
    canManageDepartments: boolean;
    canManageRoles: boolean;
    canAssignTasks: boolean;
    canViewAllTasks: boolean;
    canViewReports: boolean;
  };
}

interface Task {
  _id: string;
  title: string;
  description: string;
  assignedBy: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  dueDate: string;
  createdAt: string;
  progressUpdates: { message: string; timestamp: string }[];
}

interface AttendanceRecord {
  _id: string;
  employeeId: string;
  employeeName: string;
  type: 'checkin' | 'checkout';
  timestamp: string;
  imageData?: string;
  createdAt: string;
}

interface LunchTime {
  _id: string;
  employeeId: string;
  employeeName: string;
  startTime: string; // Format: "HH:MM"
  endTime: string;   // Format: "HH:MM"
  days: string[];    // e.g., ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
}

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<AttendanceRecord[]>([]);
  
  const [activeTab, setActiveTab] = useState('attendance');
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    password: '',
    department: 'General',
    role: 'Employee',
    position: ''
  });
  
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: ''
  });
  
  const [newRole, setNewRole] = useState({
    name: '',
    department: 'General',
    permissions: {
      canCheckIn: true,
      canManageEmployees: false,
      canManageDepartments: false,
      canManageRoles: false,
      canAssignTasks: false,
      canViewAllTasks: false,
      canViewReports: false
    }
  });
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium' as const,
    dueDate: ''
  });
  const [lunchTimes, setLunchTimes] = useState<LunchTime[]>([]);
const [showLunchForm, setShowLunchForm] = useState(false);
const [editingLunchTime, setEditingLunchTime] = useState<LunchTime | null>(null);
const [newLunchTime, setNewLunchTime] = useState({
  employeeId: '',
  startTime: '12:00',
  endTime: '13:00',
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = attendance.filter(record =>
        record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAttendance(filtered);
    } else {
      setFilteredAttendance(attendance);
    }
  }, [searchTerm, attendance]);

  const fetchData = async () => {
    try {
      setError(null);
      setLoading(true);

      const [employeesRes, departmentsRes, rolesRes, tasksRes, attendanceRes,lunchTimesRes] = await Promise.all([
        fetch('/api/admin/employees'),
        fetch('/api/departments'),
        fetch('/api/roles'),
        fetch('/api/tasks'),
        fetch('/api/admin/attendance'),
        fetch('/api/lunchtimes') 
      ]);

      if (!employeesRes.ok) throw new Error('Failed to fetch employees');
      if (!departmentsRes.ok) throw new Error('Failed to fetch departments');
      if (!rolesRes.ok) throw new Error('Failed to fetch roles');
      if (!tasksRes.ok) throw new Error('Failed to fetch tasks');
      if (!attendanceRes.ok) throw new Error('Failed to fetch attendance');

      const employeesData = await employeesRes.json();
      const departmentsData = await departmentsRes.json();
      const rolesData = await rolesRes.json();
      const tasksData = await tasksRes.json();
      const attendanceData = await attendanceRes.json();
       const lunchTimesData = await lunchTimesRes.json();

      setEmployees(employeesData.employees || []);
      setDepartments(departmentsData.departments || []);
      setRoles(rolesData.roles || []);
      setTasks(tasksData.tasks || []);
      setAttendance(attendanceData.attendance || []);
      setLunchTimes(lunchTimesData.lunchTimes || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      setError(null);

      const response = await fetch('/api/admin/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee),
      });

      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Failed to create employee');

      setNewEmployee({ name: '', email: '', password: '', department: 'General', role: 'Employee', position: '' });
      setShowEmployeeForm(false);
      await fetchData();
      alert('Employee created successfully!');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDepartment),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setNewDepartment({ name: '', description: '' });
      setShowDepartmentForm(false);
      await fetchData();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRole),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setNewRole({
        name: '',
        department: 'General',
        permissions: {
          canCheckIn: true,
          canManageEmployees: false,
          canManageDepartments: false,
          canManageRoles: false,
          canAssignTasks: false,
          canViewAllTasks: false,
          canViewReports: false
        }
      });
      setShowRoleForm(false);
      await fetchData();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setCreating(false);
    }
  };

   const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setNewRole({
      name: role.name,
      department: role.department,
      permissions: { ...role.permissions }
    });
    setShowRoleForm(true);
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editingRole) return;
  
  try {
    setCreating(true);
    const response = await fetch('/api/roles', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingRole._id, // Send ID in the request body
        ...newRole
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    
    setEditingRole(null);
    setNewRole({
      name: '',
      department: 'General',
      permissions: {
        canCheckIn: true,
        canManageEmployees: false,
        canManageDepartments: false,
        canManageRoles: false,
        canAssignTasks: false,
        canViewAllTasks: false,
        canViewReports: false
      }
    });
    setShowRoleForm(false);
    await fetchData();
  } catch (error: any) {
    setError(error.message);
  } finally {
    setCreating(false);
  }
};

  const handleDeleteRole = async (roleId: string) => {
  if (!confirm('Are you sure you want to delete this role?')) return;
  
  try {
    const response = await fetch(`/api/roles?id=${roleId}`, { // Use query parameter
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    
    await fetchData();
  } catch (error: any) {
    setError(error.message);
  }
};

const handleCreateLunchTime = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    setCreating(true);
    const response = await fetch('/api/lunchtimes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLunchTime),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    
    setNewLunchTime({
      employeeId: '',
      startTime: '12:00',
      endTime: '13:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    });
    setShowLunchForm(false);
    await fetchData();
  } catch (error: any) {
    setError(error.message);
  } finally {
    setCreating(false);
  }
};

const handleUpdateLunchTime = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editingLunchTime) return;
  
  try {
    setCreating(true);
    const response = await fetch('/api/lunchtimes', { // Remove ID from URL
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingLunchTime._id, // Add ID to request body
        ...newLunchTime
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    
    setEditingLunchTime(null);
    setNewLunchTime({
      employeeId: '',
      startTime: '12:00',
      endTime: '13:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    });
    setShowLunchForm(false);
    await fetchData();
  } catch (error: any) {
    setError(error.message);
  } finally {
    setCreating(false);
  }
};

const handleDeleteLunchTime = async (lunchTimeId: string) => {
  if (!confirm('Are you sure you want to delete this lunch time?')) return;
  
  try {
    const response = await fetch(`/api/lunchtimes?id=${lunchTimeId}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    
    await fetchData();
  } catch (error: any) {
    setError(error.message);
  }
};

const handleEditLunchTime = (lunchTime: LunchTime) => {
  setEditingLunchTime(lunchTime);
  setNewLunchTime({
    employeeId: lunchTime.employeeId,
    startTime: lunchTime.startTime,
    endTime: lunchTime.endTime,
    days: [...lunchTime.days]
  });
  setShowLunchForm(true);
};


  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          assignedBy: 'admin' // This should come from auth context
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setNewTask({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '' });
      setShowTaskForm(false);
      await fetchData();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleRetry = () => fetchData();
  const handleLogout = () => router.push('/admin');
  const viewImage = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setShowImageModal(true);
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Employee Name', 'Employee ID', 'Type', 'Date', 'Time', 'Image Available'],
      ...filteredAttendance.map(record => [
        record.employeeName,
        record.employeeId,
        record.type,
        new Date(record.timestamp).toLocaleDateString(),
        new Date(record.timestamp).toLocaleTimeString(),
        record.imageData ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'attendance-records.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center' }}><h2>Loading...</h2></div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#343a40', color: '#fff', padding: '18px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
        <div>
          <button onClick={fetchData} style={{ marginRight: '10px', padding: '8px 18px', backgroundColor: '#17a2b8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Refresh</button>
          <button onClick={handleLogout} style={{ padding: '8px 18px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #dee2e6' }}>
        <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto', padding: '0 25px' }}>
          {['attendance', 'employees', 'departments', 'roles', 'tasks', 'lunchTime'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '15px 25px',
                backgroundColor: activeTab === tab ? '#007bff' : 'transparent',
                color: activeTab === tab ? '#fff' : '#495057',
                border: 'none',
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontWeight: activeTab === tab ? '600' : '400'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '25px', maxWidth: '1400px', margin: '0 auto' }}>
        {error && (
          <div style={{ padding: '15px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{error}</span>
            <button onClick={handleRetry} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Retry</button>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div style={{ backgroundColor: '#fff', padding: '22px', borderRadius: '8px', boxShadow: '0 3px 6px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ margin: 0 }}>Attendance Records ({filteredAttendance.length})</h2>
              <button onClick={exportToCSV} style={{ padding: '8px 18px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Export to CSV</button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="Search by employee name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px' }}
              />
            </div>

            {filteredAttendance.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                {searchTerm ? 'No matching records found' : 'No attendance records found'}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f3f5' }}>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Employee</th>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Employee ID</th>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Type</th>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Date & Time</th>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Image</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendance.map(record => (
                      <tr key={record._id}>
                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{record.employeeName}</td>
                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{record.employeeId}</td>
                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                          <span style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: record.type === 'checkin' ? '#d4edda' : '#f8d7da', color: record.type === 'checkin' ? '#155724' : '#721c24', fontWeight: 'bold' }}>
                            {record.type.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{new Date(record.timestamp).toLocaleString()}</td>
                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                          {record.imageData ? (
                            <button onClick={() => viewImage(record)} style={{ padding: '6px 12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>View Image</button>
                          ) : <span style={{ color: '#6c757d' }}>No image</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <div style={{ backgroundColor: '#fff', padding: '22px', borderRadius: '8px', marginBottom: '25px', boxShadow: '0 3px 6px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ margin: 0 }}>Employee Management</h2>
              <button onClick={() => setShowEmployeeForm(!showEmployeeForm)} style={{ padding: '8px 18px', backgroundColor: showEmployeeForm ? '#6c757d' : '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                {showEmployeeForm ? 'Cancel' : 'Add New Employee'}
              </button>
            </div>

            {showEmployeeForm && (
              <div style={{ padding: '20px', border: '1px solid #dee2e6', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#f1f3f5' }}>
                <h3 style={{ marginTop: 0 }}>Create New Employee</h3>
                <form onSubmit={handleCreateEmployee} style={{ display: 'grid', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Name</label>
                    <input type="text" value={newEmployee.name} onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})} required disabled={creating} style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email</label>
                    <input type="email" value={newEmployee.email} onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})} required disabled={creating} style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password</label>
                    <input type="password" value={newEmployee.password} onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})} required disabled={creating} style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Department</label>
                    <select value={newEmployee.department} onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})} disabled={creating} style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px' }}>
                      {departments.map(dept => <option key={dept._id} value={dept.name}>{dept.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Role</label>
                    <select value={newEmployee.role} onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})} disabled={creating} style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px' }}>
                      {roles.map(role => <option key={role._id} value={role.name}>{role.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Position</label>
                    <input type="text" value={newEmployee.position} onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})} required disabled={creating} style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px' }} />
                  </div>
                  <button type="submit" disabled={creating} style={{ padding: '12px 24px', backgroundColor: creating ? '#6c757d' : '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: creating ? 'not-allowed' : 'pointer' }}>
                    {creating ? 'Creating...' : 'Create Employee'}
                  </button>
                </form>
              </div>
            )}

            <h3>Employees ({employees.length})</h3>
            {employees.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6c757d', padding: '20px' }}>No employees found</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f3f5' }}>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Email</th>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Department</th>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Role</th>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(employee => (
                      <tr key={employee._id}>
                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{employee.name}</td>
                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{employee.email}</td>
                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{employee.department}</td>
                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{employee.role}</td>
                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{employee.position}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Departments Tab */}
        {activeTab === 'departments' && (
          <div style={{ backgroundColor: '#fff', padding: '22px', borderRadius: '8px', marginBottom: '25px', boxShadow: '0 3px 6px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ margin: 0 }}>Department Management</h2>
              <button onClick={() => setShowDepartmentForm(!showDepartmentForm)} style={{ padding: '8px 18px', backgroundColor: showDepartmentForm ? '#6c757d' : '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                {showDepartmentForm ? 'Cancel' : 'Add Department'}
              </button>
            </div>

            {showDepartmentForm && (
              <div style={{ padding: '20px', border: '1px solid #dee2e6', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#f1f3f5' }}>
                <h3 style={{ marginTop: 0 }}>Create New Department</h3>
                <form onSubmit={handleCreateDepartment} style={{ display: 'grid', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Name</label>
                    <input type="text" value={newDepartment.name} onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})} required disabled={creating} style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description</label>
                    <textarea value={newDepartment.description} onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})} disabled={creating} style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px', minHeight: '80px' }} />
                  </div>
                  <button type="submit" disabled={creating} style={{ padding: '12px 24px', backgroundColor: creating ? '#6c757d' : '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: creating ? 'not-allowed' : 'pointer' }}>
                    {creating ? 'Creating...' : 'Create Department'}
                  </button>
                </form>
              </div>
            )}

            <h3>Departments ({departments.length})</h3>
            {departments.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6c757d', padding: '20px' }}>No departments found</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f3f5' }}>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map(dept => (
                      <tr key={dept._id}>
                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{dept.name}</td>
                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{dept.description || 'No description'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

  {/* Roles Tab */}
  {activeTab === 'roles' && (
    <div style={{ backgroundColor: '#fff', padding: '22px', borderRadius: '8px', marginBottom: '25px', boxShadow: '0 3px 6px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <h2 style={{ margin: 0 }}>Role Management</h2>
        <button 
          onClick={() => {
            setEditingRole(null);
            setNewRole({
              name: '',
              department: 'General',
              permissions: {
                canCheckIn: true,
                canManageEmployees: false,
                canManageDepartments: false,
                canManageRoles: false,
                canAssignTasks: false,
                canViewAllTasks: false,
                canViewReports: false
              }
            });
            setShowRoleForm(!showRoleForm);
          }} 
          style={{ padding: '8px 18px', backgroundColor: showRoleForm ? '#6c757d' : '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {showRoleForm ? 'Cancel' : 'Add Role'}
        </button>
      </div>

      {showRoleForm && (
        <div style={{ padding: '20px', border: '1px solid #dee2e6', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#f1f3f5' }}>
          <h3 style={{ marginTop: 0 }}>{editingRole ? 'Edit Role' : 'Create New Role'}</h3>
          <form onSubmit={editingRole ? handleUpdateRole : handleCreateRole} style={{ display: 'grid', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Name</label>
              <input 
                type="text" 
                value={newRole.name} 
                onChange={(e) => setNewRole({...newRole, name: e.target.value})} 
                required 
                disabled={creating} 
                style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Department</label>
              <select 
                value={newRole.department} 
                onChange={(e) => setNewRole({...newRole, department: e.target.value})} 
                disabled={creating} 
                style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px' }}
              >
                {departments.map(dept => <option key={dept._id} value={dept.name}>{dept.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Permissions</label>
              {Object.entries(newRole.permissions).map(([permission, value]) => (
                <div key={permission} style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setNewRole({
                        ...newRole,
                        permissions: { ...newRole.permissions, [permission]: e.target.checked }
                      })}
                      disabled={creating}
                    />
                    <span>{permission.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                  </label>
                </div>
              ))}
            </div>
            <button 
              type="submit" 
              disabled={creating} 
              style={{ padding: '12px 24px', backgroundColor: creating ? '#6c757d' : '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: creating ? 'not-allowed' : 'pointer' }}
            >
              {creating ? (editingRole ? 'Updating...' : 'Creating...') : (editingRole ? 'Update Role' : 'Create Role')}
            </button>
          </form>
        </div>
      )}

      <h3>Roles ({roles.length})</h3>
      {roles.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#6c757d', padding: '20px' }}>No roles found</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f3f5' }}>
                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Department</th>
                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Permissions</th>
                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(role => (
                <tr key={role._id}>
                  <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{role.name}</td>
                  <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{role.department}</td>
                  <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                    {Object.entries(role.permissions)
                      .filter(([_, value]) => value)
                      .map(([permission]) => permission.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))
                      .join(', ')}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                    <button 
                      onClick={() => handleEditRole(role)}
                      style={{ padding: '6px 12px', backgroundColor: '#17a2b8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteRole(role._id)}
                      style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div style={{ backgroundColor: '#fff', padding: '22px', borderRadius: '8px', boxShadow: '0 3px 6px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ margin: 0 }}>Task Management</h2>
              <button onClick={() => setShowTaskForm(!showTaskForm)} style={{ padding: '8px 18px', backgroundColor: showTaskForm ? '#6c757d' : '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                {showTaskForm ? 'Cancel' : 'Assign Task'}
              </button>
            </div>

            {showTaskForm && (
              <div style={{ padding: '20px', border: '1px solid #dee2e6', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#f1f3f5' }}>
                <h3 style={{ marginTop: 0 }}>Assign New Task</h3>
                <form onSubmit={handleCreateTask} style={{ display: 'grid', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Title</label>
                    <input type="text" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} required disabled={creating} style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description</label>
                    <textarea value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} required disabled={creating} style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px', minHeight: '80px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Assign To</label>
                    <select value={newTask.assignedTo} onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})} required disabled={creating} style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px' }}>
                      <option value="">Select Employee</option>
                      {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name} ({emp.position})</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Priority</label>
                    <select value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: e.target.value as any})} disabled={creating} style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px' }}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Due Date</label>
                    <input type="datetime-local" value={newTask.dueDate} onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})} required disabled={creating} style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px' }} />
                  </div>
                  <button type="submit" disabled={creating} style={{ padding: '12px 24px', backgroundColor: creating ? '#6c757d' : '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: creating ? 'not-allowed' : 'pointer' }}>
                    {creating ? 'Assigning...' : 'Assign Task'}
                  </button>
                </form>
              </div>
            )}

            <h3>Tasks ({tasks.length})</h3>
            {tasks.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6c757d', padding: '20px' }}>No tasks found</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f3f5' }}>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Title</th>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Assigned To</th>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Priority</th>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Status</th>
                      <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(task => {
                      const assignedEmployee = employees.find(emp => emp._id === task.assignedTo);
                      return (
                        <tr key={task._id}>
                          <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{task.title}</td>
                          <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{assignedEmployee ? assignedEmployee.name : 'Unknown'}</td>
                          <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              backgroundColor: task.priority === 'high' ? '#dc3545' : task.priority === 'medium' ? '#ffc107' : '#28a745',
                              color: task.priority === 'high' ? '#fff' : '#000'
                            }}>
                              {task.priority}
                            </span>
                          </td>
                          <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              backgroundColor: task.status === 'completed' ? '#28a745' : task.status === 'in-progress' ? '#17a2b8' : '#6c757d',
                              color: '#fff'
                            }}>
                              {task.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{new Date(task.dueDate).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            
          </div>
        )}

      {activeTab === 'lunchTime' && (
  <div style={{ backgroundColor: '#fff', padding: '22px', borderRadius: '8px', marginBottom: '25px', boxShadow: '0 3px 6px rgba(0,0,0,0.08)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
      <h2 style={{ margin: 0 }}>Lunch Time Management</h2>
      <button 
        onClick={() => {
          setEditingLunchTime(null);
          setNewLunchTime({
            employeeId: '',
            startTime: '12:00',
            endTime: '13:00',
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
          });
          setShowLunchForm(!showLunchForm);
        }} 
        style={{ padding: '8px 18px', backgroundColor: showLunchForm ? '#6c757d' : '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        {showLunchForm ? 'Cancel' : 'Add Lunch Time'}
      </button>
    </div>

    {showLunchForm && (
      <div style={{ padding: '20px', border: '1px solid #dee2e6', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#f1f3f5' }}>
        <h3 style={{ marginTop: 0 }}>{editingLunchTime ? 'Edit Lunch Time' : 'Assign Lunch Time'}</h3>
        <form onSubmit={editingLunchTime ? handleUpdateLunchTime : handleCreateLunchTime} style={{ display: 'grid', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Employee</label>
            <select 
              value={newLunchTime.employeeId} 
              onChange={(e) => setNewLunchTime({...newLunchTime, employeeId: e.target.value})} 
              required 
              disabled={creating} 
              style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px' }}
            >
              <option value="">Select Employee</option>
              {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name} ({emp.position})</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Start Time</label>
              <input 
                type="time" 
                value={newLunchTime.startTime} 
                onChange={(e) => setNewLunchTime({...newLunchTime, startTime: e.target.value})} 
                required 
                disabled={creating} 
                style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>End Time</label>
              <input 
                type="time" 
                value={newLunchTime.endTime} 
                onChange={(e) => setNewLunchTime({...newLunchTime, endTime: e.target.value})} 
                required 
                disabled={creating} 
                style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px' }} 
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Days</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={newLunchTime.days.includes(day)}
                    onChange={(e) => {
                      const updatedDays = e.target.checked
                        ? [...newLunchTime.days, day]
                        : newLunchTime.days.filter(d => d !== day);
                      setNewLunchTime({...newLunchTime, days: updatedDays});
                    }}
                    disabled={creating}
                  />
                  <span>{day}</span>
                </label>
              ))}
            </div>
          </div>
          <button 
            type="submit" 
            disabled={creating} 
            style={{ padding: '12px 24px', backgroundColor: creating ? '#6c757d' : '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: creating ? 'not-allowed' : 'pointer' }}
          >
            {creating ? (editingLunchTime ? 'Updating...' : 'Creating...') : (editingLunchTime ? 'Update Lunch Time' : 'Create Lunch Time')}
          </button>
        </form>
      </div>
    )}

    <h3>Assigned Lunch Times ({lunchTimes.length})</h3>
    {lunchTimes.length === 0 ? (
      <p style={{ textAlign: 'center', color: '#6c757d', padding: '20px' }}>No lunch times assigned</p>
    ) : (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f3f5' }}>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Employee</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Start Time</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>End Time</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Days</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
  {lunchTimes.map(lunchTime => (
    <tr key={lunchTime._id}>
      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
        {lunchTime.employeeName} {/* Use the employeeName from lunchTime data */}
      </td>
      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{lunchTime.startTime}</td>
      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{lunchTime.endTime}</td>
      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{lunchTime.days.join(', ')}</td>
      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
        <button 
          onClick={() => handleEditLunchTime(lunchTime)}
          style={{ padding: '6px 12px', backgroundColor: '#17a2b8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' }}
        >
          Edit
        </button>
        <button 
          onClick={() => handleDeleteLunchTime(lunchTime._id)}
          style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Delete
        </button>
      </td>
    </tr>
  ))}
</tbody>
        </table>
      </div>
    )}
  </div>
)}
        
      </div>




      {/* Image Modal */}
      {showImageModal && selectedRecord && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '8px', maxWidth: '90%', maxHeight: '90%', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '8px' }}>{selectedRecord.employeeName} - {selectedRecord.type.toUpperCase()}</h3>
            <p style={{ marginBottom: '15px', color: '#6c757d' }}>{new Date(selectedRecord.timestamp).toLocaleString()}</p>
            <img src={selectedRecord.imageData} alt={`${selectedRecord.employeeName} ${selectedRecord.type}`} style={{ maxWidth: '100%', maxHeight: '400px', margin: '10px 0' }} />
            <div>
              <button onClick={() => setShowImageModal(false)} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}