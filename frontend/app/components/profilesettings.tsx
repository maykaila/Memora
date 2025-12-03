"use client";

import React, { useState, useEffect, useRef } from 'react';
import './profilesettings.css'; 
import { auth } from '../../initializeFirebase'; 
import { User, signOut } from 'firebase/auth'; 
import { uploadProfilePicture, updateUserProfile } from '../../services/userService';
import ChangePassword from './changepass'; 

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://memora-api.dcism.org";

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ isOpen, onClose, onLogout }) => {
  const [user, setUser] = useState<User | null>(null);
  
  // FETCHED DATA STATES
  const [displayName, setDisplayName] = useState("Loading..."); 
  const [role, setRole] = useState(""); 
  const [email, setEmail] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- FIX: ADDED STATE FOR PASSWORD MODAL ---
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);

  // 1. FETCH DATA
  useEffect(() => {
    const fetchUserData = async (currentUser: User) => {
      try {
        const token = await currentUser.getIdToken();
        const response = await fetch(`${API_BASE_URL}/api/users/${currentUser.uid}`, {
             headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          const backendName = data.username || data.Username || data.displayName; 
          const backendRole = data.role || data.Role || "Student"; 
          
          setDisplayName(backendName || currentUser.displayName || "User");
          setRole(backendRole);
        } else {
          setDisplayName(currentUser.displayName || "User");
          setRole("Student");
        }
      } catch (err) {
        setDisplayName(currentUser.displayName || "User");
        setRole("Student");
      }
    };

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setEmail(currentUser.email || ""); 
        setPhotoPreview(currentUser.photoURL);
        fetchUserData(currentUser);
      }
    });
    return () => unsubscribe();
  }, [isOpen]);

  // 2. SYNC PHOTO
  const syncPhotoWithBackend = async (currentUser: User, currentName: string, newPhotoUrl: string) => {
    try {
      const token = await currentUser.getIdToken();
      await fetch(`${API_BASE_URL}/api/users/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ displayName: currentName, photoUrl: newPhotoUrl || "" })
      });
    } catch (error) { console.error("Sync error:", error); }
  };

  // 3. HANDLE IMAGE UPLOAD
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0] && user) {
      const file = e.target.files[0];
      setPhotoPreview(URL.createObjectURL(file)); 
      
      try {
        setLoading(true);
        const url = await uploadProfilePicture(file, user);
        await updateUserProfile(user, displayName, url);
        await syncPhotoWithBackend(user, displayName, url);
        setLoading(false);
      } catch (e) { setLoading(false); }
    }
  };

  // 4. HANDLE LOGOUT
  const handleLogoutAction = async () => {
    try {
      await signOut(auth); 
      if (onLogout) onLogout(); 
      onClose(); 
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // 5. HANDLE DELETE ACCOUNT
  const handleDeleteAccount = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!user) return;

    const confirmDelete = window.confirm("Are you sure you want to delete your account? This will remove all your data permanently.");
    if (!confirmDelete) return;

    try {
      const token = await user.getIdToken();
      
      const response = await fetch(`${API_BASE_URL}/api/users/${user.uid}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend deletion failed: ${response.status} ${errorText}`);
      }

      await user.delete();
      alert("Account successfully deleted.");
      if (onLogout) onLogout(); 
      
    } catch (error: any) {
      console.error("Delete Error:", error);

      if (error.code === 'auth/requires-recent-login') {
        alert("SECURITY ALERT: Please sign out and sign in again before deleting your account.");
        await signOut(auth);
        if (onLogout) onLogout(); 
      } else {
        alert("Failed to delete account data. Please contact support or try again.\nDetails: " + error.message);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="profile-overlay" onClick={onClose}>
        <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" onClick={onClose}>&times;</button>

          <div className="profile-header-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px', padding: '20px' }}>
            
            {/* Picture Section */}
            <div className="avatar-container" onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer' }}>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
              
              <div className="avatar-circle" style={{ backgroundImage: photoPreview ? `url(${photoPreview})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                {!photoPreview && <span style={{color:'white', fontSize:'2rem'}}>{displayName ? displayName.charAt(0).toUpperCase() : 'U'}</span>}
              </div>
            </div>

            {/* Name & Role Section */}
            <div className="username-display">
               <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>
                 Hello, {displayName}!
               </h2>
               <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '4px', textTransform: 'capitalize' }}>
                 Role: {role}
               </div>
            </div>
          </div>

          <div className="info-card">
            <label className="info-label">Email:</label>
            <div className="info-value">{email}</div> 
          </div>

          {/* 3. UPDATED PASSWORD SECTION */}
          {/* We use position: relative here so the button can be absolutely positioned inside this box */}
          <div className="info-card" style={{ position: 'relative' }}>
            <label className="info-label">Password:</label>
            <div className="info-value">*******</div>
            
            {/* The Kebab Menu Button */}
            <button 
              onClick={() => setIsChangePassOpen(true)}
              style={{
                position: 'absolute',  // Takes it out of the text flow
                right: '15px',         // Sticks it to the right edge
                top: '50%',            // Pushes top edge to the vertical center
                transform: 'translateY(-50%)', // Pulls it back up by half its height to center it perfectly
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              title="Change Password"
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {/* SVG for Three Vertical Dots */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
              <button className="logout-btn" onClick={handleLogoutAction}>Logout</button>
              
              <button 
                  onClick={handleDeleteAccount}
                  style={{
                      backgroundColor: 'transparent',
                      border: '1px solid #ff4d4d',
                      color: '#ff4d4d',
                      padding: '10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fff0f0'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                  Delete Account
              </button>
          </div>

        </div>
      </div>
      
      {/* RENDER THE POPUP MODAL IF OPEN */}
      {isChangePassOpen && (
        <ChangePassword 
            isOpen={isChangePassOpen} 
            onClose={() => setIsChangePassOpen(false)} 
        />
      )}
    </>
  );
};

export default ProfileSettings;