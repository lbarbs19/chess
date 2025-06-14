using System.Text.Json.Serialization;
using VibeChess.Backend.Enums;

namespace VibeChess.Backend.Models.Redis;

/// <summary>
/// Redis-optimized model for active lobby state
/// Stored as: lobby:{roomCode}
/// </summary>
public class RedisLobby
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string RoomCode { get; set; } = string.Empty;

    public GameMode GameMode { get; set; }

    public int MoveTimerSeconds { get; set; } = 10;

    public int MaxPlayers { get; set; } = 32;

    public string? WhiteCaptainId { get; set; }

    public string? BlackCaptainId { get; set; }

    public LobbyStatus Status { get; set; } = LobbyStatus.WaitingForPlayers;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Redis stores as JSON array, not navigation property
    public List<string> PlayerIds { get; set; } = new();

    // Helper methods for Redis operations
    public string GetRedisKey() => $"lobby:{RoomCode}";
    public string GetPlayersSetKey() => $"lobby:{RoomCode}:players";
}

/// <summary>
/// Redis-optimized model for lobby player
/// Stored as: lobby-player:{id}
/// </summary>
public class RedisLobbyPlayer
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string LobbyId { get; set; } = string.Empty;

    public string ConnectionId { get; set; } = string.Empty;

    public string Nickname { get; set; } = string.Empty;

    public PlayerRole Role { get; set; } = PlayerRole.Player;

    // Helper methods
    public string GetRedisKey() => $"lobby-player:{Id}";
    public string GetLobbyKey() => $"lobby:{LobbyId}";
}
