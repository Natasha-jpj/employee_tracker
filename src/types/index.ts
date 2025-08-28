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
