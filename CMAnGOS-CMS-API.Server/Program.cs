using Microsoft.EntityFrameworkCore;
using CMAnGOS_CMS_API.Server.Data;
using CMAnGOS_CMS_API.Server.Services;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseUrls("http://localhost:5023");

builder.Services.AddSingleton<ICMAnGOSDetectionService, CMAnGOSDetectionService>();

var loggerFactory = LoggerFactory.Create(loggingBuilder => loggingBuilder.AddConsole());
var detectionLogger = loggerFactory.CreateLogger<CMAnGOSDetectionService>();
var detectionService = new CMAnGOSDetectionService(builder.Configuration, detectionLogger);
var expansionPrefix = await detectionService.DetectExpansionPrefixAsync();

// Get base connection strings and replace prefix
var realmdConnectionString = detectionService.GetConnectionString(
    builder.Configuration.GetConnectionString("RealmdDatabase") ?? "", expansionPrefix);
var charactersConnectionString = detectionService.GetConnectionString(
    builder.Configuration.GetConnectionString("CharactersDatabase") ?? "", expansionPrefix);
var mangosConnectionString = detectionService.GetConnectionString(
    builder.Configuration.GetConnectionString("MangosDatabase") ?? "", expansionPrefix);

// Register DbContexts with MySQL
var serverVersion = new MySqlServerVersion(new Version(8, 0, 21));

builder.Services.AddDbContext<RealmdContext>(options =>
    options.UseMySql(realmdConnectionString, serverVersion));

builder.Services.AddDbContext<CharactersContext>(options =>
    options.UseMySql(charactersConnectionString, serverVersion));

builder.Services.AddDbContext<MangosContext>(options =>
    options.UseMySql(mangosConnectionString, serverVersion));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", builder =>
        builder.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader()
    );
});

var app = builder.Build();

var logger = app.Services.GetRequiredService<ILogger<Program>>();
logger.LogInformation($"CMAnGOS CMS API started with expansion: {expansionPrefix}");
logger.LogInformation($"Realmd Database: {expansionPrefix}realmd");
logger.LogInformation($"Characters Database: {expansionPrefix}characters");
logger.LogInformation($"Mangos Database: {expansionPrefix}mangos");

app.UseDefaultFiles();
app.UseStaticFiles();

if (builder.Configuration.GetValue<bool>("AllowForwarding") == true) {
    app.UseForwardedHeaders();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Remove HTTPS redirection for localhost desktop app

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.UseCors("CorsPolicy");

app.MapFallbackToFile("/index.html");

app.Run();
