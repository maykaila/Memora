using Memora.Models;
using System.Threading.Tasks;

namespace Memora.Services
{
    public interface IUserService
    {
        Task<User> CreateUserAsync(string uid, string username, string email, string role);
        
        // FIX: Return type changed to Task<User?>
        Task<User?> GetUserAsync(string uid);
    }
}