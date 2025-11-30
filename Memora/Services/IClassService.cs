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
        
        // For the student side of classes
        Task<bool> JoinClassAsync(string studentId, string classCode);
        Task<IEnumerable<Class>> GetClassesForStudentAsync(string studentId);
        Task<Class?> GetClassByIdAsync(string classId);
        Task<List<User>> GetStudentsInClassAsync(string classId);
        Task<List<FlashcardSet>> GetDecksInClassAsync(string classId);
        Task<bool> AssignDeckToClassAsync(string classId, string deckId);
        Task<bool> UpdateClassAsync(string classId, string newName);
        Task<bool> DeleteClassAsync(string classId);
        Task<string> GetUserNameByIdAsync(string userId);
    }
}