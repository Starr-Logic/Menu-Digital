import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useAuth(triggerToast) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminToken, setAdminToken] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('adminUser');
    if (storedToken && storedUser) {
      try {
        setAdminToken(storedToken);
        setAdminUser(JSON.parse(storedUser));
        setIsAdminLoggedIn(true);
      } catch (err) {
        console.error('Error restoring auth:', err);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }
  }, []);

  const handleAdminLogin = (token, user) => {
    setAdminToken(token);
    setAdminUser(user);
    setIsAdminLoggedIn(true);
    triggerToast(`Welcome ${user.username}!`, 'success');
    navigate('/admin');
  };

  const handleAdminLogout = (resetCustomerOrderState) => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdminToken(null);
    setAdminUser(null);
    setIsAdminLoggedIn(false);
    resetCustomerOrderState();
    triggerToast('Logged out successfully', 'success');
    navigate('/');
  };

  return {
    isAdminLoggedIn,
    adminToken,
    adminUser,
    handleAdminLogin,
    handleAdminLogout
  };
}
