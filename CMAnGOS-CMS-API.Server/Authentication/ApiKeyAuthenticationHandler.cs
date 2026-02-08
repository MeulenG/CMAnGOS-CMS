using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace CMAnGOS_CMS_API.Server.Authentication
{
	public static class ApiKeyAuthenticationDefaults
	{
		public const string Scheme = "ApiKey";
		public const string HeaderName = "X-Api-Key";
		public const string ConfigurationKey = "ApiKey";
	}

	public sealed class ApiKeyAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
	{
		private readonly IConfiguration _configuration;
		private readonly ILogger<ApiKeyAuthenticationHandler> _logger;

		public ApiKeyAuthenticationHandler(
			IOptionsMonitor<AuthenticationSchemeOptions> options,
			ILoggerFactory loggerFactory,
			UrlEncoder encoder,
			IConfiguration configuration)
			: base(options, loggerFactory, encoder)
		{
			_configuration = configuration;
			_logger = loggerFactory.CreateLogger<ApiKeyAuthenticationHandler>();
		}

		protected override Task<AuthenticateResult> HandleAuthenticateAsync()
		{
			if (HttpMethods.IsOptions(Request.Method))
			{
				return Task.FromResult(AuthenticateResult.NoResult());
			}

			if (Request.Path.StartsWithSegments("/swagger") || Request.Path.StartsWithSegments("/api/health"))
			{
				return Task.FromResult(AuthenticateResult.NoResult());
			}

			var expectedKey = _configuration[ApiKeyAuthenticationDefaults.ConfigurationKey];
			if (string.IsNullOrWhiteSpace(expectedKey))
			{
				_logger.LogError("ApiKey authentication is configured but no ApiKey is set in configuration.");
				return Task.FromResult(AuthenticateResult.Fail("ApiKey not configured."));
			}

			if (!Request.Headers.TryGetValue(ApiKeyAuthenticationDefaults.HeaderName, out var providedKey))
			{
				_logger.LogWarning(
					"Missing API key header for {Method} {Path} (source={Source})",
					Request.Method,
					Request.Path,
					Request.Headers["X-Client-Source"].ToString());
				return Task.FromResult(AuthenticateResult.Fail("Missing API key."));
			}

			if (!string.Equals(providedKey, expectedKey, StringComparison.Ordinal))
			{
				_logger.LogWarning(
					"Invalid API key for {Method} {Path} (source={Source})",
					Request.Method,
					Request.Path,
					Request.Headers["X-Client-Source"].ToString());
				return Task.FromResult(AuthenticateResult.Fail("Invalid API key."));
			}

			var identity = new ClaimsIdentity(Scheme.Name);
			identity.AddClaim(new Claim(ClaimTypes.Name, "ApiKeyClient"));
			var principal = new ClaimsPrincipal(identity);
			var ticket = new AuthenticationTicket(principal, Scheme.Name);

			return Task.FromResult(AuthenticateResult.Success(ticket));
		}
	}
}
