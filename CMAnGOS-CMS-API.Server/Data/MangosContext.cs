using Microsoft.EntityFrameworkCore;

namespace CMAnGOS_CMS_API.Server.Data
{
    public class MangosContext : DbContext
    {
        public MangosContext(DbContextOptions<MangosContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }
    }
}
