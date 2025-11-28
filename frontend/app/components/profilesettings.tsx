"use client";

import React, { useState, useEffect, useRef } from 'react';
import './profilesettings.css'; 
import { auth } from '../../initializeFirebase'; 
import { User } from 'firebase/auth';
import { uploadProfilePicture, updateUserProfile } from '../../services/userService';

// Port 5261 as per your leader
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5261";

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ isOpen, onClose, onLogout }) => {
  const [user, setUser] = useState<User | null>(null);
  
  // FETCHED DATA STATES
  const [displayName, setDisplayName] = useState("Loading..."); 
  const [email, setEmail] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          const backendName = data.username || data.Username; 
          setDisplayName(backendName || currentUser.displayName || "User");
        } else {
          setDisplayName(currentUser.displayName || "User");
        }
      } catch (err) {
        setDisplayName(currentUser.displayName || "User");
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
  };// 4. HANDLE DELETE ACCOUNT
  const handleDeleteAccount = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!user) return;

    const confirmDelete = window.confirm("Are you sure you want to delete your account? This will remove all your data permanently.");
    if (!confirmDelete) return;

    try {
      // A. Delete from Backend Database
      const token = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/users/${user.uid}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
      });

      // B. Delete from Firebase Auth
      await user.delete(); // <--- If this fails, it jumps to 'catch'

      // C. Logout/Close
      if (onLogout) onLogout();
      
    } catch (error: any) {
      console.error("Delete Error:", error);

      // --- THE FIX IS HERE ---
      if (error.code === 'auth/requires-recent-login') {
        alert("SECURITY ALERT: For your protection, you must have recently signed in to delete your account.\n\nWe will log you out now. Please sign in again and try deleting your account immediately.");
        
        // Force logout so they can sign in again fresh
        if (onLogout) onLogout(); 
      } else {
        alert("Failed to delete account. Please try again.");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>

        <div className="profile-header-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px', padding: '20px' }}>
          
          {/* Picture Section (Clickable for Upload) */}
          <div className="avatar-container" onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer' }}>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
            
            <div className="avatar-circle" style={{ backgroundImage: photoPreview ? `url(${photoPreview})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
              {!photoPreview && <span style={{color:'white', fontSize:'2rem'}}>{displayName ? displayName.charAt(0).toUpperCase() : 'U'}</span>}
            </div>
            
            {/* REMOVED: "Change profile" text is gone, but the click functionality above remains. */}
          </div>

          {/* Name Section */}
          <div className="username-display">
             <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>
               {displayName}
             </h2>
          </div>
        </div>

        <div className="info-card">
          <label className="info-label">Email:</label>
          <div className="info-value">{email}</div> 
        </div>

        <div className="info-card">
          <label className="info-label">Password:</label>
          <div className="info-value">*******</div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
            <button className="logout-btn" onClick={onLogout}>Logout</button>
            
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
  );
};

export default ProfileSettings;