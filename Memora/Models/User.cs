using Google.Cloud.Firestore;

namespace Memora.Models
{
    [FirestoreData]
    public class User
    {
        // Use null-forgiving operator for required fields
        [FirestoreProperty("user_id")]
        public string UserId { get; set; } = null!;

        [FirestoreProperty("username")]
        public string Username { get; set; } = null!;

        [FirestoreProperty("email")]
        public string Email { get; set; } = null!;

        // ProfilePic can be null, so we make it nullable
        [FirestoreProperty("profile_pic")]
        public string? ProfilePic { get; set; }

        [FirestoreProperty("date_created")]
        public Timestamp DateCreated { get; set; }

        [FirestoreProperty("role")]
        public string? Role { get; set; }
    }
}