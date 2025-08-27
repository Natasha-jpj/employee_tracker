import AdminLogin from '@/components/AdminLogin';

export default function AdminLoginPage() {
  return (
    <div>
      <div className="header">
        <h1>Admin Portal</h1>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <AdminLogin />
      </div>
    </div>
  );
}