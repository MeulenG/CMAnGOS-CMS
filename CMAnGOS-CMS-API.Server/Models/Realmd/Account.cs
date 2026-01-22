using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CMAnGOS_CMS_API.Server.Models.Realmd
{
    [Table("account")]
    public class Account
    {
        [Key]
        [Column("id")]
        public uint Id { get; set; }

        [Required]
        [Column("username")]
        [StringLength(32)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [Column("sha_pass_hash")]
        [StringLength(40)]
        public string ShaPassHash { get; set; } = string.Empty;

        [Column("gmlevel")]
        public byte GmLevel { get; set; }

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

        [Column("last_ip")]
        [StringLength(15)]
        public string LastIp { get; set; } = string.Empty;

        [Column("failed_logins")]
        public uint FailedLogins { get; set; }

        [Column("locked")]
        public byte Locked { get; set; }

        [Column("last_login")]
        public DateTime LastLogin { get; set; }

        [Column("active_realm_id")]
        public uint ActiveRealmId { get; set; }

        [Column("online")]
        public uint Online { get; set; }

        [Column("expansion")]
        public byte Expansion { get; set; }

        [Column("mutetime")]
        public long MuteTime { get; set; }

        [Column("locale")]
        public byte Locale { get; set; }

        [Column("os")]
        [StringLength(3)]
        public string? Os { get; set; }

        [Column("token")]
        public string? Token { get; set; }

        [Column("flags")]
        public uint Flags { get; set; }
    }
}
