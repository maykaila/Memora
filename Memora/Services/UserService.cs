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
    }   
}