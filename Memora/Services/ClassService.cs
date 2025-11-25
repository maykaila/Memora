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

        
    }
}