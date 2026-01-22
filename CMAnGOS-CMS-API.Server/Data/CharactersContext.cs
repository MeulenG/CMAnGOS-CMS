using Microsoft.EntityFrameworkCore;

namespace CMAnGOS_CMS_API.Server.Data
{
    public class CharactersContext : DbContext
    {
        public CharactersContext(DbContextOptions<CharactersContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }
    }
}
