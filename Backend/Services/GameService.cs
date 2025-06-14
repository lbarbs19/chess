using VibeChess.Backend.Models.Redis;
using VibeChess.Backend.Models;
using VibeChess.Backend.DTOs;
using VibeChess.Backend.DTOs.Extensions;
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

public class GameService : IGameService
{
    private readonly IRedisService _redis;
    private readonly ILobbyService _lobbyService;
    private readonly IChessValidationService _chessValidator;
    private readonly ILogger<GameService> _logger;
    private static readonly TimeSpan GameExpiry = TimeSpan.FromHours(48);

    public GameService(
        IRedisService redis,
        ILobbyService lobbyService,
        IChessValidationService chessValidator,
        ILogger<GameService> logger)
    {
        _redis = redis;
        _lobbyService = lobbyService;
        _chessValidator = chessValidator;
        _logger = logger;
    }

    public async Task<ApiResponse<GameResponse>> CreateGameFromLobbyAsync(string lobbyId)
    {
        try
        {
            // Get lobby
            var lobby = await _redis.GetAsync<RedisLobby>(RedisKeys.Lobby(lobbyId));
            if (lobby == null)
            {
                return ApiResponse.Error<GameResponse>("Lobby not found");
            }

            // Get lobby players
            var lobbyPlayers = await GetLobbyPlayersAsync(lobby);
            if (lobbyPlayers.Count < 2)
            {
                return ApiResponse.Error<GameResponse>("Need at least 2 players to start game");
            }

            // Create game
            var game = new RedisGame
            {
                RoomCode = lobby.RoomCode,
                GameMode = lobby.GameMode,
                MoveTimerSeconds = lobby.MoveTimerSeconds,
                WhiteCaptainId = lobby.WhiteCaptainId,
                BlackCaptainId = lobby.BlackCaptainId,
                Status = GameStatus.InProgress,
                CurrentTurn = Team.White
            };

            // Convert lobby players to game players with team/piece assignments
            var gamePlayers = await AssignPlayersToTeamsAndPieces(lobbyPlayers, game);

            // Save game
            await _redis.SetAsync(game.GetRedisKey(), game, GameExpiry);
            await _redis.SetAddAsync(RedisKeys.ActiveGames(), game.Id);

            // Save players
            foreach (var player in gamePlayers)
            {
                await _redis.SetAsync(player.GetRedisKey(), player, GameExpiry);
                await _redis.SetAddAsync(game.GetPlayersSetKey(), player.Id);
                game.PlayerIds.Add(player.Id);
            }

            // Update game with player IDs
            await _redis.SetAsync(game.GetRedisKey(), game, GameExpiry);

            _logger.LogInformation("Created game {GameId} from lobby {LobbyId} with {PlayerCount} players",
                game.Id, lobbyId, gamePlayers.Count);

            // Return game response
            var response = game.ToDto(gamePlayers, new List<RedisMove>());
            return ApiResponse.Ok(response, "Game created successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create game from lobby {LobbyId}", lobbyId);
            return ApiResponse.Error<GameResponse>("Failed to create game");
        }
    }

    public async Task<ApiResponse<GameResponse>> GetGameAsync(string gameId)
    {
        try
        {
            var game = await _redis.GetAsync<RedisGame>(RedisKeys.Game(gameId));
            if (game == null)
            {
                return ApiResponse.Error<GameResponse>("Game not found");
            }

            var players = await GetGamePlayersAsync(gameId);
            var recentMoves = await GetGameMovesAsync(gameId, 10); // Last 10 moves

            var response = game.ToDto(players, recentMoves);
            return ApiResponse.Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get game {GameId}", gameId);
            return ApiResponse.Error<GameResponse>("Failed to get game");
        }
    }

    public async Task<ApiResponse<object>> MakeMoveAsync(string gameId, string playerId, string fromSquare, string toSquare)
    {
        try
        {
            var game = await _redis.GetAsync<RedisGame>(RedisKeys.Game(gameId));
            if (game == null)
            {
                return ApiResponse.Error<object>("Game not found");
            }

            var player = await _redis.GetAsync<RedisPlayer>(RedisKeys.GamePlayer(playerId));
            if (player == null)
            {
                return ApiResponse.Error<object>("Player not found");
            }

            // Validate it's this player's turn
            if (game.CurrentPlayerId != playerId)
            {
                return ApiResponse.Error<object>("Not your turn");
            }            // Validate the move is legal
            if (!_chessValidator.IsMoveLegal(game.FEN, fromSquare, toSquare))
            {
                return ApiResponse.Error<object>("Invalid move");
            }

            // Execute the move
            var newFen = _chessValidator.MakeMove(game.FEN, fromSquare, toSquare);
            if (newFen == game.FEN) // Move was invalid
            {
                return ApiResponse.Error<object>("Invalid move");
            }

            // Create move record
            var move = new RedisMove
            {
                GameId = gameId,
                PlayerId = playerId,
                FromSquare = fromSquare,
                ToSquare = toSquare,
                PieceType = "", // Will need to determine this differently
                CapturedPiece = "", // Will need to determine this differently
                ResultingFEN = newFen,
                Notation = $"{fromSquare}-{toSquare}", // Simplified notation for now
                IsAutoMove = false
            };// Update game state
            game.FEN = newFen;
            game.CurrentTurn = game.CurrentTurn == Team.White ? Team.Black : Team.White;
            game.CurrentPlayerId = null; // Clear until next piece is selected
            game.TurnStartTime = null;            // Handle piece capture (simplified - we don't track individual captured pieces anymore)
            // TODO: If needed, implement capture tracking using FEN comparison

            // Check for game end conditions
            if (_chessValidator.IsCheckmate(newFen))
            {
                game.Status = GameStatus.Finished;
                await EndGameAsync(gameId, GameStatus.Finished);
            }
            else if (_chessValidator.IsStalemate(newFen))
            {
                game.Status = GameStatus.Finished;
                await EndGameAsync(gameId, GameStatus.Finished);
            }

            // Save updates
            await _redis.SetAsync(game.GetRedisKey(), game, GameExpiry);
            await _redis.SetAsync(move.GetRedisKey(), move, GameExpiry);
            await _redis.ListRightPushAsync(game.GetMovesListKey(), move.Id);

            _logger.LogInformation("Player {PlayerId} made move {From}-{To} in game {GameId}",
                playerId, fromSquare, toSquare, gameId);

            return ApiResponse.Ok("Move completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to make move for player {PlayerId} in game {GameId}", playerId, gameId);
            return ApiResponse.Error<object>("Failed to make move");
        }
    }

    public async Task<ApiResponse<object>> SelectPieceAsync(string gameId, string captainId, string pieceId)
    {
        try
        {
            var game = await _redis.GetAsync<RedisGame>(RedisKeys.Game(gameId));
            if (game == null)
            {
                return ApiResponse.Error<object>("Game not found");
            }

            // Validate captain mode
            if (game.GameMode != GameMode.Captain)
            {
                return ApiResponse.Error<object>("Piece selection only available in Captain mode");
            }

            // Validate it's this captain's turn
            var isWhiteTurn = game.CurrentTurn == Team.White;
            var expectedCaptainId = isWhiteTurn ? game.WhiteCaptainId : game.BlackCaptainId;

            if (captainId != expectedCaptainId)
            {
                return ApiResponse.Error<object>("Not your turn to select a piece");
            }

            // Find player who controls this piece
            var players = await GetGamePlayersAsync(gameId);
            var player = players.FirstOrDefault(p => p.PieceId == pieceId && p.Team == game.CurrentTurn);

            if (player == null)
            {
                return ApiResponse.Error<object>("No player controls this piece or piece is on wrong team");
            }

            if (!player.IsActive)
            {
                return ApiResponse.Error<object>("Player controlling this piece is not active");
            }            // Validate current team has legal moves (simplified check)
            // Using simplified logic - if it's not checkmate or stalemate, there are legal moves
            if (_chessValidator.IsCheckmate(game.FEN) || _chessValidator.IsStalemate(game.FEN))
            {
                return ApiResponse.Error<object>("Selected piece has no legal moves");
            }

            // Start player's turn
            game.CurrentPlayerId = player.Id;
            game.TurnStartTime = DateTime.UtcNow;
            await _redis.SetAsync(game.GetRedisKey(), game, GameExpiry);

            _logger.LogInformation("Captain {CaptainId} selected piece {PieceId} for player {PlayerId} in game {GameId}",
                captainId, pieceId, player.Id, gameId);

            return ApiResponse.Ok("Piece selected successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to select piece {PieceId} for captain {CaptainId} in game {GameId}",
                pieceId, captainId, gameId);
            return ApiResponse.Error<object>("Failed to select piece");
        }
    }

    public async Task<ApiResponse<object>> StartPlayerTurnAsync(string gameId, string playerId)
    {
        try
        {
            var game = await _redis.GetAsync<RedisGame>(RedisKeys.Game(gameId));
            if (game == null)
            {
                return ApiResponse.Error<object>("Game not found");
            }

            // For no-captain mode, randomly select a piece
            if (game.GameMode == GameMode.NoCaptain)
            {
                var availablePieces = await GetAvailablePiecesForTurn(gameId, game.CurrentTurn);
                if (availablePieces.Count == 0)
                {
                    return ApiResponse.Error<object>("No available pieces for current team");
                }

                var randomPiece = availablePieces[Random.Shared.Next(availablePieces.Count)];
                game.CurrentPlayerId = randomPiece.PlayerId;
                game.TurnStartTime = DateTime.UtcNow;
                await _redis.SetAsync(game.GetRedisKey(), game, GameExpiry);

                _logger.LogInformation("Auto-selected piece {PieceId} for player {PlayerId} in no-captain game {GameId}",
                    randomPiece.PieceId, randomPiece.PlayerId, gameId);
            }

            return ApiResponse.Ok("Turn started successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to start turn for player {PlayerId} in game {GameId}", playerId, gameId);
            return ApiResponse.Error<object>("Failed to start turn");
        }
    }

    public async Task<ApiResponse<object>> HandleTurnTimeoutAsync(string gameId)
    {
        try
        {
            var game = await _redis.GetAsync<RedisGame>(RedisKeys.Game(gameId));
            if (game == null)
            {
                return ApiResponse.Error<object>("Game not found");
            }

            if (string.IsNullOrEmpty(game.CurrentPlayerId))
            {
                return ApiResponse.Error<object>("No active player turn");
            }

            var player = await _redis.GetAsync<RedisPlayer>(RedisKeys.GamePlayer(game.CurrentPlayerId));
            if (player == null)
            {
                return ApiResponse.Error<object>("Current player not found");
            }            // For auto-move, we'll make a simple random move
            // This is a simplified implementation - in a full implementation we would need
            // a way to get all legal moves from the ChessDotNet library
            // For now, we'll just return an error as this feature needs more sophisticated implementation
            return ApiResponse.Error<object>("Auto-move feature needs implementation with move generation");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to handle timeout for game {GameId}", gameId);
            return ApiResponse.Error<object>("Failed to handle timeout");
        }
    }

    public async Task<ApiResponse<object>> ReconnectPlayerAsync(string gameId, string playerId, string newConnectionId)
    {
        try
        {
            var player = await _redis.GetAsync<RedisPlayer>(RedisKeys.GamePlayer(playerId));
            if (player == null)
            {
                return ApiResponse.Error<object>("Player not found");
            }

            player.ConnectionId = newConnectionId;
            await _redis.SetAsync(player.GetRedisKey(), player, GameExpiry);

            _logger.LogInformation("Player {PlayerId} reconnected to game {GameId}", playerId, gameId);
            return ApiResponse.Ok("Player reconnected successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to reconnect player {PlayerId} to game {GameId}", playerId, gameId);
            return ApiResponse.Error<object>("Failed to reconnect player");
        }
    }

    public async Task<ApiResponse<object>> HandlePlayerDisconnectAsync(string gameId, string connectionId)
    {
        try
        {
            // Find player by connection ID
            var players = await GetGamePlayersAsync(gameId);
            var disconnectedPlayer = players.FirstOrDefault(p => p.ConnectionId == connectionId);

            if (disconnectedPlayer != null)
            {
                // Mark as temporarily disconnected but keep in game
                _logger.LogInformation("Player {PlayerId} disconnected from game {GameId}",
                    disconnectedPlayer.Id, gameId);
            }

            return ApiResponse.Ok("Disconnect handled");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to handle disconnect for game {GameId}", gameId);
            return ApiResponse.Error<object>("Failed to handle disconnect");
        }
    }

    public async Task<List<RedisPlayer>> GetGamePlayersAsync(string gameId)
    {
        var playerIds = await _redis.SetMembersAsync(RedisKeys.GamePlayers(gameId));
        var playerKeys = playerIds.Select(RedisKeys.GamePlayer);
        var players = await _redis.GetAllAsync<RedisPlayer>(playerKeys);
        return players.ToList();
    }

    public async Task<List<RedisMove>> GetGameMovesAsync(string gameId, int? lastN = null)
    {
        var moveIds = await _redis.ListRangeAsync(RedisKeys.GameMoves(gameId));

        if (lastN.HasValue)
        {
            moveIds = moveIds.TakeLast(lastN.Value).ToArray();
        }

        var moveKeys = moveIds.Select(RedisKeys.Move);
        var moves = await _redis.GetAllAsync<RedisMove>(moveKeys);
        return moves.OrderBy(m => m.Timestamp).ToList();
    }

    public async Task<ApiResponse<object>> EndGameAsync(string gameId, GameStatus finalStatus, string? winner = null)
    {
        try
        {
            var game = await _redis.GetAsync<RedisGame>(RedisKeys.Game(gameId));
            if (game == null)
            {
                return ApiResponse.Error<object>("Game not found");
            }

            game.Status = finalStatus;
            await _redis.SetAsync(game.GetRedisKey(), game, GameExpiry);
            await _redis.SetRemoveAsync(RedisKeys.ActiveGames(), gameId);

            _logger.LogInformation("Game {GameId} ended with status {Status} and winner {Winner}",
                gameId, finalStatus, winner ?? "None");

            return ApiResponse.Ok("Game ended successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to end game {GameId}", gameId);
            return ApiResponse.Error<object>("Failed to end game");
        }
    }

    public async Task CleanupFinishedGamesAsync()
    {
        try
        {
            var activeGameIds = await _redis.SetMembersAsync(RedisKeys.ActiveGames());
            var finishedGames = new List<string>();

            foreach (var gameId in activeGameIds)
            {
                var game = await _redis.GetAsync<RedisGame>(RedisKeys.Game(gameId));
                if (game?.Status == GameStatus.Finished || game?.Status == GameStatus.Abandoned)
                {
                    finishedGames.Add(gameId);
                }
            }

            foreach (var gameId in finishedGames)
            {
                await _redis.SetRemoveAsync(RedisKeys.ActiveGames(), gameId);
            }

            if (finishedGames.Count > 0)
            {
                _logger.LogInformation("Cleaned up {Count} finished games", finishedGames.Count);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to cleanup finished games");
        }
    }

    // Private helper methods
    private async Task<List<RedisLobbyPlayer>> GetLobbyPlayersAsync(RedisLobby lobby)
    {
        var playerIds = await _redis.SetMembersAsync(lobby.GetPlayersSetKey());
        var playerKeys = playerIds.Select(RedisKeys.LobbyPlayer);
        var players = await _redis.GetAllAsync<RedisLobbyPlayer>(playerKeys);
        return players.ToList();
    }

    private Task<List<RedisPlayer>> AssignPlayersToTeamsAndPieces(List<RedisLobbyPlayer> lobbyPlayers, RedisGame game)
    {
        var gamePlayers = new List<RedisPlayer>();
        var pieces = GenerateChessPieces();
        var availableWhitePieces = pieces.Where(p => p.StartsWith("white")).ToList();
        var availableBlackPieces = pieces.Where(p => p.StartsWith("black")).ToList();

        // Shuffle players for random team assignment (except captains)
        var playersToAssign = lobbyPlayers.ToList();
        var random = new Random();

        foreach (var lobbyPlayer in playersToAssign)
        {
            var gamePlayer = new RedisPlayer
            {
                GameId = game.Id,
                ConnectionId = lobbyPlayer.ConnectionId,
                Nickname = lobbyPlayer.Nickname,
                Role = lobbyPlayer.Role,
                IsActive = true
            };

            // Assign team
            if (lobbyPlayer.Role == PlayerRole.Captain)
            {
                // Captains assigned based on their captain slot
                gamePlayer.Team = lobbyPlayer.Id == game.WhiteCaptainId ? Team.White : Team.Black;
            }
            else
            {
                // Regular players assigned randomly
                gamePlayer.Team = random.Next(2) == 0 ? Team.White : Team.Black;
            }

            // Assign piece
            var availablePieces = gamePlayer.Team == Team.White ? availableWhitePieces : availableBlackPieces;
            if (availablePieces.Count > 0)
            {
                var pieceIndex = random.Next(availablePieces.Count);
                gamePlayer.PieceId = availablePieces[pieceIndex];
                availablePieces.RemoveAt(pieceIndex);
            }

            gamePlayers.Add(gamePlayer);
        }

        return Task.FromResult(gamePlayers);
    }

    private async Task HandlePieceCaptureAsync(string gameId, string capturedSquare)
    {
        var players = await GetGamePlayersAsync(gameId);
        var capturedPlayer = players.FirstOrDefault(p =>
            GetPieceCurrentSquare(p.PieceId) == capturedSquare);

        if (capturedPlayer != null)
        {
            capturedPlayer.IsActive = false;
            capturedPlayer.PieceId = null;
            await _redis.SetAsync(capturedPlayer.GetRedisKey(), capturedPlayer, GameExpiry);
        }
    }

    private async Task<List<(string PieceId, string PlayerId)>> GetAvailablePiecesForTurn(string gameId, Team team)
    {
        var players = await GetGamePlayersAsync(gameId);
        return players
            .Where(p => p.Team == team && p.IsActive && !string.IsNullOrEmpty(p.PieceId))
            .Select(p => (p.PieceId!, p.Id))
            .ToList();
    }

    private static List<string> GenerateChessPieces()
    {
        var pieces = new List<string>();

        // White pieces
        pieces.Add("white-king");
        pieces.Add("white-queen");
        pieces.AddRange(new[] { "white-rook-1", "white-rook-2" });
        pieces.AddRange(new[] { "white-bishop-1", "white-bishop-2" });
        pieces.AddRange(new[] { "white-knight-1", "white-knight-2" });
        pieces.AddRange(Enumerable.Range(1, 8).Select(i => $"white-pawn-{i}"));

        // Black pieces
        pieces.Add("black-king");
        pieces.Add("black-queen");
        pieces.AddRange(new[] { "black-rook-1", "black-rook-2" });
        pieces.AddRange(new[] { "black-bishop-1", "black-bishop-2" });
        pieces.AddRange(new[] { "black-knight-1", "black-knight-2" });
        pieces.AddRange(Enumerable.Range(1, 8).Select(i => $"black-pawn-{i}"));

        return pieces;
    }

    private static string GetPieceCurrentSquare(string? pieceId)
    {
        // This would need to parse the current FEN to determine piece positions
        // For now, return empty - this needs chess engine integration
        return string.Empty;
    }
}
