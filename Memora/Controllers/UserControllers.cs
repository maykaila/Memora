using Microsoft.AspNetCore.Mvc;
using FirebaseAdmin.Auth;
using System.Threading.Tasks;
using Memora.Services;
using Memora.DTOs;

namespace Memora.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UserControllers : ControllerBase
    {
        private readonly IUserService _userService;

        public UserControllers(IUserService userService)
        {
            _userService = userService;
        }

        // CREATE USER (CLEANED)
        [HttpPost("create")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            try
            {
                // 1. Check Authorization header
                string authHeader = Request.Headers["Authorization"].ToString();
                if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                {
                    return Unauthorized(new { message = "No token provided." });
                }

                string idToken = authHeader.Split(" ")[1];

                // 2. Verify ID token
                FirebaseToken decodedToken = await FirebaseAuth.DefaultInstance
                    .VerifyIdTokenAsync(idToken);

                // 3. Get Firebase user record
                UserRecord userRecord = await FirebaseAuth.DefaultInstance
                    .GetUserAsync(decodedToken.Uid);

                string uid = userRecord.Uid;

                // 4. Security check – the email in request must match Firebase record
                if (userRecord.Email.ToLower() != request.Email.ToLower())
                {
                    return BadRequest(new { message = "Email mismatch." });
                }

                // 5. Save user in your Firestore Database
                var newUser = await _userService.CreateUserAsync(
                    uid,
                    request.Username,
                    userRecord.Email,
                    request.Role
                );

                return CreatedAtAction(nameof(GetUser), new { id = newUser.UserId }, newUser);
            }
            catch (FirebaseAuthException ex)
            {
                return Unauthorized(new { message = "Invalid token.", error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error.", error = ex.Message });
            }
        }

        // GET USER
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(string id)
        {
            try
            {
                string authHeader = Request.Headers["Authorization"].ToString();
                if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                {
                    return Unauthorized(new { message = "No token provided." });
                }

                string idToken = authHeader.Split(" ")[1];
                FirebaseToken decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(idToken);

                if (decodedToken.Uid != id)
                {
                    return Unauthorized(new { message = "Unauthorized user." });
                }

                var user = await _userService.GetUserAsync(id);
                if (user == null) return NotFound();

                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error verifying token", error = ex.Message });
            }
        }

        // CHECK IN (STREAK)
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

        // DELETE USER
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            try
            {
                string authHeader = Request.Headers["Authorization"].ToString();
                if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                {
                    return Unauthorized(new { message = "No token provided." });
                }

                string idToken = authHeader.Split(" ")[1];
                FirebaseToken decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(idToken);

                if (decodedToken.Uid != id)
                {
                    return StatusCode(403, new { message = "You are not allowed to delete this account." });
                }

                bool deleted = await _userService.DeleteUserAsync(id);

                if (!deleted)
                {
                    return NotFound(new { message = "User not found." });
                }

                return Ok(new { message = "User deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to delete user.", error = ex.Message });
            }
        }
    }
}
