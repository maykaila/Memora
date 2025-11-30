using Google.Cloud.Firestore;

namespace Memora.Models
{
    [FirestoreData]
    public class Student : Temp_User
    {
        // These properties ONLY exist for RegularUsers
        [FirestoreProperty("current_streak")]
        public int CurrentStreak { get; set; } = 0;

        [FirestoreProperty("last_login_date")]
        public DateTime? LastLoginDate { get; set; }
    }

    [FirestoreData]
    public class Teacher : User
    {
        // Currently empty, but ready for future teacher-specific features!
        // e.g., public string Department { get; set; }
    }
}