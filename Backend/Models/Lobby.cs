using System.ComponentModel.DataAnnotations;
using VibeChess.Backend.Enums;

namespace VibeChess.Backend.Models;

public class Lobby
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [StringLength(6)]
    public string RoomCode { get; set; } = string.Empty;

    [Required]
    public GameMode GameMode { get; set; }

    public int MoveTimerSeconds { get; set; } = 10;

    public int MaxPlayers { get; set; } = 34;

    public string? WhiteCaptainId { get; set; }

    public string? BlackCaptainId { get; set; }
    [Required]
    public LobbyStatus Status { get; set; } = LobbyStatus.WaitingForPlayers;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;  // Keep for cleanup

    // Navigation properties
    public List<LobbyPlayer> Players { get; set; } = new();
    public PawnStarsGame? Game { get; set; }
}
