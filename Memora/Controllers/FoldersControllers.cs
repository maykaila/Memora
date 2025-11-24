using Microsoft.AspNetCore.Mvc;
using FirebaseAdmin.Auth;
using Memora.Services;
using Memora.DTOs;
using System.Threading.Tasks;
using System;

namespace Memora.Controllers
{
    [ApiController]
    [Route("api/folders")]
    public class FoldersController : ControllerBase
    {
        private readonly IFolderService _folderService;
        private readonly FirebaseAuth _auth;

        public FoldersController(IFolderService folderService)
        {
            _folderService = folderService;
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
    }
}