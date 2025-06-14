using System.ComponentModel.DataAnnotations;

namespace VibeChess.Backend.Models;

public class GameMove
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string GameId { get; set; } = string.Empty;

    [Required]
    [StringLength(2)]
    public string FromSquare { get; set; } = string.Empty;

    [Required]
    [StringLength(2)]
    public string ToSquare { get; set; } = string.Empty;

    [Required]
    public string PlayerId { get; set; } = string.Empty;

    public string? CaptainId { get; set; }

    [Required]
    [StringLength(10)]
    public string PieceType { get; set; } = string.Empty;

    [StringLength(10)]
    public string? CapturedPiece { get; set; }

    [Required]
    public string ResultingFEN { get; set; } = string.Empty; [StringLength(10)]
    public string? Notation { get; set; }

    public bool IsAutoMove { get; set; } = false;

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public PawnStarsGame Game { get; set; } = null!;
    public Player Player { get; set; } = null!;
}
