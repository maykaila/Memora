using Google.Cloud.Firestore;
using System;
using System.Collections.Generic;

namespace Memora.Models
{
    [FirestoreData]
    public class Class
    {
        [FirestoreProperty("class_id")]
        public string ClassId { get; set; } = null!;

        [FirestoreProperty("teacher_id")]
        public string TeacherId { get; set; } = null!;

        [FirestoreProperty("class_name")]
        public string ClassName { get; set; } = null!;

        // --- THIS IS THE CODE ---
        // The unique code students will type to join
        [FirestoreProperty("class_code")]
        public string ClassCode { get; set; } = null!;

        [FirestoreProperty("date_created")]
        public DateTime DateCreated { get; set; }

        // List of Student UIDs who have joined
        [FirestoreProperty("student_ids")]
        public List<string> StudentIds { get; set; } = new List<string>();
    }
}