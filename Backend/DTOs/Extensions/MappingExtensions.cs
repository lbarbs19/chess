using VibeChess.Backend.Models;
using VibeChess.Backend.Models.Redis;
using VibeChess.Backend.DTOs;
using VibeChess.Backend.Enums;

namespace VibeChess.Backend.DTOs.Extensions;

public static class MappingExtensions
{
    // Lobby mappings
    public static LobbyResponse ToDto(this RedisLobby lobby, List<RedisLobbyPlayer> players)
    {
        return new LobbyResponse(
            lobby.Id,
            lobby.RoomCode,
            lobby.GameMode,
            lobby.MoveTimerSeconds,
            lobby.MaxPlayers,
            lobby.Status,
            players.Select(p => p.ToDto()).ToList(),
            CanStart: lobby.Status == LobbyStatus.ReadyToStart
        );
    }

    public static LobbyPlayerResponse ToDto(this RedisLobbyPlayer player)
    {
        return new LobbyPlayerResponse(
            player.Id,
            player.Nickname,
            player.Role
        );
    }

    // Game mappings
    public static GameResponse ToDto(this RedisGame game, List<RedisPlayer> players, List<RedisMove> recentMoves)
    {
        return new GameResponse(
            game.Id,
            game.RoomCode,
            game.GameMode,
            game.MoveTimerSeconds,
            game.CurrentTurn.ToString(),
            game.FEN,
            game.Status,
            players.Select(p => p.ToDto(game.CurrentPlayerId)).ToList(),
            game.CurrentPlayerId,
            GetTimeRemaining(game.TurnStartTime, game.MoveTimerSeconds),
            recentMoves.Select(m => m.ToDto(players)).ToList()
        );
    }

    public static GamePlayerResponse ToDto(this RedisPlayer player, string? currentPlayerId)
    {
        return new GamePlayerResponse(
            player.Id,
            player.Nickname,
            player.Team.ToString(),
            player.Role.ToString(),
            player.PieceId,
            player.IsActive,
            player.Id == currentPlayerId
        );
    }

    public static GameMoveResponse ToDto(this RedisMove move, List<RedisPlayer> players)
    {
        var player = players.FirstOrDefault(p => p.Id == move.PlayerId);
        var captain = !string.IsNullOrEmpty(move.CaptainId)
            ? players.FirstOrDefault(p => p.Id == move.CaptainId)
            : null;

        return new GameMoveResponse(
            move.Id,
            move.FromSquare,
            move.ToSquare,
            player?.Nickname ?? "Unknown",
            captain?.Nickname,
            move.PieceType,
            move.CapturedPiece,
            move.Notation,
            move.IsAutoMove,
            move.Timestamp
        );
    }

    // Update DTOs
    public static GameUpdateDto ToUpdateDto(this RedisGame game, RedisMove? lastMove = null, List<RedisPlayer>? players = null)
    {
        return new GameUpdateDto(
            game.CurrentTurn.ToString(),
            game.FEN,
            game.CurrentPlayerId,
            GetTimeRemaining(game.TurnStartTime, game.MoveTimerSeconds),
            lastMove?.ToDto(players ?? new List<RedisPlayer>())
        );
    }

    public static PieceSelectedDto ToPieceSelectedDto(string pieceId, RedisPlayer player, int timeRemaining)
    {
        return new PieceSelectedDto(
            pieceId,
            player.Id,
            player.Nickname,
            timeRemaining
        );
    }

    public static TimerUpdateDto ToTimerDto(this RedisGame game)
    {
        return new TimerUpdateDto(
            GetTimeRemaining(game.TurnStartTime, game.MoveTimerSeconds) ?? 0,
            game.CurrentPlayerId
        );
    }

    // Helper methods
    private static int? GetTimeRemaining(DateTime? turnStartTime, int moveTimerSeconds)
    {
        if (!turnStartTime.HasValue) return null;

        var elapsed = DateTime.UtcNow - turnStartTime.Value;
        var remaining = moveTimerSeconds - (int)elapsed.TotalSeconds;
        return Math.Max(0, remaining);
    }

    // Conversion from DTOs to models
    public static RedisLobby ToRedisModel(this CreateLobbyRequest request, string roomCode)
    {
        return new RedisLobby
        {
            RoomCode = roomCode,
            GameMode = request.GameMode,
            MoveTimerSeconds = request.MoveTimerSeconds,
            MaxPlayers = request.MaxPlayers,
            Status = LobbyStatus.WaitingForPlayers
        };
    }

    public static RedisLobbyPlayer ToRedisModel(this JoinLobbyRequest request, string lobbyId, string connectionId)
    {
        return new RedisLobbyPlayer
        {
            LobbyId = lobbyId,
            ConnectionId = connectionId,
            Nickname = request.Nickname,
            Role = request.Role
        };
    }
}
