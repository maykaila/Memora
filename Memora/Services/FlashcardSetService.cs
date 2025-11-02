using Google.Cloud.Firestore;
using Memora.Models;
using Memora.DTOs;

namespace Memora.Services
{
    public class FlashcardSetService : IFlashcardSetService
    {
        private readonly FirestoreDb _db;
        private readonly CollectionReference _setsCollection;

        // Get the DB via Dependency Injection
        public FlashcardSetService(FirestoreDb db)
        {
            _db = db;
            _setsCollection = _db.Collection("flashcardSets");
        }

        public async Task<FlashcardSet> CreateSetAsync(string userId, CreateFlashcardSetRequest request)
        {
            // 1. Create a new document reference to get a unique ID
            DocumentReference docRef = _setsCollection.Document();

            // 2. Create your C# Model object
            var newSet = new FlashcardSet
            {
                SetId = docRef.Id,
                UserId = userId, // Set the owner
                Title = request.Title,
                Description = request.Description,
                Visibility = request.Visibility,
                DateCreated = Timestamp.FromDateTime(DateTime.UtcNow),
                LastUpdated = Timestamp.FromDateTime(DateTime.UtcNow),
                TagIds = request.TagIds ?? new List<string>() // Handle null list
            };

            // 3. Save the document to Firestore
            await docRef.SetAsync(newSet);

            return newSet;
        }

        public async Task<IEnumerable<FlashcardSet>> GetSetsForUserAsync(string userId)
        {
            // Create a query to find all sets where 'user_id' matches
            Query query = _setsCollection.WhereEqualTo("user_id", userId);

            QuerySnapshot snapshot = await query.GetSnapshotAsync();

            List<FlashcardSet> sets = new List<FlashcardSet>();
            foreach (DocumentSnapshot document in snapshot.Documents)
            {
                sets.Add(document.ConvertTo<FlashcardSet>());
            }

            return sets;
        }
    }
}