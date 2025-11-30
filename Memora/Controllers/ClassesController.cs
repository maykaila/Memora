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

        // 1. Create Class
        [HttpPost] 
        public async Task<IActionResult> CreateClass([FromBody] CreateClassRequest request)
        {
            try
            {
                string? userId = await GetUserIdFromTokenAsync();
                if (userId == null) return Unauthorized();
                var newClass = await _classService.CreateClassAsync(userId, request);
                return Ok(newClass);
            }
            catch (Exception ex) { return StatusCode(500, new { message = ex.Message }); }
        }

        // 2. Get Teacher's Classes
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
            catch (Exception ex) { return StatusCode(500, new { message = ex.Message }); }
        }

        // 3. Join Class
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
            catch (Exception ex) { return StatusCode(500, new { message = ex.Message }); }
        }

        // --- NEW ENDPOINTS FOR CLASS DETAILS PAGE ---

        // 4. Get Single Class Details
        [HttpGet("{classId}")]
        public async Task<IActionResult> GetClassById(string classId)
        {
            try
            {
                string? userId = await GetUserIdFromTokenAsync();
                if (userId == null) return Unauthorized();

                var classObj = await _classService.GetClassByIdAsync(classId);
                if (classObj == null) return NotFound(new { message = "Class not found" });

                return Ok(classObj);
            }
            catch (Exception ex) { return StatusCode(500, new { message = ex.Message }); }
        }

        // 5. Get Students in Class
        [HttpGet("{classId}/students")]
        public async Task<IActionResult> GetStudentsInClass(string classId)
        {
            try
            {
                string? userId = await GetUserIdFromTokenAsync();
                if (userId == null) return Unauthorized();

                var students = await _classService.GetStudentsInClassAsync(classId);
                return Ok(students);
            }
            catch (Exception ex) { return StatusCode(500, new { message = ex.Message }); }
        }

        // 6. Get Decks (Assignments) in Class
        [HttpGet("{classId}/decks")]
        public async Task<IActionResult> GetDecksInClass(string classId)
        {
            try
            {
                string? userId = await GetUserIdFromTokenAsync();
                if (userId == null) return Unauthorized();

                var decks = await _classService.GetDecksInClassAsync(classId);
                return Ok(decks);
            }
            catch (Exception ex) { return StatusCode(500, new { message = ex.Message }); }
        }

        // 7. Assign Deck to Class
        [HttpPost("{classId}/assign/{deckId}")]
        public async Task<IActionResult> AssignDeck(string classId, string deckId)
        {
            try
            {
                // Security: Ensure the user is logged in
                string? userId = await GetUserIdFromTokenAsync();
                if (userId == null) return Unauthorized();

                // OPTIONAL TODO: Check if 'userId' is actually the teacher of 'classId' 
                // (For now, we assume if they are logged in, it's fine)

                bool success = await _classService.AssignDeckToClassAsync(classId, deckId);
                
                if (success)
                {
                    return Ok(new { message = "Deck assigned successfully" });
                }
                else
                {
                    return NotFound(new { message = "Class not found" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // 8. Update Class Name
        [HttpPut("{classId}")]
        public async Task<IActionResult> UpdateClass(string classId, [FromBody] CreateClassRequest request)
        {
            try
            {
                string? userId = await GetUserIdFromTokenAsync();
                if (userId == null) return Unauthorized();

                bool success = await _classService.UpdateClassAsync(classId, request.ClassName);
                if (success) return Ok(new { message = "Class updated successfully" });
                return NotFound(new { message = "Class not found" });
            }
            catch (Exception ex) { return StatusCode(500, new { message = ex.Message }); }
        }

        // 9. Delete Class
        [HttpDelete("{classId}")]
        public async Task<IActionResult> DeleteClass(string classId)
        {
            try
            {
                string? userId = await GetUserIdFromTokenAsync();
                if (userId == null) return Unauthorized();

                // TODO: Check ownership (ensure teacher owns class) before deleting
                
                bool success = await _classService.DeleteClassAsync(classId);
                if (success) return Ok(new { message = "Class deleted successfully" });
                return NotFound(new { message = "Class not found" });
            }
            catch (Exception ex) { return StatusCode(500, new { message = ex.Message }); }
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

        [HttpGet("{classId}/assignments/me")]
        public async Task<IActionResult> GetStudentAssignments(string classId)
        {
            try
            {
                string? userId = await GetUserIdFromTokenAsync();
                if (userId == null) return Unauthorized();

                // Reuse the service that gets decks. 
                // In the future, you would fetch 'StudentProgress' here and merge it.
                var decks = await _classService.GetDecksInClassAsync(classId);
                
                // Map to the DTO structure the frontend expects
                var assignments = decks.Select(d => new 
                {
                    SetId = d.SetId,
                    Title = d.Title,
                    DateAssigned = d.DateCreated, // Or a specific assignment date if you add that later
                    Progress = 0, // Default to 0 for now
                    Status = "Not Started"
                });

                return Ok(assignments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}