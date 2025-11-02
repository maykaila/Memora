using System.ComponentModel.DataAnnotations;

namespace Memora.DTOs
{
    public class CreateFlashcardSetRequest
    {
        [Required]
        public string Title { get; set; } = null!;

        public string? Description { get; set; }

        [Required]
        public bool Visibility { get; set; } = false;
        
        // The user can send an optional list of Tag IDs
        public List<string>? TagIds { get; set; }
    }
}