"use client";

import React, { useState } from 'react';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../../initializeFirebase'; // Adjust path as needed
import './changepass.css'; // Make sure to import the CSS file

interface ChangePassProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePassword: React.FC<ChangePassProps> = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }

    const user = auth.currentUser;
    if (!user || !user.email) {
      setError("No user authenticated.");
      return;
    }

    setLoading(true);

    try {
      // 1. Re-authenticate
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // 2. Update Password
      await updatePassword(user, newPassword);
      
      setSuccess("Password updated successfully!");
      setTimeout(() => {
        onClose();
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setSuccess("");
      }, 2000);

    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/wrong-password') {
        setError("Current password is incorrect.");
      } else if (err.code === 'auth/requires-recent-login') {
        setError("Please logout and login again.");
      } else {
        setError("Failed to update password.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cp-overlay" onClick={onClose}>
      <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
        
        <button className="cp-close-btn" onClick={onClose}>&times;</button>
        
        <h2 className="cp-title">Change Password</h2>

        {error && <div className="cp-message cp-error">{error}</div>}
        {success && <div className="cp-message cp-success">{success}</div>}

        <form onSubmit={handleChangePassword} className="cp-form">
          
          <div className="cp-input-group">
            <label className="cp-label">Current Password</label>
            <input 
              type="password" 
              className="cp-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="cp-input-group">
            <label className="cp-label">New Password</label>
            <input 
              type="password" 
              className="cp-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="cp-input-group">
            <label className="cp-label">Confirm New Password</label>
            <input 
              type="password" 
              className="cp-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="cp-submit-btn" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;