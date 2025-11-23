using Google.Cloud.Firestore;

namespace Memora.Models
{
    [FirestoreData]
    public class Flashcard
    {
        [FirestoreProperty("card_id")]
        public string CardId { get; set; } = null!; // Document ID

        // We don't need set_id here because this card will live
        // in a subcollection *inside* a FlashcardSet document.
        // The path itself tells us the set_id.

        [FirestoreProperty("term")]
        public string Term { get; set; } = null!;

        [FirestoreProperty("definition")]
        public string Definition { get; set; } = null!;

        [FirestoreProperty("image_url")]
        public string? ImageUrl { get; set; } // Nullable

        [FirestoreProperty("date_created")]
        public DateTime DateCreated { get; set; }
    }
}
