using Microsoft.EntityFrameworkCore;
using CMAnGOS_CMS_API.Server.Models.Realmd;

namespace CMAnGOS_CMS_API.Server.Data
{
    public class RealmdContext : DbContext
    {
        public RealmdContext(DbContextOptions<RealmdContext> options) : base(options)
        {
        }

        public DbSet<Account> Accounts { get; set; }
        public DbSet<RealmList> RealmLists { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Account>(entity =>
            {
                entity.HasIndex(e => e.Username).IsUnique();
            });
        }
    }
}
