using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CMAnGOS_CMS_API.Server.Models.Realmd
{
    [Table("account")]
    public class Account
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("username")]
        [StringLength(32)]
        public string Username { get; set; } = string.Empty;

        [Column("gmlevel")]
        public int GmLevel { get; set; }

        [Column("sessionkey")]
        [StringLength(80)]
        public string? SessionKey { get; set; }

        [Column("v")]
        [StringLength(64)]
        public string? V { get; set; }

        [Column("s")]
        [StringLength(64)]
        public string? S { get; set; }

        [Column("email")]
        [StringLength(254)]
        public string? Email { get; set; }

        [Column("joindate")]
        public DateTime JoinDate { get; set; }

        [Column("failed_logins")]
        public uint FailedLogins { get; set; }

        [Column("locked")]
        public int Locked { get; set; }

        [Column("active_realm_id")]
        public uint ActiveRealmId { get; set; }

        [Column("expansion")]
        public int Expansion { get; set; }

        [Column("mutetime")]
        public long MuteTime { get; set; }

        [Column("locale")]
        public string? Locale { get; set; }

        [Column("os")]
        [StringLength(3)]
        public string? Os { get; set; }

        [Column("token")]
        public string? Token { get; set; }

        [Column("flags")]
        public uint Flags { get; set; }
    }
}
