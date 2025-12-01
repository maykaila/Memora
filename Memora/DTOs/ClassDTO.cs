namespace Memora.DTOs
{
    public class ClassDto
    {
        public string ClassId { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        public string ClassCode { get; set; } = string.Empty;
        
        // This is the new field we need for the frontend
        public string TeacherName { get; set; } = string.Empty;
        
        // Optional: Good for the UI stats
        public int DeckCount { get; set; }
    }
}