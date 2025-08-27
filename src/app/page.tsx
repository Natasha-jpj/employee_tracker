'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // Save token + employee in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('employee', JSON.stringify(data.employee));

      router.push('/dashboard');
    } catch (err: any) {
      setError('Something went wrong');
      console.error(err);
    }
  };

  return (
    <div>
      <div className="header">
        <h1>Employee Login</h1>
      </div>
      <div className="login-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" className="submit-btn">Login</button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link href="/admin" style={{ color: '#3498db', textDecoration: 'none' }}>
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}
