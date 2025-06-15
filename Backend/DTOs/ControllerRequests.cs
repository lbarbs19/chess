using System.ComponentModel.DataAnnotations;
using VibeChess.Backend.Enums;

namespace VibeChess.Backend.DTOs;

/// <summary>
/// Request to validate a move without executing it
/// </summary>
public class ValidateMoveRequest
{
    [Required]
    public string Fen { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^[a-h][1-8]$", ErrorMessage = "FromSquare must be in format like 'e2'")]
    public string FromSquare { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^[a-h][1-8]$", ErrorMessage = "ToSquare must be in format like 'e4'")]
    public string ToSquare { get; set; } = string.Empty;

    public string? Promotion { get; set; }
}

/// <summary>
/// Request to end a game
/// </summary>
public class EndGameRequest
{
    [Required]
    public GameStatus FinalStatus { get; set; }

    /// <summary>
    /// Winner player ID (optional, for draw games)
    /// </summary>
    public string? Winner { get; set; }
}

/// <summary>
/// Request to update lobby settings
/// </summary>
public class UpdateLobbySettingsRequest
{
    [Required]
    public string HostPlayerId { get; set; } = string.Empty;

    [StringLength(50)]
    public string? LobbyName { get; set; }

    public GameMode? GameMode { get; set; }

    [Range(10, 300)]
    public int? MoveTimerSeconds { get; set; }

    [Range(2, 12)]
    public int? MaxPlayers { get; set; }

    public bool? IsPrivate { get; set; }

    public string? Password { get; set; }
}
