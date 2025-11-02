using Google.Cloud.Firestore;

// public enum VisibilityStatus
// {
//     Private,  // 0
//     Public,   // 1
//     Unlisted  // 2
// } // for when we decide to change the visibility to enum

namespace Memora.Models
{
    [FirestoreData]
    public class FlashcardSet
    {
        [FirestoreProperty("set_id")]
        public string SetId { get; set; } = null!; // Will be set to the Document ID

        [FirestoreProperty("user_id")]
        public string UserId { get; set; } = null!; // Foreign key to User

        [FirestoreProperty("title")]
        public string Title { get; set; } = null!;

        [FirestoreProperty("description")]
        public string? Description { get; set; } // Nullable

        [FirestoreProperty("visibility")]
        public bool Visibility { get; set; } = false;

        [FirestoreProperty("date_created")]
        public Timestamp DateCreated { get; set; }

        [FirestoreProperty("last_updated")]
        public Timestamp LastUpdated { get; set; }

        // This is the NoSQL way to handle your Set_Tags requirement
        [FirestoreProperty("tag_ids")]
        public List<string> TagIds { get; set; } = new List<string>();
    }
}