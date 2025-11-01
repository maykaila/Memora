using Memora.Models; // <-- ADD THIS LINE
using System.Threading.Tasks;
public interface IUserService
{
    // Returns the newly created User object
    Task<User> CreateUserAsync(string uid, string username, string email);
}