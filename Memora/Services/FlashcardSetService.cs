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
            // This defines the collection name once. 
            // We will reuse _setsCollection everywhere to avoid typos.
            _setsCollection = _db.Collection("flashcardSets");
        }

        public async Task<FlashcardSet> CreateSetAsync(string userId, CreateFlashcardSetRequest request)
        {
            DocumentReference docRef = _setsCollection.Document();

            var newSet = new FlashcardSet
            {
                SetId = docRef.Id,
                UserId = userId,
                Title = request.Title,
                Description = request.Description,
                Visibility = request.Visibility,
                DateCreated = Timestamp.FromDateTime(DateTime.UtcNow),
                LastUpdated = Timestamp.FromDateTime(DateTime.UtcNow),
                TagIds = request.TagIds ?? new List<string>()
            };

            await docRef.SetAsync(newSet);
            return newSet;
        }

        public async Task<IEnumerable<FlashcardSet>> GetSetsForUserAsync(string userId)
        {
            Query query = _setsCollection.WhereEqualTo("user_id", userId);
            QuerySnapshot snapshot = await query.GetSnapshotAsync();

            List<FlashcardSet> sets = new List<FlashcardSet>();
            foreach (DocumentSnapshot document in snapshot.Documents)
            {
                sets.Add(document.ConvertTo<FlashcardSet>());
            }

            return sets;
        }

        // --- FIX IS HERE ---
        public async Task<List<FlashcardSet>> GetPublicSetsAsync()
        {
            // 1. Use _setsCollection (it is already initialized to "flashcardSets")
            // 2. Query where visibility is true
            Query query = _setsCollection.WhereEqualTo("visibility", true);
            
            QuerySnapshot snapshot = await query.GetSnapshotAsync();
            
            var sets = new List<FlashcardSet>();
            
            foreach (DocumentSnapshot document in snapshot.Documents)
            {
                if (document.Exists)
                {
                    var set = document.ConvertTo<FlashcardSet>();
                    set.SetId = document.Id; 
                    sets.Add(set);
                }
            }
            
            return sets;
        }
    }
}