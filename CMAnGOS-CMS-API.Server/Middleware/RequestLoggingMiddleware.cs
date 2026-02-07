using System.Diagnostics;
using System.Text;
using System.Text.Json;

namespace CMAnGOS_CMS_API.Server.Middleware
{
    public sealed class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestLoggingMiddleware> _logger;

        public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var stopwatch = Stopwatch.StartNew();
            var requestId = context.TraceIdentifier;
            var method = context.Request.Method;
            var path = context.Request.Path;
            var remoteIp = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var source = context.Request.Headers["X-Client-Source"].ToString();
            var payload = await ReadRequestBodyAsync(context);

            try
            {
                await _next(context);
                stopwatch.Stop();

                _logger.LogInformation(
                    "{RequestId} {Method} {Path}{Query} responded {StatusCode} in {ElapsedMs}ms (ip={RemoteIp}, user={User}, source={Source}, payload={Payload})",
                    requestId,
                    method,
                    path,
                    context.Request.QueryString.HasValue ? context.Request.QueryString.Value : string.Empty,
                    context.Response.StatusCode,
                    stopwatch.ElapsedMilliseconds,
                    remoteIp,
                    context.User?.Identity?.Name ?? "anonymous",
                    string.IsNullOrWhiteSpace(source) ? "unknown" : source,
                    payload ?? "<none>");
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                _logger.LogError(
                    ex,
                    "{RequestId} {Method} {Path}{Query} failed after {ElapsedMs}ms (ip={RemoteIp}, source={Source}, payload={Payload})",
                    requestId,
                    method,
                    path,
                    context.Request.QueryString.HasValue ? context.Request.QueryString.Value : string.Empty,
                    stopwatch.ElapsedMilliseconds,
                    remoteIp,
                    string.IsNullOrWhiteSpace(source) ? "unknown" : source,
                    payload ?? "<none>");
                throw;
            }
        }

        private static async Task<string?> ReadRequestBodyAsync(HttpContext context)
        {
            if (context.Request.ContentLength is null or 0)
            {
                return null;
            }

            if (HttpMethods.IsGet(context.Request.Method) || HttpMethods.IsHead(context.Request.Method))
            {
                return null;
            }

            context.Request.EnableBuffering();

            const int maxBytes = 64 * 1024;
            string bodyText;

            using (var reader = new StreamReader(context.Request.Body, Encoding.UTF8, detectEncodingFromByteOrderMarks: false, leaveOpen: true))
            {
                var buffer = new char[maxBytes + 1];
                var read = await reader.ReadBlockAsync(buffer, 0, buffer.Length);
                bodyText = new string(buffer, 0, read);
            }

            context.Request.Body.Position = 0;

            if (bodyText.Length > maxBytes)
            {
                bodyText = bodyText[..maxBytes] + "...<truncated>";
            }

            if (IsJson(context.Request.ContentType))
            {
                return SanitizeJson(bodyText);
            }

            return bodyText.Trim();
        }

        private static bool IsJson(string? contentType)
        {
            return !string.IsNullOrWhiteSpace(contentType) && contentType.Contains("application/json", StringComparison.OrdinalIgnoreCase);
        }

        private static string SanitizeJson(string json)
        {
            try
            {
                using var document = JsonDocument.Parse(json);
                using var stream = new MemoryStream();
                using var writer = new Utf8JsonWriter(stream, new JsonWriterOptions { Indented = true });
                WriteSanitizedJson(document.RootElement, writer);
                writer.Flush();
                return Encoding.UTF8.GetString(stream.ToArray());
            }
            catch
            {
                return json.Trim();
            }
        }

        private static void WriteSanitizedJson(JsonElement element, Utf8JsonWriter writer)
        {
            switch (element.ValueKind)
            {
                case JsonValueKind.Object:
                    writer.WriteStartObject();
                    foreach (var property in element.EnumerateObject())
                    {
                        writer.WritePropertyName(property.Name);
                        if (IsSensitiveKey(property.Name))
                        {
                            writer.WriteStringValue("REDACTED");
                        }
                        else
                        {
                            WriteSanitizedJson(property.Value, writer);
                        }
                    }
                    writer.WriteEndObject();
                    break;
                case JsonValueKind.Array:
                    writer.WriteStartArray();
                    foreach (var item in element.EnumerateArray())
                    {
                        WriteSanitizedJson(item, writer);
                    }
                    writer.WriteEndArray();
                    break;
                default:
                    element.WriteTo(writer);
                    break;
            }
        }

        private static bool IsSensitiveKey(string name)
        {
            return name.Equals("password", StringComparison.OrdinalIgnoreCase)
                || name.Equals("apikey", StringComparison.OrdinalIgnoreCase)
                || name.Equals("apiKey", StringComparison.OrdinalIgnoreCase)
                || name.Equals("token", StringComparison.OrdinalIgnoreCase)
                || name.Equals("secret", StringComparison.OrdinalIgnoreCase)
                || name.EndsWith("key", StringComparison.OrdinalIgnoreCase);
        }
    }
}
