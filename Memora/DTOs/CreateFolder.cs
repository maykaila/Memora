using System.ComponentModel.DataAnnotations;

namespace Memora.DTOs
{
    public class CreateFolderRequest
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }
    }
}