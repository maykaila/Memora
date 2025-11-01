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

        // This constructor receives the 'FirestoreDb' instance 
        // that you registered as a singleton in Program.cs
        public UserService(FirestoreDb db)
        {
            _db = db;
        }

        public async Task<User> CreateUserAsync(string uid, string username, string email)
        {
            // 1. Create your C# User object
            var newUser = new User
            {
                UserId = uid,
                Username = username,
                Email = email,
                ProfilePic = null, 
                DateCreated = Timestamp.FromDateTime(DateTime.UtcNow)
            };

            // 2. Get the collection reference
            CollectionReference usersRef = _db.Collection("users");

            // 3. Save to Firestore, using the 'uid' as the document ID
            await usersRef.Document(uid).SetAsync(newUser);

            return newUser;
        }
    }   
}