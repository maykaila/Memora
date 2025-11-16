using System.ComponentModel.DataAnnotations;

namespace Memora.DTOs
{
    // This defines what a single card looks like when
    // it arrives from the frontend.
    public class CardDto
    {
        [Required]
        public string Term { get; set; } = null!;

        [Required]
        public string Definition { get; set; } = null!;
        
        public string? ImageUrl { get; set; }
    }
}