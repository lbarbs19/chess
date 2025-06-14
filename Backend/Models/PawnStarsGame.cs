using System.ComponentModel.DataAnnotations;
using VibeChess.Backend.Enums;

namespace VibeChess.Backend.Models;

public class PawnStarsGame
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [StringLength(6)]
    public string RoomCode { get; set; } = string.Empty;

    [Required]
    public GameMode GameMode { get; set; }

    public int MoveTimerSeconds { get; set; } = 10;

    public string? WhiteCaptainId { get; set; }

    public string? BlackCaptainId { get; set; }
    [Required]
    public Team CurrentTurn { get; set; } = Team.White;

    [Required]
    public string FEN { get; set; } = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    [Required]
    public GameStatus Status { get; set; } = GameStatus.WaitingForPlayers;

    // Navigation properties
    public List<Player> Players { get; set; } = new();
    public List<GameMove> Moves { get; set; } = new();
}
