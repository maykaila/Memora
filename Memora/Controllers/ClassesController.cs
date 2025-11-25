using Microsoft.AspNetCore.Mvc;
using FirebaseAdmin.Auth;
using Memora.Services;
using Memora.DTOs;
using System.Threading.Tasks;
using System;

namespace Memora.Controllers
{
    [ApiController]
    [Route("api/classes")]
    public class ClassesController : ControllerBase
    {
        private readonly IClassService _classService;
        private readonly FirebaseAuth _auth;

        public ClassesController(IClassService classService)
        {
            _classService = classService;
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

        // Teacher creates a class -> Gets back the code
        [HttpPost] 
        public async Task<IActionResult> CreateClass([FromBody] CreateClassRequest request)
        {
            try
            {
                string? userId = await GetUserIdFromTokenAsync();
                if (userId == null) return Unauthorized();

                // Check role here if you want (ensure only teachers can create)
                
                var newClass = await _classService.CreateClassAsync(userId, request);
                return Ok(newClass); // The response contains the ClassCode!
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // Teacher gets their classes
        [HttpGet("teaching")]
        public async Task<IActionResult> GetMyClasses()
        {
            try
            {
                string? userId = await GetUserIdFromTokenAsync();
                if (userId == null) return Unauthorized();

                var classes = await _classService.GetClassesForTeacherAsync(userId);
                return Ok(classes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // Student joins a class
        [HttpPost("join/{classCode}")]
        public async Task<IActionResult> JoinClass(string classCode)
        {
            try
            {
                string? userId = await GetUserIdFromTokenAsync();
                if (userId == null) return Unauthorized();

                bool success = await _classService.JoinClassAsync(userId, classCode);
                
                if (success) return Ok(new { message = "Successfully joined class!" });
                return NotFound(new { message = "Invalid class code." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("joined")]
        public async Task<IActionResult> GetJoinedClasses()
        {
            try
            {
                string? userId = await GetUserIdFromTokenAsync();
                if (userId == null) return Unauthorized();

                // This calls the service method to get classes where student_ids contains userId
                var classes = await _classService.GetClassesForStudentAsync(userId);
                return Ok(classes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}