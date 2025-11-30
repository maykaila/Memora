using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Cloud.Firestore;
using Memora.Models;
using System;
using System.Threading.Tasks;

namespace Memora.Services
{
    public class UserService : IUserService
    {
        private readonly FirestoreDb _db;

        public UserService(FirestoreDb db)
        {
            _db = db;
        }

        public async Task<User> CreateUserAsync(string uid, string username, string email, string role)
        {
            var newUser = new User
            {
                UserId = uid,
                Username = username ?? "Unknown", // Handle potential nulls safely
                Email = email ?? "",
                ProfilePic = null,
                DateCreated = Timestamp.FromDateTime(DateTime.UtcNow),
                Role = role ?? "Student" // Default to Student if null
            };

            CollectionReference usersRef = _db.Collection("users");
            await usersRef.Document(uid).SetAsync(newUser);

            return newUser;
        }

        // FIX: Return type is now Task<User?> to allow returning null
        public async Task<User?> GetUserAsync(string uid)
        {
            DocumentSnapshot snapshot = await _db.Collection("users").Document(uid).GetSnapshotAsync();
            if (snapshot.Exists)
            {
                return snapshot.ConvertTo<User>();
            }
            return null;
        }

        // For Streak ----------------------------------------------------------------------------------
        public async Task CheckInUserAsync(string uid)
        {
            DocumentReference userRef = _db.Collection("users").Document(uid);
            
            // Run inside a transaction to be safe
            await _db.RunTransactionAsync(async transaction =>
            {
                DocumentSnapshot snapshot = await transaction.GetSnapshotAsync(userRef);
                if (snapshot.Exists)
                {
                    User user = snapshot.ConvertTo<User>();
                    
                    DateTime today = DateTime.UtcNow.Date;
                    DateTime? lastDate = user.LastLoginDate?.Date;

                    // Only calculate if they haven't already logged in today
                    if (lastDate != today)
                    {
                        if (lastDate == today.AddDays(-1))
                        {
                            // Logged in yesterday: Streak goes up!
                            user.CurrentStreak++;
                        }
                        else
                        {
                            // Missed a day (or first time): Reset to 1
                            user.CurrentStreak = 1;
                        }

                        // Update date to today
                        user.LastLoginDate = DateTime.UtcNow;

                        // Save updates
                        transaction.Set(userRef, user, SetOptions.MergeAll);
                    }
                }
            });
        }
        // For Streak ----------------------------------------------------------------------------------


        //* 
        //* for delete

     
        // --- NEW DELETE METHOD (Updated for Firestore) ---
        public async Task<bool> DeleteUserAsync(string userId)
        {
            // 1. Get reference to the user document
            DocumentReference userRef = _db.Collection("users").Document(userId);
            
            // 2. Check if user exists
            DocumentSnapshot snapshot = await userRef.GetSnapshotAsync();
            if (!snapshot.Exists)
            {
                return false;
            }

            // 3. Delete the user document
            // Note: In Firestore, this does NOT automatically delete subcollections or related documents.
            // If you have a separate "FlashcardSets" collection, those documents will remain unless you query and delete them here manually.
            await userRef.DeleteAsync();
            
            return true;
        }

        //* end for delete
        // For Streak ----------------------------------------------------------------------------------
       


        public async Task<User?> GetUserByIdAsync(string uid)
        {
            DocumentSnapshot snapshot = await _db.Collection("users").Document(uid).GetSnapshotAsync();
            if (snapshot.Exists)
            {
                return snapshot.ConvertTo<User>();
            }
            return null;
        }
    }   
}
