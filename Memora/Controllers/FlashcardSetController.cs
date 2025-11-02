using Microsoft.AspNetCore.Mvc;
using FirebaseAdmin.Auth;
using Memora.Services;
using Memora.DTOs;

namespace Memora.Controllers
{
    [ApiController]
    [Route("api/flashcardsets")] // This is the URL: /api/flashcardsets
    public class FlashcardSetsController : ControllerBase
    {
        private readonly IFlashcardSetService _setService;
        private readonly FirebaseAuth _auth;

        // Inject your new service
        public FlashcardSetsController(IFlashcardSetService setService)
        {
            _setService = setService;
            _auth = FirebaseAuth.DefaultInstance;
        }

        // --- Helper: Gets the authenticated user's UID from their token ---
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


        [HttpPost] // POST /api/flashcardsets
        public async Task<IActionResult> CreateSet([FromBody] CreateFlashcardSetRequest request)
        {
            try
            {
                string? userId = await GetUserIdFromTokenAsync();
                if (userId == null)
                {
                    return Unauthorized(new { message = "Invalid or missing token." });
                }

                // Call your "brain"
                var newSet = await _setService.CreateSetAsync(userId, request);

                // Return a 201 Created status with the new set
                return CreatedAtAction(nameof(GetSet), new { setId = newSet.SetId }, newSet);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error.", error = ex.Message });
            }
        }

        [HttpGet("my-sets")] // GET /api/flashcardsets/my-sets
        public async Task<IActionResult> GetMySets()
        {
            try
            {
                string? userId = await GetUserIdFromTokenAsync();
                if (userId == null)
                {
                    return Unauthorized(new { message = "Invalid or missing token." });
                }

                var sets = await _setService.GetSetsForUserAsync(userId);
                return Ok(sets);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error.", error = ex.Message });
            }
        }
        
        // Placeholder for the CreatedAtAction
        [HttpGet("{setId}")] // GET /api/flashcardsets/{some-id}
        public IActionResult GetSet(string setId)
        {
            // You would build this method in your service
            // var set = await _setService.GetSetByIdAsync(setId);
            // return Ok(set);
            return Ok(new { message = $"Placeholder for set {setId}" });
        }
    }
}