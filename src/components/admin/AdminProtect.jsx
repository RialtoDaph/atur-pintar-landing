import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function AdminProtect({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    try {
      const user = await base44.auth.me();
      if (user?.role !== 'admin') {
        navigate('/Dashboard');
      }
    } catch (error) {
      navigate('/Dashboard');
    }
  }

  return children;
}