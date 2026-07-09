import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StaffDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/staff/check-in', { replace: true });
  }, [navigate]);

  return null;
}
