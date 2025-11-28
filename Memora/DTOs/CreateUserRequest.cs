namespace Memora.DTOs
{
    public class CreateUserRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty; 
    }


    //** adding this class for your profile settings

    public class UpdateUserProfileRequest
    {
        public string DisplayName { get; set; } = string.Empty;
        public string PhotoUrl { get; set; } = string.Empty;
    }
}