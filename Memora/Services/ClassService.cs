using Google.Cloud.Firestore;
using Memora.Models;
using Memora.DTOs;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace Memora.Services
{
    public class ClassService : IClassService
    {
        private readonly FirestoreDb _db;
        private readonly CollectionReference _classesCollection;
        private static Random _random = new Random();

        public ClassService(FirestoreDb db)
        {
            _db = db;
            _classesCollection = _db.Collection("classes");
        }

        // --- HELPER: GENERATE RANDOM CODE ---
        private string GenerateClassCode(int length = 6)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[_random.Next(s.Length)]).ToArray());
        }

        public async Task<Class> CreateClassAsync(string teacherId, CreateClassRequest request)
        {
            DocumentReference docRef = _classesCollection.Document();
            
            // Generate a code (e.g., "X9A2B1")
            string uniqueCode = GenerateClassCode();

            // OPTIONAL: In a real app, you would query DB here to make sure 
            // the code doesn't already exist, but for now, it's statistically safe.

            var newClass = new Class
            {
                ClassId = docRef.Id,
                TeacherId = teacherId,
                ClassName = request.ClassName,
                ClassCode = uniqueCode, // <--- SAVING THE GENERATED CODE
                DateCreated = DateTime.UtcNow,
                StudentIds = new List<string>()
            };

            await docRef.SetAsync(newClass);
            return newClass;
        }

        public async Task<IEnumerable<Class>> GetClassesForTeacherAsync(string teacherId)
        {
            Query query = _classesCollection.WhereEqualTo("teacher_id", teacherId);
            QuerySnapshot snapshot = await query.GetSnapshotAsync();
            return snapshot.Documents.Select(doc => doc.ConvertTo<Class>()).ToList();
        }

        // Logic for a student to join using the code
        public async Task<bool> JoinClassAsync(string studentId, string classCode)
        {
            // 1. Find class by code
            Query query = _classesCollection.WhereEqualTo("class_code", classCode.ToUpper());
            QuerySnapshot snapshot = await query.GetSnapshotAsync();

            if (snapshot.Count == 0) return false; // Code invalid

            DocumentSnapshot classDoc = snapshot.Documents[0];
            
            // 2. Add student ID to the list
            await classDoc.Reference.UpdateAsync("student_ids", FieldValue.ArrayUnion(studentId));
            
            return true;
        }

        public async Task<IEnumerable<Class>> GetClassesForStudentAsync(string studentId)
        {
            // Firestore "array-contains" query
            // Finds documents where the 'student_ids' array contains 'studentId'
            Query query = _classesCollection.WhereArrayContains("student_ids", studentId);
            QuerySnapshot snapshot = await query.GetSnapshotAsync();

            return snapshot.Documents.Select(doc => doc.ConvertTo<Class>()).ToList();
        }

        // 1. Get Single Class
        public async Task<Class?> GetClassByIdAsync(string classId)
        {
            DocumentSnapshot snap = await _db.Collection("classes").Document(classId).GetSnapshotAsync();
            if (snap.Exists)
            {
                return snap.ConvertTo<Class>();
            }
            return null;
        }

        // 2. Get Students
        public async Task<List<User>> GetStudentsInClassAsync(string classId)
        {
            // First get the class to see the StudentIds list
            Class? cls = await GetClassByIdAsync(classId);
            if (cls == null || cls.StudentIds.Count == 0) return new List<User>();

            List<User> students = new List<User>();

            // Fetch each student. 
            // Optimization: In a real app, you might use 'WhereIn' if list < 10 items, 
            // or store basic student info inside the class document to avoid these reads.
            foreach (string studentId in cls.StudentIds)
            {
                DocumentSnapshot userSnap = await _db.Collection("users").Document(studentId).GetSnapshotAsync();
                if (userSnap.Exists)
                {
                    students.Add(userSnap.ConvertTo<User>());
                }
            }
            return students;
        }

        // 3. Get Decks (Assignments)
        public async Task<List<FlashcardSet>> GetDecksInClassAsync(string classId)
        {
            // NOTE: This assumes you added 'AssignmentIds' to your Class model.
            // If you haven't, this will just return empty for now.
            
            /* To make this work, add this to Class.cs: 
               [FirestoreProperty("assignment_ids")]
               public List<string> AssignmentIds { get; set; } = new List<string>();
            */

            Class? cls = await GetClassByIdAsync(classId);
            // Check if property exists (it might fail if you haven't updated Model yet)
            // For now, let's return empty to prevent crash if you haven't updated Model
            return new List<FlashcardSet>(); 
            
            /* UNCOMMENT THIS ONCE YOU UPDATE CLASS MODEL
            if (cls == null || cls.AssignmentIds == null || cls.AssignmentIds.Count == 0) 
                return new List<FlashcardSet>();

            List<FlashcardSet> decks = new List<FlashcardSet>();
            foreach (string deckId in cls.AssignmentIds)
            {
                DocumentSnapshot deckSnap = await _db.Collection("flashcardSets").Document(deckId).GetSnapshotAsync();
                if (deckSnap.Exists)
                {
                    decks.Add(deckSnap.ConvertTo<FlashcardSet>());
                }
            }
            return decks;
            */
        }

        
    }
}