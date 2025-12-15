import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    const storedUser = localStorage.getItem('user');
    if (storedAuth === 'true' && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Get all users from localStorage
  const getUsers = () => {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : {};
  };

  // Save users to localStorage
  const saveUsers = (users) => {
    localStorage.setItem('users', JSON.stringify(users));
  };

  const register = (username, email, password, activitySector) => {
    const users = getUsers();
    
    // Check if email already exists
    if (users[email]) {
      return { success: false, error: 'Email already registered' };
    }

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store pending registration
    const pendingRegistrations = JSON.parse(localStorage.getItem('pendingRegistrations') || '{}');
    pendingRegistrations[email] = {
      username,
      email,
      password, // In production, this should be hashed
      activitySector,
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    };
    localStorage.setItem('pendingRegistrations', JSON.stringify(pendingRegistrations));

    // In production, send OTP via email service
    // For now, we'll store it and the user can see it in console (for testing)
    console.log('OTP for', email, ':', otp);
    
    return { success: true, otp }; // In production, don't return OTP
  };

  const verifyOTP = (email, otp) => {
    const pendingRegistrations = JSON.parse(localStorage.getItem('pendingRegistrations') || '{}');
    const pending = pendingRegistrations[email];

    if (!pending) {
      return { success: false, error: 'No pending registration found' };
    }

    if (Date.now() > pending.expiresAt) {
      delete pendingRegistrations[email];
      localStorage.setItem('pendingRegistrations', JSON.stringify(pendingRegistrations));
      return { success: false, error: 'OTP expired. Please register again.' };
    }

    if (pending.otp !== otp) {
      return { success: false, error: 'Invalid OTP' };
    }

    // Registration successful, create user
    const users = getUsers();
    users[email] = {
      username: pending.username,
      email: pending.email,
      password: pending.password,
      activitySector: pending.activitySector,
      verified: true,
      createdAt: new Date().toISOString()
    };
    saveUsers(users);

    // Remove pending registration
    delete pendingRegistrations[email];
    localStorage.setItem('pendingRegistrations', JSON.stringify(pendingRegistrations));

    return { success: true };
  };

  const login = (email, password) => {
    const ownerEmail = 'skanderturki@gmail.com';
    
    // Check if owner
    if (email === ownerEmail) {
      const userData = {
        email: email,
        username: 'Owner',
        name: 'Owner',
        isOwner: true
      };
      setIsAuthenticated(true);
      setUser(userData);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    }

    // Check regular users
    const users = getUsers();
    const user = users[email];

    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }

    if (!user.verified) {
      return { success: false, error: 'Email not verified' };
    }

    if (user.password !== password) {
      return { success: false, error: 'Invalid credentials' };
    }

    const userData = {
      email: user.email,
      username: user.username,
      name: user.username,
      activitySector: user.activitySector,
      isOwner: false
    };
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify(userData));
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
  };

  const sendServiceRequest = (serviceDescription, serviceType) => {
    // In production, this would send an email via API
    const ownerEmail = 'skanderturki@gmail.com';
    const emailSubject = `Service Request: ${serviceType}`;
    const emailBody = `
Service Request Details:
-------------------
Service Type: ${serviceType}
Description: ${serviceDescription}
Requested by: ${user.username} (${user.email})
Activity Sector: ${user.activitySector || 'N/A'}
Request Date: ${new Date().toLocaleString()}
    `.trim();

    // Store service requests (in production, send via email API)
    const serviceRequests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
    serviceRequests.push({
      serviceType,
      serviceDescription,
      user: user.email,
      username: user.username,
      activitySector: user.activitySector,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('serviceRequests', JSON.stringify(serviceRequests));

    // For now, we'll create a mailto link (in production, use email API)
    window.location.href = `mailto:${ownerEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    return { success: true };
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    register,
    verifyOTP,
    sendServiceRequest
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

