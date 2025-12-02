using Microsoft.AspNetCore.Mvc;
using FirebaseAdmin.Auth;
using Memora.Services;
using Memora.DTOs;

namespace Memora.Controllers
{
    [ApiController]
    [Route("api/flashcardsets")]
    public class FlashcardSetsController : ControllerBase
    {
        private readonly IFlashcardSetService _setService;
        private readonly FirebaseAuth _auth;

        public FlashcardSetsController(IFlashcardSetService setService)
        {
            _setService = setService;
            _auth = FirebaseAuth.DefaultInstance;
        }

        private async Task<string?> GetUserIdFromTokenAsync()
        {
            if (Request.Headers.TryGetValue("Authorization", out var authHeader))
            {
                var headerStr = authHeader.ToString();
                if (string.IsNullOrEmpty(headerStr) || !headerStr.StartsWith("Bearer "))
                    return null;

                string idToken = headerStr.Split(" ")[1];
                try
                {
                    FirebaseToken decodedToken = await _auth.VerifyIdTokenAsync(idToken);
                    return decodedToken.Uid;
                }
                catch
                {
                    return null;
                }
            }
            return null;
        }

        [HttpGet]
        public async Task<IActionResult> GetPublicSets()
        {
            var sets = await _setService.GetPublicSetsAsync();
            return Ok(sets);
        }

        [HttpPost]
        public async Task<IActionResult> CreateSet([FromBody] CreateFlashcardSetRequest request)
        {
            string? userId = await GetUserIdFromTokenAsync();
            if (userId == null)
                return Unauthorized(new { message = "Invalid or missing token." });

            string? username = await GetUsernameFromTokenAsync();
            if (username == null)
                return Unauthorized(new { message = "User must have a username claim." });

            var newSet = await _setService.CreateSetAsync(userId, request);

            return CreatedAtAction(nameof(GetSet), new { setId = newSet.SetId }, newSet);
        }

        private async Task<string?> GetUsernameFromTokenAsync()
        {
            var token = HttpContext.Request.Headers["Authorization"].ToString()?.Replace("Bearer ", "");
            if (string.IsNullOrEmpty(token))
                return null;

            var decoded = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(token);
            var claims = decoded.Claims;

            if (claims.ContainsKey("username"))
                return claims["username"]?.ToString();

            if (claims.ContainsKey("name"))
                return claims["name"]?.ToString();

            if (claims.ContainsKey("email"))
                return claims["email"]?.ToString();

            return null;
        }

        [HttpGet("my-sets")]
        public async Task<IActionResult> GetMySets()
        {
            string? userId = await GetUserIdFromTokenAsync();
            if (userId == null)
                return Unauthorized();

            var sets = await _setService.GetSetsForUserAsync(userId);
            return Ok(sets);
        }

        // ORDER FIX (important!)
        [HttpGet("{setId}/cards")]
        public async Task<IActionResult> GetCards(string setId)
        {
            var cards = await _setService.GetCardsForSetAsync(setId);
            if (cards == null) return NotFound();
            return Ok(cards);
        }

        // Only ONE GetSet
        [HttpGet("{setId}")]
        public async Task<IActionResult> GetSet(string setId)
        {
            var set = await _setService.GetSetByIdAsync(setId);
            if (set == null) return NotFound();
            return Ok(set);
        }

        [HttpPut("{setId}")]
        public async Task<IActionResult> UpdateFlashcardSet(string setId, [FromBody] UpdateFlashcardSetDto dto)
        {
            string? userId = await GetUserIdFromTokenAsync();
            if (userId == null)
                return Unauthorized();

            var updatedSet = await _setService.UpdateSetAsync(userId, setId, dto);

            if (updatedSet == null)
                return NotFound(new { message = "Set not found or permission denied." });

            return Ok(updatedSet);
        }

        [HttpDelete("{setId}")]
        public async Task<IActionResult> DeleteSet(string setId)
        {
            string? userId = await GetUserIdFromTokenAsync();
            if (userId == null) return Unauthorized();

            bool success = await _setService.DeleteSetAsync(setId, userId);

            if (!success)
                return NotFound();

            return Ok(new { message = "Flashcard set deleted successfully." });
        }
    }
}
