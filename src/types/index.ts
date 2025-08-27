export interface CheckInOutData {
  type: 'checkin' | 'checkout';
  timestamp: Date;
  employeeId: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
}

// Mock data for demonstration
export const mockCheckRecords: CheckInOutData[] = [
  {
    type: 'checkin',
    timestamp: new Date('2023-10-15T08:30:00'),
    employeeId: 'emp-001',
    employeeName: 'John Doe'
  },
  {
    type: 'checkout',
    timestamp: new Date('2023-10-15T17:15:00'),
    employeeId: 'emp-001',
    employeeName: 'John Doe'
  },
  {
    type: 'checkin',
    timestamp: new Date('2023-10-15T09:05:00'),
    employeeId: 'emp-002',
    employeeName: 'Jane Smith'
  },
  {
    type: 'checkout',
    timestamp: new Date('2023-10-15T16:45:00'),
    employeeId: 'emp-002',
    employeeName: 'Jane Smith'
  },
  {
    type: 'checkin',
    timestamp: new Date('2023-10-16T08:45:00'),
    employeeId: 'emp-001',
    employeeName: 'John Doe'
  },
];