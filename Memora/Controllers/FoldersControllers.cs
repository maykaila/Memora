using Microsoft.AspNetCore.Mvc;
using FirebaseAdmin.Auth;
using Memora.Services;
using Memora.DTOs;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;

namespace Memora.Controllers
{
    [ApiController]
    [Route("api/folders")]
    public class FoldersController : ControllerBase
    {
        private readonly IFolderService _folderService;
        private readonly IFlashcardSetService _flashcardSetService; // Injected Service
        private readonly FirebaseAuth _auth;

        // Updated Constructor to accept IFlashcardSetService
        public FoldersController(IFolderService folderService, IFlashcardSetService flashcardSetService)
        {
            _folderService = folderService;
            _flashcardSetService = flashcardSetService;
            _auth = FirebaseAuth.DefaultInstance;
        }

        private async Task<string?> GetUserIdFromTokenAsync()
        {
            if (Request.Headers.TryGetValue("Authorization", out var authHeader))
            {
                string idToken = authHeader.ToString().Split(" ")[1];
                FirebaseToken decodedToken = await _auth.VerifyIdTokenAsync(idToken);
                return decodedToken.Uid;
            }
            return null;
        }

        [HttpPost] // Create Folder
        public async Task<IActionResult> CreateFolder([FromBody] CreateFolderRequest request)
        {
            try
            {
                string? userId = await GetUserIdFromTokenAsync();
                if (userId == null) return Unauthorized();

                var folder = await _folderService.CreateFolderAsync(userId, request);
                return Ok(folder);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("my-folders")] // Get User's Folders
        public async Task<IActionResult> GetMyFolders()
        {
            try
            {
                string? userId = await GetUserIdFromTokenAsync();
                if (userId == null) return Unauthorized();

                var folders = await _folderService.GetFoldersForUserAsync(userId);
                return Ok(folders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // POST api/folders/{folderId}/add-set/{setId}
        [HttpPost("{folderId}/add-set/{setId}")]
        public async Task<IActionResult> AddSetToFolder(string folderId, string setId)
        {
            try
            {
                string? userId = await GetUserIdFromTokenAsync();
                if (userId == null) return Unauthorized();

                bool success = await _folderService.AddSetToFolderAsync(folderId, setId, userId);
                if (!success) return NotFound("Folder not found or access denied.");

                return Ok(new { message = "Set added to folder." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // --- NEW MISSING ENDPOINTS BELOW ---

        // 1. Get Single Folder Details (Title, Description, Color)
        [HttpGet("{folderId}")]
        public async Task<IActionResult> GetFolderById(string folderId)
        {
            try
            {
                string? userId = await GetUserIdFromTokenAsync();
                if (userId == null) return Unauthorized();

                var folder = await _folderService.GetFolderByIdAsync(folderId);
                
                if (folder == null) return NotFound("Folder not found");
                if (folder.UserId != userId) return Forbid(); // Security check

                return Ok(folder);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // 2. Get the actual Decks inside the Folder
        [HttpGet("{folderId}/decks")]
        public async Task<IActionResult> GetDecksInFolder(string folderId)
        {
            try
            {
                string? userId = await GetUserIdFromTokenAsync();
                if (userId == null) return Unauthorized();

                // Get folder first
                var folder = await _folderService.GetFolderByIdAsync(folderId);
                if (folder == null || folder.UserId != userId) return NotFound("Folder not found");

                var decks = new List<object>();

                if (folder.FlashcardSetIds != null)
                {
                    foreach (var setId in folder.FlashcardSetIds)
                    {
                        // Use the injected service to get full deck details
                        var set = await _flashcardSetService.GetSetByIdAsync(setId);
                        if (set != null)
                        {
                            decks.Add(new {
                                setId = set.SetId,
                                title = set.Title,
                                dateCreated = set.DateCreated
                            });
                        }
                    }
                }
                return Ok(decks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // 1. UPDATE FOLDER (Rename)
        [HttpPut("{folderId}")]
        public async Task<IActionResult> UpdateFolder(string folderId, [FromBody] CreateFolderRequest request)
        {
            try {
                string? userId = await GetUserIdFromTokenAsync();
                if (userId == null) return Unauthorized();

                bool success = await _folderService.UpdateFolderAsync(folderId, userId, request.Title, request.Description);
                if (!success) return NotFound("Folder not found or access denied.");

                return Ok(new { message = "Folder updated successfully" });
            } catch (Exception ex) { return StatusCode(500, new { message = ex.Message }); }
        }

        // 2. DELETE FOLDER
        [HttpDelete("{folderId}")]
        public async Task<IActionResult> DeleteFolder(string folderId)
        {
            try {
                string? userId = await GetUserIdFromTokenAsync();
                if (userId == null) return Unauthorized();

                bool success = await _folderService.DeleteFolderAsync(folderId, userId);
                if (!success) return NotFound("Folder not found or access denied.");

                return Ok(new { message = "Folder deleted successfully" });
            } catch (Exception ex) { return StatusCode(500, new { message = ex.Message }); }
        }

        // 3. REMOVE DECK FROM FOLDER
        [HttpDelete("{folderId}/sets/{setId}")]
        public async Task<IActionResult> RemoveSetFromFolder(string folderId, string setId)
        {
            try {
                string? userId = await GetUserIdFromTokenAsync();
                if (userId == null) return Unauthorized();

                bool success = await _folderService.RemoveSetFromFolderAsync(folderId, setId, userId);
                if (!success) return NotFound("Folder not found or access denied.");

                return Ok(new { message = "Set removed from folder" });
            } catch (Exception ex) { return StatusCode(500, new { message = ex.Message }); }
        }
    }
}