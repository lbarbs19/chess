using System.ComponentModel.DataAnnotations;
using VibeChess.Backend.Enums;

namespace VibeChess.Backend.Models;

public class LobbyPlayer
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string LobbyId { get; set; } = string.Empty;

    [Required]
    public string ConnectionId { get; set; } = string.Empty;

    [Required]
    [StringLength(12)]
    public string Nickname { get; set; } = string.Empty;

    [Required]
    // Captain or  Player
    public PlayerRole Role { get; set; } = PlayerRole.Player;


    public int? Team { get; set; }

    // Navigation property
    public Lobby Lobby { get; set; } = null!;
}
