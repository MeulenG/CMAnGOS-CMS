using System.Security.Cryptography;
using System.Text;

namespace CMAnGOS_CMS_API.Server.Helpers
{
    public static class AccountHelper
    {
        private const int MAX_ACCOUNT_STR = 16;

        public static string NormalizeString(string input)
        {
            if (string.IsNullOrWhiteSpace(input)) {
                return string.Empty;
            }

            return input.Trim().ToUpperInvariant();
        }

        public static string CalculateShaPassHash(string name, string password)
        {
            using (var sha1 = SHA1.Create())
            {
                string combined = $"{name}:{password}";
                byte[] bytes = Encoding.UTF8.GetBytes(combined);
                byte[] hash = sha1.ComputeHash(bytes);
                return BitConverter.ToString(hash).Replace("-", string.Empty).ToUpperInvariant();
            }
        }

        public static bool ValidateAccountName(string username)
        {
            if (string.IsNullOrWhiteSpace(username)) {
                return false;
                }

            if (Encoding.UTF8.GetByteCount(username) > MAX_ACCOUNT_STR) {
                return false;
            }

            return username.All(c => char.IsLetterOrDigit(c));
        }

        public static bool ValidatePassword(string password)
        {
            if (string.IsNullOrWhiteSpace(password)) {
                return false;
            }

            if (Encoding.UTF8.GetByteCount(password) > MAX_ACCOUNT_STR) {
                return false;
            }

            return true;
        }
    }
}
