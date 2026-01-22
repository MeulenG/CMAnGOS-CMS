using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CMAnGOS_CMS_API.Server.Models.Realmd
{
    [Table("realmlist")]
    public class RealmList
    {
        [Key]
        [Column("id")]
        public uint Id { get; set; }

        [Required]
        [Column("name")]
        [StringLength(32)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Column("address")]
        [StringLength(255)]
        public string Address { get; set; } = string.Empty;

        [Column("port")]
        public ushort Port { get; set; }

        [Column("icon")]
        public byte Icon { get; set; }

        [Column("realmflags")]
        public byte RealmFlags { get; set; }

        [Column("timezone")]
        public byte Timezone { get; set; }

        [Column("allowedSecurityLevel")]
        public byte AllowedSecurityLevel { get; set; }

        [Column("population")]
        public float Population { get; set; }

        [Column("realmbuilds")]
        [StringLength(64)]
        public string? RealmBuilds { get; set; }
    }
}
