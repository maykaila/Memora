using Google.Cloud.Firestore;

namespace Memora.Models
{
    [FirestoreData]
    public abstract class Temp_User // 'abstract' prevents creating a generic user
    {
        [FirestoreProperty("user_id")]
        public string UserId { get; set; } = null!;

        [FirestoreProperty("username")]
        public string Username { get; set; } = null!;

        [FirestoreProperty("email")]
        public string Email { get; set; } = null!;

        [FirestoreProperty("profile_pic")]
        public string? ProfilePic { get; set; }

        [FirestoreProperty("role")]
        public string? Role { get; set; }

        [FirestoreProperty("date_created")]
        public Timestamp DateCreated { get; set; }
    }
}