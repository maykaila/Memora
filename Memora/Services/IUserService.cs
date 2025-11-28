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
<<<<<<< HEAD
          }
=======

        Task<User?> GetUserByIdAsync(string uid);
    }
>>>>>>> fd2a82b4f5b96610b9f4ac452cde9f17901b678e
}