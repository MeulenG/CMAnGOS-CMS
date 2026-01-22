using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CMAnGOS_CMS_API.Server.Controllers
{
    public class AccountController : ControllerBase
    {
        [Route("[controller]")]
        // GET: HomeController
        [HttpGet]
        public ActionResult Index()
        {
            return Empty;
        }
    }
}
