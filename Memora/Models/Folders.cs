using Google.Cloud.Firestore;
using System;
using System.Collections.Generic;

namespace Memora.Models
{
    [FirestoreData]
    public class Folder
    {
        [FirestoreProperty("folder_id")]
        public string FolderId { get; set; } = null!;

        [FirestoreProperty("user_id")]
        public string UserId { get; set; } = null!;

        [FirestoreProperty("title")]
        public string Title { get; set; } = null!;

        [FirestoreProperty("description")]
        public string? Description { get; set; }

        [FirestoreProperty("date_created")]
        public DateTime DateCreated { get; set; }

        // --- THE RELATIONSHIP ---
        // This list stores the IDs of the flashcard sets inside this folder.
        [FirestoreProperty("flashcard_set_ids")]
        public List<string> FlashcardSetIds { get; set; } = new List<string>();
        
        // Helper to calculate item count for the UI
        public int ItemCount => FlashcardSetIds.Count;
    }
}