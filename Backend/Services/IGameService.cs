using VibeChess.Backend.Models.Redis;
using VibeChess.Backend.Models;
using VibeChess.Backend.DTOs;
using VibeChess.Backend.Enums;

namespace VibeChess.Backend.Services;

public interface IGameService
{
    // Game management
    Task<ApiResponse<GameResponse>> CreateGameFromLobbyAsync(string lobbyId);
    Task<ApiResponse<GameResponse>> GetGameAsync(string gameId);
    Task<ApiResponse<object>> EndGameAsync(string gameId, GameStatus finalStatus, string? winner = null);

    // Player actions
    Task<ApiResponse<object>> MakeMoveAsync(string gameId, string playerId, string fromSquare, string toSquare);
    Task<ApiResponse<object>> SelectPieceAsync(string gameId, string captainId, string pieceId);

    // Turn management
    Task<ApiResponse<object>> StartPlayerTurnAsync(string gameId, string playerId);
    Task<ApiResponse<object>> HandleTurnTimeoutAsync(string gameId);

    // Player management
    Task<ApiResponse<object>> ReconnectPlayerAsync(string gameId, string playerId, string newConnectionId);
    Task<ApiResponse<object>> HandlePlayerDisconnectAsync(string gameId, string connectionId);

    // Game state
    Task<List<RedisPlayer>> GetGamePlayersAsync(string gameId);
    Task<List<RedisMove>> GetGameMovesAsync(string gameId, int? lastN = null);

    // Cleanup
    Task CleanupFinishedGamesAsync();
}
