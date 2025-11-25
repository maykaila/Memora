using Memora.Models;
using Memora.DTOs;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Memora.Services
{
    public interface IClassService
    {
        Task<Class> CreateClassAsync(string teacherId, CreateClassRequest request);
        Task<IEnumerable<Class>> GetClassesForTeacherAsync(string teacherId);
        
        // You will need this later for students to join
        Task<bool> JoinClassAsync(string studentId, string classCode);
    }
}