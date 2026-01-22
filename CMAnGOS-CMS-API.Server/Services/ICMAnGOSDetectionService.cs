namespace CMAnGOS_CMS_API.Server.Services
{
    public interface ICMAnGOSDetectionService
    {
        Task<string> DetectExpansionPrefixAsync();
        Task<bool> IsDatabaseAvailableAsync(string databaseName);
        string GetConnectionString(string baseConnectionString, string prefix);
    }
}
