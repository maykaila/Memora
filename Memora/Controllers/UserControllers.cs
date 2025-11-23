using Microsoft.AspNetCore.Mvc;
using FirebaseAdmin.Auth;
using System.Threading.Tasks;
using Memora.Services; // Your namespace
using Memora.DTOs;     // Your namespace

// FIX 1: Added the namespace wrapper
namespace Memora.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UserControllers : ControllerBase
    {
        private readonly IUserService _userService;

        // This is the constructor
        public UserControllers(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            try
            {
                // 1. Get the Bearer token from the request header
                string authHeader = Request.Headers["Authorization"].ToString();
                if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                {
                    return Unauthorized(new { message = "No token provided." });
                }
                
                string idToken = authHeader.Split(" ")[1];

                // 2. Verify the token with Firebase Admin
                FirebaseToken decodedToken = await FirebaseAuth.DefaultInstance
                    .VerifyIdTokenAsync(idToken);
                
                // --- THIS IS THE FIX ---
                // 2.5 Get the full user record FROM the token's UID
                UserRecord userRecord = await FirebaseAuth.DefaultInstance.GetUserAsync(decodedToken.Uid);

                // 3. Get the UID
                string uid = userRecord.Uid; // Get UID from the userRecord

                // 4. Security Check: Use 'userRecord.Email'
                if (userRecord.Email.ToLower() != request.Email.ToLower())
                {
                     return BadRequest(new { message = "Email mismatch." });
                }

                // 5. Call your OOP "Brain" (the service)
                var newUser = await _userService.CreateUserAsync(
                    uid, 
                    request.Username, 
                    userRecord.Email, // Use the trusted email
                    request.Role 
                );

                return CreatedAtAction(nameof(GetUser), new { id = newUser.UserId }, newUser);
            }
            // FIX 2: Removed the stray '.catch'
            catch (FirebaseAuthException ex)
            {
                // Token is invalid or expired
                return Unauthorized(new { message = "Invalid token.", error = ex.Message });
            }
            catch (Exception ex)
            {
                // This will catch the 'Email' error if you don't fix it
                return StatusCode(500, new { message = "Internal server error.", error = ex.Message });
            }
        }

        // A placeholder method so 'CreatedAtAction' works
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(string id)
        {
            var user = await _userService.GetUserAsync(id);
            if (user == null) return NotFound();
            return Ok(user);
        }

        // For Streak -------------------------------------------------------------------------------------------
        [HttpPost("checkin")]
        public async Task<IActionResult> CheckIn()
        {
            try
            {
                string authHeader = Request.Headers["Authorization"].ToString();
                if (string.IsNullOrEmpty(authHeader)) return Unauthorized();
                string idToken = authHeader.Split(" ")[1];
                FirebaseToken decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(idToken);
                
                await _userService.CheckInUserAsync(decodedToken.Uid);
                
                return Ok(new { message = "Daily check-in successful" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
        // For Streak -------------------------------------------------------------------------------------------
    }
}