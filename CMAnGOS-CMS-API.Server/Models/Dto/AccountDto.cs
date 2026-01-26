using System.ComponentModel.DataAnnotations;

namespace CMAnGOS_CMS_API.Server.Models.Dto
{
    public class CreateAccountRequest
    {
        [Required]
        [StringLength(16, MinimumLength = 3, ErrorMessage = "Username must be between 3 and 16 characters")]
        public string Username { get; set; } = string.Empty;

        [Required]
        [StringLength(16, MinimumLength = 6, ErrorMessage = "Password must be between 6 and 16 characters")]
        public string Password { get; set; } = string.Empty;

        [EmailAddress]
        public string? Email { get; set; }
    }

    public class CreateAccountResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int? AccountId { get; set; }
    }

    public enum AccountOpResult
    {
        AOR_OK,
        AOR_NAME_TOO_LONG,
        AOR_NAME_ALREADY_EXIST,
        AOR_NAME_INVALID,
        AOR_PASS_TOO_LONG,
        AOR_DB_INTERNAL_ERROR
    }
}
