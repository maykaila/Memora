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

        [FirestoreProperty("role")]
        public string? Role { get; set; }

        [FirestoreProperty("date_created")]
        public Timestamp DateCreated { get; set; }

        // For Streak ----------------------------------
        [FirestoreProperty("current_streak")]
        public int CurrentStreak { get; set; } = 0;

        [FirestoreProperty("last_login_date")]
        public DateTime? LastLoginDate { get; set; } 
        // For Streak ----------------------------------
    }
}