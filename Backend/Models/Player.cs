using System.ComponentModel.DataAnnotations;
using VibeChess.Backend.Enums;

namespace VibeChess.Backend.Models;

public class Player
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string ConnectionId { get; set; } = string.Empty;

    [Required]
    [StringLength(12)]
    public string Nickname { get; set; } = string.Empty;

    [Required]
    public Team Team { get; set; }

    [Required]
    public PlayerRole Role { get; set; }

    [Required]
    public string GameId { get; set; } = string.Empty;

    public string? PieceID { get; set; }    // Navigation property
    public PawnStarsGame Game { get; set; } = null!;
}