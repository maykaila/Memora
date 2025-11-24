using Google.Cloud.Firestore;
using Memora.Models;
using Memora.DTOs;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace Memora.Services
{
    public class FolderService : IFolderService
    {
        private readonly FirestoreDb _db;
        private readonly CollectionReference _foldersCollection;

        public FolderService(FirestoreDb db)
        {
            _db = db;
            _foldersCollection = _db.Collection("folders");
        }

        public async Task<Folder> CreateFolderAsync(string userId, CreateFolderRequest request)
        {
            DocumentReference docRef = _foldersCollection.Document();

            var newFolder = new Folder
            {
                FolderId = docRef.Id,
                UserId = userId,
                Title = request.Title,
                Description = request.Description,
                DateCreated = DateTime.UtcNow,
                FlashcardSetIds = new List<string>() // Empty initially
            };

            await docRef.SetAsync(newFolder);
            return newFolder;
        }

        public async Task<IEnumerable<Folder>> GetFoldersForUserAsync(string userId)
        {
            Query query = _foldersCollection.WhereEqualTo("user_id", userId);
            QuerySnapshot snapshot = await query.GetSnapshotAsync();
            
            return snapshot.Documents.Select(doc => doc.ConvertTo<Folder>()).ToList();
        }

        public async Task<Folder?> GetFolderByIdAsync(string folderId)
        {
            DocumentSnapshot snapshot = await _foldersCollection.Document(folderId).GetSnapshotAsync();
            return snapshot.Exists ? snapshot.ConvertTo<Folder>() : null;
        }

        // --- ADD A SET TO A FOLDER ---
        public async Task<bool> AddSetToFolderAsync(string folderId, string setId, string userId)
        {
            DocumentReference folderRef = _foldersCollection.Document(folderId);
            DocumentSnapshot snapshot = await folderRef.GetSnapshotAsync();

            if (!snapshot.Exists) return false;

            Folder folder = snapshot.ConvertTo<Folder>();
            if (folder.UserId != userId) return false; // Security check

            // Using ArrayUnion ensures we don't add duplicates
            await folderRef.UpdateAsync("flashcard_set_ids", FieldValue.ArrayUnion(setId));
            return true;
        }

        // --- REMOVE A SET FROM A FOLDER ---
        public async Task<bool> RemoveSetFromFolderAsync(string folderId, string setId, string userId)
        {
            DocumentReference folderRef = _foldersCollection.Document(folderId);
            DocumentSnapshot snapshot = await folderRef.GetSnapshotAsync();

            if (!snapshot.Exists) return false;

            Folder folder = snapshot.ConvertTo<Folder>();
            if (folder.UserId != userId) return false; // Security check

            await folderRef.UpdateAsync("flashcard_set_ids", FieldValue.ArrayRemove(setId));
            return true;
        }
    }
}