using Memora.Models;
using System.Threading.Tasks;

namespace Memora.Services
{
    public interface IUserService
    {
        Task<User> CreateUserAsync(string uid, string username, string email, string role);
        
        //For Role ------------------------------
        Task<User?> GetUserAsync(string uid);
        //For Role ------------------------------

        //For Streak ----------------------------
        Task CheckInUserAsync(string uid);
        //For Streak ----------------------------

        Task<User?> GetUserByIdAsync(string uid);

        // Deletes the user
        Task<bool> DeleteUserAsync(string userId);

    }
}