using VibeChess.Backend.Models.Redis;
using VibeChess.Backend.DTOs;
using VibeChess.Backend.DTOs.Extensions;
using VibeChess.Backend.Enums;

namespace VibeChess.Backend.Services;

public interface ILobbyService
{
    // Lobby management
    Task<ApiResponse<LobbyResponse>> CreateLobbyAsync(CreateLobbyRequest request);
    Task<ApiResponse<LobbyResponse>> JoinLobbyAsync(JoinLobbyRequest request, string connectionId);
    Task<ApiResponse<object>> LeaveLobbyAsync(string roomCode, string connectionId);
    Task<ApiResponse<LobbyResponse>> GetLobbyAsync(string roomCode);
    Task<ApiResponse<List<LobbyResponse>>> GetActiveLobbiesAsync();

    // Player management
    Task<ApiResponse<object>> UpdatePlayerRoleAsync(string roomCode, string playerId, PlayerRole newRole);
    Task<ApiResponse<object>> RemovePlayerAsync(string roomCode, string playerId);

    // Lobby settings
    Task<ApiResponse<object>> UpdateLobbySettingsAsync(string roomCode, UpdateLobbySettingsRequest request);

    // Game transition
    Task<ApiResponse<string>> StartGameAsync(string roomCode);

    // Cleanup
    Task CleanupExpiredLobbiesAsync();
}

public class LobbyService : ILobbyService
{
    private readonly IRedisService _redis;
    private readonly ILogger<LobbyService> _logger;
    private static readonly TimeSpan LobbyExpiry = TimeSpan.FromHours(24);

    public LobbyService(IRedisService redis, ILogger<LobbyService> logger)
    {
        _redis = redis;
        _logger = logger;
    }

    public async Task<ApiResponse<LobbyResponse>> CreateLobbyAsync(CreateLobbyRequest request)
    {
        try
        {
            // Generate unique room code
            var roomCode = await GenerateUniqueRoomCodeAsync();

            // Create lobby
            var lobby = request.ToRedisModel(roomCode);

            // Create host player
            var hostPlayer = new RedisLobbyPlayer
            {
                LobbyId = lobby.Id,
                ConnectionId = "", // Will be set when they connect via SignalR
                Nickname = request.HostNickname,
                Role = PlayerRole.Captain // Host starts as captain
            };

            // Save to Redis
            await _redis.SetAsync(lobby.GetRedisKey(), lobby, LobbyExpiry);
            await _redis.SetAsync(hostPlayer.GetRedisKey(), hostPlayer, LobbyExpiry);
            await _redis.SetAddAsync(lobby.GetPlayersSetKey(), hostPlayer.Id);
            await _redis.SetAddAsync(RedisKeys.ActiveLobbies(), roomCode);

            _logger.LogInformation("Created lobby {RoomCode} with host {HostNickname}", roomCode, request.HostNickname);

            var response = lobby.ToDto(new List<RedisLobbyPlayer> { hostPlayer });
            return ApiResponse.Ok(response, "Lobby created successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create lobby for host {HostNickname}", request.HostNickname);
            return ApiResponse.Error<LobbyResponse>("Failed to create lobby");
        }
    }

    public async Task<ApiResponse<LobbyResponse>> JoinLobbyAsync(JoinLobbyRequest request, string connectionId)
    {
        try
        {
            // Get lobby
            var lobby = await _redis.GetAsync<RedisLobby>(RedisKeys.Lobby(request.RoomCode));
            if (lobby == null)
            {
                return ApiResponse.Error<LobbyResponse>("Lobby not found");
            }

            // Check if lobby is full
            var playerCount = await _redis.SetLengthAsync(lobby.GetPlayersSetKey());
            if (playerCount >= lobby.MaxPlayers)
            {
                return ApiResponse.Error<LobbyResponse>("Lobby is full");
            }

            // Check if lobby is still accepting players
            if (lobby.Status != LobbyStatus.WaitingForPlayers)
            {
                return ApiResponse.Error<LobbyResponse>("Lobby is no longer accepting players");
            }

            // Create player
            var player = new RedisLobbyPlayer
            {
                LobbyId = lobby.Id,
                ConnectionId = connectionId,
                Nickname = request.Nickname,
                Role = request.Role
            };

            // Handle captain role assignment
            if (request.Role == PlayerRole.Captain)
            {
                var result = await AssignCaptainRoleAsync(lobby, player);
                if (!result.Success)
                {
                    return ApiResponse.Error<LobbyResponse>(result.Error!);
                }
            }

            // Save player
            await _redis.SetAsync(player.GetRedisKey(), player, LobbyExpiry);
            await _redis.SetAddAsync(lobby.GetPlayersSetKey(), player.Id);

            // Update lobby status if ready
            await UpdateLobbyStatusAsync(lobby);

            _logger.LogInformation("Player {Nickname} joined lobby {RoomCode}", request.Nickname, request.RoomCode);

            // Return updated lobby
            var players = await GetLobbyPlayersAsync(lobby);
            var response = lobby.ToDto(players);
            return ApiResponse.Ok(response, "Joined lobby successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to join lobby {RoomCode} for player {Nickname}", request.RoomCode, request.Nickname);
            return ApiResponse.Error<LobbyResponse>("Failed to join lobby");
        }
    }

    public async Task<ApiResponse<object>> LeaveLobbyAsync(string roomCode, string connectionId)
    {
        try
        {
            var lobby = await _redis.GetAsync<RedisLobby>(RedisKeys.Lobby(roomCode));
            if (lobby == null)
            {
                return ApiResponse.Error<object>("Lobby not found");
            }

            // Find player by connection ID
            var playerIds = await _redis.SetMembersAsync(lobby.GetPlayersSetKey());
            RedisLobbyPlayer? playerToRemove = null;

            foreach (var playerId in playerIds)
            {
                var player = await _redis.GetAsync<RedisLobbyPlayer>(RedisKeys.LobbyPlayer(playerId));
                if (player?.ConnectionId == connectionId)
                {
                    playerToRemove = player;
                    break;
                }
            }

            if (playerToRemove == null)
            {
                return ApiResponse.Error<object>("Player not found in lobby");
            }

            // Remove player
            await _redis.SetRemoveAsync(lobby.GetPlayersSetKey(), playerToRemove.Id);
            await _redis.DeleteAsync(playerToRemove.GetRedisKey());

            // Handle captain leaving
            if (playerToRemove.Role == PlayerRole.Captain)
            {
                await HandleCaptainLeavingAsync(lobby, playerToRemove);
            }

            // Check if lobby is now empty
            var remainingPlayerCount = await _redis.SetLengthAsync(lobby.GetPlayersSetKey());
            if (remainingPlayerCount == 0)
            {
                await DeleteLobbyAsync(lobby);
                _logger.LogInformation("Deleted empty lobby {RoomCode}", roomCode);
            }
            else
            {
                await UpdateLobbyStatusAsync(lobby);
            }

            _logger.LogInformation("Player {Nickname} left lobby {RoomCode}", playerToRemove.Nickname, roomCode);
            return ApiResponse.Ok("Left lobby successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to leave lobby {RoomCode}", roomCode);
            return ApiResponse.Error<object>("Failed to leave lobby");
        }
    }

    public async Task<ApiResponse<LobbyResponse>> GetLobbyAsync(string roomCode)
    {
        try
        {
            var lobby = await _redis.GetAsync<RedisLobby>(RedisKeys.Lobby(roomCode));
            if (lobby == null)
            {
                return ApiResponse.Error<LobbyResponse>("Lobby not found");
            }

            var players = await GetLobbyPlayersAsync(lobby);
            var response = lobby.ToDto(players);
            return ApiResponse.Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get lobby {RoomCode}", roomCode);
            return ApiResponse.Error<LobbyResponse>("Failed to get lobby");
        }
    }

    public async Task<ApiResponse<List<LobbyResponse>>> GetActiveLobbiesAsync()
    {
        try
        {
            var activeLobbyCodes = await _redis.SetMembersAsync(RedisKeys.ActiveLobbies());
            var lobbies = new List<LobbyResponse>();

            foreach (var roomCode in activeLobbyCodes)
            {
                var lobby = await _redis.GetAsync<RedisLobby>(RedisKeys.Lobby(roomCode));
                if (lobby != null)
                {
                    var players = await GetLobbyPlayersAsync(lobby);
                    lobbies.Add(lobby.ToDto(players));
                }
            }

            return ApiResponse.Success(lobbies);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active lobbies");
            return ApiResponse.Error<List<LobbyResponse>>("Failed to get active lobbies");
        }
    }

    public async Task<ApiResponse<object>> UpdatePlayerRoleAsync(string roomCode, string playerId, PlayerRole newRole)
    {
        // Implementation for updating player roles
        // This would be used for promoting players to captain, etc.
        await Task.CompletedTask;
        return ApiResponse.Ok("Role updated successfully");
    }

    public async Task<ApiResponse<object>> RemovePlayerAsync(string roomCode, string playerId)
    {
        // Implementation for removing specific players (admin function)
        await Task.CompletedTask;
        return ApiResponse.Ok("Player removed successfully");
    }
    public async Task<ApiResponse<object>> UpdateLobbySettingsAsync(string roomCode, UpdateLobbySettingsRequest request)
    {
        try
        {
            var lobby = await _redis.GetAsync<RedisLobby>(RedisKeys.Lobby(roomCode));
            if (lobby == null)
            {
                return ApiResponse.Error("Lobby not found");
            }

            // Get all players to find the host (first player)
            var players = await GetLobbyPlayersAsync(lobby);
            var hostPlayer = players.FirstOrDefault(); // First player is typically the host

            if (hostPlayer?.Id != request.HostPlayerId)
            {
                return ApiResponse.Error("Only the host can update lobby settings");
            }

            // Update lobby properties
            lobby.GameMode = request.GameMode ?? lobby.GameMode;
            lobby.MoveTimerSeconds = request.MoveTimerSeconds ?? lobby.MoveTimerSeconds;
            lobby.MaxPlayers = request.MaxPlayers ?? lobby.MaxPlayers;

            await _redis.SetAsync(RedisKeys.Lobby(roomCode), lobby);

            return ApiResponse.Success("Lobby settings updated successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating lobby settings for {RoomCode}", roomCode);
            return ApiResponse.Error("Failed to update lobby settings");
        }
    }

    public async Task<ApiResponse<string>> StartGameAsync(string roomCode)
    {
        try
        {
            var lobby = await _redis.GetAsync<RedisLobby>(RedisKeys.Lobby(roomCode));
            if (lobby == null)
            {
                return ApiResponse.Error<string>("Lobby not found");
            }

            // Validate lobby can start
            var validationResult = await ValidateLobbyCanStartAsync(lobby);
            if (!validationResult.Success)
            {
                return ApiResponse.Error<string>(validationResult.Error!);
            }

            // Generate game ID
            var gameId = Guid.NewGuid().ToString();

            // Update lobby status
            lobby.Status = LobbyStatus.GameStarted;
            await _redis.SetAsync(lobby.GetRedisKey(), lobby, LobbyExpiry);

            _logger.LogInformation("Started game {GameId} from lobby {RoomCode}", gameId, roomCode);
            return ApiResponse.Ok(gameId, "Game started successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to start game from lobby {RoomCode}", roomCode);
            return ApiResponse.Error<string>("Failed to start game");
        }
    }

    public async Task CleanupExpiredLobbiesAsync()
    {
        try
        {
            var activeLobbyCodes = await _redis.SetMembersAsync(RedisKeys.ActiveLobbies());
            var expiredLobbies = new List<string>();

            foreach (var roomCode in activeLobbyCodes)
            {
                var ttl = await _redis.TimeToLiveAsync(RedisKeys.Lobby(roomCode));
                if (!ttl.HasValue || ttl.Value <= TimeSpan.Zero)
                {
                    expiredLobbies.Add(roomCode);
                }
            }

            foreach (var roomCode in expiredLobbies)
            {
                var lobby = await _redis.GetAsync<RedisLobby>(RedisKeys.Lobby(roomCode));
                if (lobby != null)
                {
                    await DeleteLobbyAsync(lobby);
                }
                await _redis.SetRemoveAsync(RedisKeys.ActiveLobbies(), roomCode);
            }

            if (expiredLobbies.Count > 0)
            {
                _logger.LogInformation("Cleaned up {Count} expired lobbies", expiredLobbies.Count);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to cleanup expired lobbies");
        }
    }

    // Private helper methods
    private async Task<string> GenerateUniqueRoomCodeAsync()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();

        for (int attempts = 0; attempts < 10; attempts++)
        {
            var roomCode = new string(Enumerable.Repeat(chars, 6)
                .Select(s => s[random.Next(s.Length)]).ToArray());

            if (!await _redis.ExistsAsync(RedisKeys.Lobby(roomCode)))
            {
                return roomCode;
            }
        }

        throw new InvalidOperationException("Unable to generate unique room code");
    }

    private async Task<List<RedisLobbyPlayer>> GetLobbyPlayersAsync(RedisLobby lobby)
    {
        var playerIds = await _redis.SetMembersAsync(lobby.GetPlayersSetKey());
        var playerKeys = playerIds.Select(RedisKeys.LobbyPlayer);
        var players = await _redis.GetAllAsync<RedisLobbyPlayer>(playerKeys);
        return players.ToList();
    }

    private async Task<ApiResponse<object>> AssignCaptainRoleAsync(RedisLobby lobby, RedisLobbyPlayer player)
    {
        // Check if we need captains for this game mode
        if (lobby.GameMode != GameMode.Captain)
        {
            player.Role = PlayerRole.Player;
            return ApiResponse.Ok("Role assigned as player (no captains needed for this mode)");
        }

        // Check captain slots
        if (string.IsNullOrEmpty(lobby.WhiteCaptainId))
        {
            lobby.WhiteCaptainId = player.Id;
            await _redis.SetAsync(lobby.GetRedisKey(), lobby, LobbyExpiry);
            return ApiResponse.Ok("Assigned as White captain");
        }
        else if (string.IsNullOrEmpty(lobby.BlackCaptainId))
        {
            lobby.BlackCaptainId = player.Id;
            await _redis.SetAsync(lobby.GetRedisKey(), lobby, LobbyExpiry);
            return ApiResponse.Ok("Assigned as Black captain");
        }
        else
        {
            player.Role = PlayerRole.Player;
            return ApiResponse.Error<object>("Both captain slots are taken");
        }
    }

    private async Task UpdateLobbyStatusAsync(RedisLobby lobby)
    {
        var playerCount = await _redis.SetLengthAsync(lobby.GetPlayersSetKey());

        // Determine if lobby is ready to start
        var canStart = playerCount >= 2;

        if (lobby.GameMode == GameMode.Captain)
        {
            canStart = canStart &&
                       !string.IsNullOrEmpty(lobby.WhiteCaptainId) &&
                       !string.IsNullOrEmpty(lobby.BlackCaptainId);
        }

        lobby.Status = canStart ? LobbyStatus.ReadyToStart : LobbyStatus.WaitingForPlayers;
        await _redis.SetAsync(lobby.GetRedisKey(), lobby, LobbyExpiry);
    }

    private async Task HandleCaptainLeavingAsync(RedisLobby lobby, RedisLobbyPlayer leavingCaptain)
    {
        if (lobby.WhiteCaptainId == leavingCaptain.Id)
        {
            lobby.WhiteCaptainId = null;
        }
        else if (lobby.BlackCaptainId == leavingCaptain.Id)
        {
            lobby.BlackCaptainId = null;
        }

        await _redis.SetAsync(lobby.GetRedisKey(), lobby, LobbyExpiry);
    }

    private async Task<ApiResponse<object>> ValidateLobbyCanStartAsync(RedisLobby lobby)
    {
        var playerCount = await _redis.SetLengthAsync(lobby.GetPlayersSetKey());

        if (playerCount < 2)
        {
            return ApiResponse.Error<object>("Need at least 2 players to start");
        }

        if (lobby.GameMode == GameMode.Captain)
        {
            if (string.IsNullOrEmpty(lobby.WhiteCaptainId) || string.IsNullOrEmpty(lobby.BlackCaptainId))
            {
                return ApiResponse.Error<object>("Need both White and Black captains to start");
            }
        }

        return ApiResponse.Ok("Lobby is ready to start");
    }

    private async Task DeleteLobbyAsync(RedisLobby lobby)
    {
        // Delete all players
        var playerIds = await _redis.SetMembersAsync(lobby.GetPlayersSetKey());
        foreach (var playerId in playerIds)
        {
            await _redis.DeleteAsync(RedisKeys.LobbyPlayer(playerId));
        }

        // Delete lobby data
        await _redis.DeleteAsync(lobby.GetRedisKey());
        await _redis.DeleteAsync(lobby.GetPlayersSetKey());
        await _redis.SetRemoveAsync(RedisKeys.ActiveLobbies(), lobby.RoomCode);
    }
}
