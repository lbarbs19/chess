using System.Text.Json.Serialization;
using VibeChess.Backend.Enums;

namespace VibeChess.Backend.Models.Redis;

/// <summary>
/// Redis-optimized model for active game state
/// Stored as: game:{gameId}
/// </summary>
public class RedisGame
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string RoomCode { get; set; } = string.Empty;

    public GameMode GameMode { get; set; }

    public int MoveTimerSeconds { get; set; } = 10;

    public string? WhiteCaptainId { get; set; }

    public string? BlackCaptainId { get; set; }

    public Team CurrentTurn { get; set; } = Team.White;

    public string FEN { get; set; } = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    public GameStatus Status { get; set; } = GameStatus.InProgress;

    // Current turn state (for timers)
    public string? CurrentPlayerId { get; set; }

    public DateTime? TurnStartTime { get; set; }

    // Redis stores as arrays, not navigation properties
    public List<string> PlayerIds { get; set; } = new();

    public List<string> MoveIds { get; set; } = new();

    // Helper methods for Redis operations
    public string GetRedisKey() => $"game:{Id}";
    public string GetPlayersSetKey() => $"game:{Id}:players";
    public string GetMovesListKey() => $"game:{Id}:moves";
    public string GetSignalRGroupKey() => $"game-{Id}";
}

/// <summary>
/// Redis-optimized model for game player
/// Stored as: game-player:{id}
/// </summary>
public class RedisPlayer
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string GameId { get; set; } = string.Empty;

    public string ConnectionId { get; set; } = string.Empty;

    public string Nickname { get; set; } = string.Empty;

    public Team Team { get; set; }

    public PlayerRole Role { get; set; }

    public string? PieceId { get; set; }  // e.g., "white-pawn-1"

    public bool IsActive { get; set; } = true;

    // Helper methods
    public string GetRedisKey() => $"game-player:{Id}";
    public string GetGameKey() => $"game:{GameId}";
}

/// <summary>
/// Redis-optimized model for game moves
/// Stored as: move:{id} and added to game:{gameId}:moves list
/// </summary>
public class RedisMove
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string GameId { get; set; } = string.Empty;

    public string FromSquare { get; set; } = string.Empty;

    public string ToSquare { get; set; } = string.Empty;

    public string PlayerId { get; set; } = string.Empty;

    public string? CaptainId { get; set; }

    public string PieceType { get; set; } = string.Empty;

    public string? CapturedPiece { get; set; }

    public string ResultingFEN { get; set; } = string.Empty;

    public string? Notation { get; set; }

    public bool IsAutoMove { get; set; } = false;

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;  // Keep for move ordering

    // Helper methods
    public string GetRedisKey() => $"move:{Id}";
}
