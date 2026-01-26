using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CMAnGOS_CMS_API.Server.Models.Realmd
{
    [Table("realmlist")]
    public class RealmList
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("name")]
        [StringLength(32)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Column("address")]
        [StringLength(32)]
        public string Address { get; set; } = string.Empty;

        [Column("port")]
        public int Port { get; set; }

        [Column("icon")]
        public int Icon { get; set; }

        [Column("realmflags")]
        public int RealmFlags { get; set; }

        [Column("timezone")]
        public int Timezone { get; set; }

        [Column("allowedSecurityLevel")]
        public int AllowedSecurityLevel { get; set; }

        [Column("population")]
        public float Population { get; set; }
    }
}
