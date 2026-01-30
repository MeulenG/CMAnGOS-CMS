using Microsoft.EntityFrameworkCore;
using CMAnGOS_CMS_API.Server.Data;
using CMAnGOS_CMS_API.Server.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure to listen only on localhost for desktop app
builder.WebHost.UseUrls("http://localhost:5023");

// Add services to the container.

// Register CMAnGOS detection service
builder.Services.AddSingleton<ICMAnGOSDetectionService, CMAnGOSDetectionService>();

// Detect CMAnGOS expansion prefix early
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
// Allow CORS for localhost (Electron app)
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", builder =>
        builder.WithOrigins("http://localhost:5173", "http://localhost:61091")
            .AllowAnyMethod()
            .AllowAnyHeader()
    );
});

var app = builder.Build();

// Log detected expansion
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

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Remove HTTPS redirection for localhost desktop app
// app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.UseCors("CorsPolicy");

app.MapFallbackToFile("/index.html");

app.Run();
