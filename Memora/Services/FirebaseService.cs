using System;
using System.Threading.Tasks;
using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;

namespace Memora.Services
{
    public static class FirebaseService
    {
        private static bool _initialized = false;

        // Initialize Firebase once when the service is created
        public static void InitializeFirebase(string keyFilePath)
        {
            if (!_initialized)
            {
                FirebaseApp.Create(new AppOptions()
                {
                    Credential = GoogleCredential.FromFile("firebase-key.json")
                });

                _initialized = true;
                Console.WriteLine("✅ Firebase Admin initialized successfully.");
            }
        }

        // Verify ID token from frontend (Next.js)
        public static async Task<FirebaseToken> VerifyIdTokenAsync(string idToken)
        {
            try
            {
                var decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(idToken);
                return decodedToken;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Token verification failed: {ex.Message}");
                throw;
            }
        }

        // (Optional) Get user details from UID
        public static async Task<UserRecord> GetUserByUidAsync(string uid)
        {
            try
            {
                return await FirebaseAuth.DefaultInstance.GetUserAsync(uid);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error fetching user: {ex.Message}");
                throw;
            }
        }
    }
}
