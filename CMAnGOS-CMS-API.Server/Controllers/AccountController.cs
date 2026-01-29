using System.Collections.Generic;
using System.Threading.Tasks;
using System.Text;
using System.Security.Cryptography;
using System.Data;
using System.Globalization;
using System.Linq;
using CMAnGOS_CMS_API.Server.Data;
using CMAnGOS_CMS_API.Server.Models.Realmd;
using CMAnGOS_CMS_API.Server.Models.Dto;
using CMAnGOS_CMS_API.Server.Helpers;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;

namespace CMAnGOS_CMS_API.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly RealmdContext _realmdDBContext;
        private readonly ILogger<AccountController> _logger;

        public AccountController(RealmdContext realmdDBContext, ILogger<AccountController> logger)
        {
            _realmdDBContext = realmdDBContext;
            _logger = logger;
        }

        // GET: api/Account
        [HttpGet]
        public async Task<IActionResult> GetUsernames(int limit = 5)
        {
            var accounts = await _realmdDBContext
                .Set<Account>()
                .Take(limit)
                .OrderBy(a => a.Id)
                .ToListAsync();

            return Ok(accounts);
        }

        // GET api/Account/5
        [HttpGet("{id}")]
        public async Task<IActionResult> FetchAccountById(int id)
        {
            var result = await _realmdDBContext.Set<Models.Realmd.Account>()
                .Where(account => account.Id == id)
                .ToListAsync();

            return Ok(result);
        }

        // POST api/Account/create
        [HttpPost]
        public async Task<IActionResult> CreateAccount([FromBody] CreateAccountRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var result = await CreateAccountInternal(request.Username, request.Password, request.Email);

                return result.Result switch
                {
                    AccountOpResult.AOR_OK => Ok(new CreateAccountResponse
                    {
                        Success = true,
                        Message = "Account created successfully",
                        AccountId = result.AccountId
                    }),
                    AccountOpResult.AOR_NAME_TOO_LONG => BadRequest(new CreateAccountResponse
                    {
                        Success = false,
                        Message = "Username is too long (max 16 characters)"
                    }),
                    AccountOpResult.AOR_NAME_ALREADY_EXIST => Conflict(new CreateAccountResponse
                    {
                        Success = false,
                        Message = "Username already exists"
                    }),
                    AccountOpResult.AOR_NAME_INVALID => BadRequest(new CreateAccountResponse
                    {
                        Success = false,
                        Message = "Username contains invalid characters (only letters and numbers allowed)"
                    }),
                    AccountOpResult.AOR_PASS_TOO_LONG => BadRequest(new CreateAccountResponse
                    {
                        Success = false,
                        Message = "Password is too long (max 16 characters)"
                    }),
                    AccountOpResult.AOR_DB_INTERNAL_ERROR => StatusCode(500, new CreateAccountResponse
                    {
                        Success = false,
                        Message = "Database error occurred"
                    }),
                    _ => StatusCode(500, new CreateAccountResponse
                    {
                        Success = false,
                        Message = "Unknown error occurred"
                    })
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating account for username: {Username}", request.Username);
                return StatusCode(500, new CreateAccountResponse
                {
                    Success = false,
                    Message = "An error occurred while creating the account"
                });
            }
        }

        private async Task<(AccountOpResult Result, int? AccountId)> CreateAccountInternal(
            string username, string password, string? email = null)
        {
            if (Encoding.UTF8.GetByteCount(username) > 16) { 
                return (AccountOpResult.AOR_NAME_TOO_LONG, null);
            }

            if (Encoding.UTF8.GetByteCount(password) > 16) { 
                return (AccountOpResult.AOR_PASS_TOO_LONG, null);
            }

            if (!AccountHelper.ValidateAccountName(username)) { 
                return (AccountOpResult.AOR_NAME_INVALID, null);
            }

            username = AccountHelper.NormalizeString(username);
            password = AccountHelper.NormalizeString(password);

            var existingAccount = await _realmdDBContext.Accounts
                .FirstOrDefaultAsync(a => a.Username == username);

            if (existingAccount != null)
            {
                return (AccountOpResult.AOR_NAME_ALREADY_EXIST, null);
            }

            string shaPassHash = AccountHelper.CalculateShaPassHash(username, password);

            var srp = new SRP6Helper();
            srp.CalculateVerifierFromHash(shaPassHash);

            string saltHex = srp.GetSaltHex();
            string verifierHex = srp.GetVerifierHex();

            var newAccount = new Account
            {
                Username = username,
                S = saltHex,
                V = verifierHex,
                Email = email,
                JoinDate = DateTime.UtcNow,
                GmLevel = 0,
                Expansion = 0,
                Locked = 0,
                FailedLogins = 0,
                ActiveRealmId = 0,
                MuteTime = 0,
                Locale = "enGB",
                Os = "Win",
                Token = null,
                Flags = 0
            };

            try
            {
                _realmdDBContext.Accounts.Add(newAccount);
                await _realmdDBContext.SaveChangesAsync();

                var realms = await _realmdDBContext.RealmLists.ToListAsync();

                _logger.LogInformation("Account created successfully: {Username} (ID: {AccountId})", 
                    username, newAccount.Id);

                return (AccountOpResult.AOR_OK, newAccount.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database error while creating account: {Username}", username);
                return (AccountOpResult.AOR_DB_INTERNAL_ERROR, null);
            }
        }

        // PUT api/Account/5
        [HttpPut("{id}")]
        public async Task<IActionResult> ChangePassword(int accid, string new_password)
        {
            var account = await FetchAccountById(accid);
            /*
            if (account == null)
            {
                return NotFound();
            }
            else
            {
                string username = from a in _realmdDBContext.Accounts
                                  where a.Id == accid
                                  select a.Username;
                AccountHelper.NormalizeString(username);
            }
            if (Encoding.UTF8.GetByteCount(new_password) > 16)
            {
                return BadRequest("Password is too long (max 16 characters)");
            }
            AccountHelper.NormalizeString(new_password);
            
            string shaPassHash = AccountHelper.CalculateShaPassHash(username, new_password);
            var srp = new SRP6Helper();
            srp.CalculateVerifier(shaPassHash);
            string saltHex = srp.GetSaltHex();
            string verifierHex = srp.GetVerifierHex();

            _realmdDBContext.Set<Account>().Update(account);
            await _realmdDBContext.SaveChangesAsync();
            */

            return NoContent();
        }

        // DELETE api/Account/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var account = await _realmdDBContext.Set<Account>().FindAsync(id);
            if (account == null)
            {
                return NotFound();
            }

            _realmdDBContext.Set<Account>().Remove(account);
            await _realmdDBContext.SaveChangesAsync();

            return NoContent();
        }
    }
}
