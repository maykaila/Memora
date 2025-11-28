using Memora.Models;
using Memora.DTOs;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Memora.Services
{
    public interface IFolderService
    {
        Task<Folder> CreateFolderAsync(string userId, CreateFolderRequest request);
        Task<IEnumerable<Folder>> GetFoldersForUserAsync(string userId);
        Task<Folder?> GetFolderByIdAsync(string folderId);
        
        // --- FOLDER MANAGEMENT ---
        Task<bool> AddSetToFolderAsync(string folderId, string setId, string userId);
        Task<bool> RemoveSetFromFolderAsync(string folderId, string setId, string userId);
        Task<bool> UpdateFolderAsync(string folderId, string userId, string newTitle, string? newDescription);
        Task<bool> DeleteFolderAsync(string folderId, string userId);
    }
}