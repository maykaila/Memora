using System.ComponentModel.DataAnnotations;

namespace Memora.DTOs
{
    public class CreateClassRequest
    {
        [Required]
        public string ClassName { get; set; } = string.Empty;
    }
}