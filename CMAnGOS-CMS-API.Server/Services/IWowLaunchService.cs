using CMAnGOS_CMS_API.Server.Models.Dto;

namespace CMAnGOS_CMS_API.Server.Services
{
    public interface IWowLaunchService
    {
        WowLaunchResponse Launch(string wowPath);
    }
}
