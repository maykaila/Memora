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

        public async Task<FlashcardSet> CreateSetAsync(string userId, string displayName, CreateFlashcardSetRequest request)
        {
            DocumentReference docRef = _setsCollection.Document();

            var newSet = new FlashcardSet
            {
                SetId = docRef.Id,
                UserId = userId,
                CreatedBy = displayName,
                Title = request.Title,
                Description = request.Description,
                Visibility = request.Visibility,
                DateCreated = DateTime.UtcNow,
                LastUpdated = DateTime.UtcNow,
                TagIds = request.TagIds ?? new List<string>()
            };

            // 1. Save the main FlashcardSet document
            await docRef.SetAsync(newSet);
            
            // 2. Add logic to save the individual flashcards to a subcollection
            CollectionReference cardsCollection = docRef.Collection("flashcards");
            
            // We can use a WriteBatch for efficiency and atomicity (all or nothing)
            WriteBatch batch = _db.StartBatch(); 

            foreach (var cardDto in request.Cards)
            {
                DocumentReference cardDocRef = cardsCollection.Document();
                var newCard = new Flashcard
                {
                    CardId = cardDocRef.Id,
                    Term = cardDto.Term,
                    Definition = cardDto.Definition,
                    ImageUrl = cardDto.ImageUrl,
                    DateCreated = DateTime.UtcNow
                };
                
                // Add the flashcard to the batch
                batch.Set(cardDocRef, newCard); 
            }
            
            // Commit all card saves together
            await batch.CommitAsync();
            
            // The main set and all cards are now saved.
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

        public async Task<bool> DeleteSetAsync(string setId, string userId)
        {
            DocumentReference setDocRef = _setsCollection.Document(setId);
            DocumentSnapshot snapshot = await setDocRef.GetSnapshotAsync();

            if (!snapshot.Exists) return false;

            // Check ownership
            FlashcardSet set = snapshot.ConvertTo<FlashcardSet>();
            if (set.UserId != userId) 
            {
                // User tries to delete someone else's deck -> Fail
                return false; 
            }

            // 1. We must delete all flashcards in the subcollection first
            CollectionReference cardsCollection = setDocRef.Collection("flashcards");
            QuerySnapshot cardsSnapshot = await cardsCollection.GetSnapshotAsync();

            WriteBatch batch = _db.StartBatch();

            foreach (DocumentSnapshot cardDoc in cardsSnapshot.Documents)
            {
                batch.Delete(cardDoc.Reference);
            }

            // 2. Delete the main set document
            batch.Delete(setDocRef);

            // 3. Commit the batch delete
            await batch.CommitAsync();

            return true;
        }

        public async Task<FlashcardSet?> GetSetByIdAsync(string setId)
        {
            DocumentSnapshot snapshot = await _setsCollection.Document(setId).GetSnapshotAsync();
            
            if (snapshot.Exists)
            {
                return snapshot.ConvertTo<FlashcardSet>();
            }
            
            return null;
        }
    }
}