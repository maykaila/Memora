using Memora.Models;
using Memora.DTOs;

namespace Memora.Services
{
    public interface IFlashcardSetService
    {
        // Creates a new flashcard set
        Task<FlashcardSet> CreateSetAsync(string userId, CreateFlashcardSetRequest request);

        // Gets all sets for a specific user
        Task<IEnumerable<FlashcardSet>> GetSetsForUserAsync(string userId);

        // (You can add other methods here later, like GetSetById, UpdateSet, DeleteSet)
        Task<List<FlashcardSet>> GetPublicSetsAsync();

        Task<bool> DeleteSetAsync(string setId, string userId);
    }
}