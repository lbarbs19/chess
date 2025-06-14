using Microsoft.AspNetCore.SignalR;
using VibeChess.Backend.Services;
using VibeChess.Backend.DTOs.SignalRDTOs;
using VibeChess.Backend.DTOs;
using VibeChess.Backend.DTOs.Extensions;
using VibeChess.Backend.Enums;

namespace VibeChess.Backend.Hubs
{
    public class PawnStarsHub : Hub
    {
        private readonly LobbyService _lobbyService;
        private readonly GameService _gameService;

        public PawnStarsHub(LobbyService lobbyService, GameService gameService)
        {
            _lobbyService = lobbyService;
            _gameService = gameService;
        }

        #region Connection Management

        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // Handle player disconnection - for now, just log it
            // In a full implementation, we'd need to track player-connection mappings
            // and handle lobby/game cleanup appropriately

            await base.OnDisconnectedAsync(exception);
        }

        #endregion

        #region Lobby Operations        /// <summary>
        /// Create a new lobby
        /// </summary>
        public async Task CreateLobby(string creatorName, int maxPlayers = 8, bool hasCaptains = true)
        {
            try
            {
                var gameMode = hasCaptains ? GameMode.Captain : GameMode.NoCaptain;
                var request = new CreateLobbyRequest(creatorName, gameMode, 30, maxPlayers);
                var response = await _lobbyService.CreateLobbyAsync(request);

                if (response.Success && response.Data != null)
                {
                    // Join the lobby group
                    await Groups.AddToGroupAsync(Context.ConnectionId, $"lobby_{response.Data.RoomCode}");

                    // Notify client of successful creation
                    await Clients.Caller.SendAsync("LobbyCreated", response.Data);
                }
                else
                {
                    await Clients.Caller.SendAsync("Error", new ErrorResponse(
                        response.Error ?? "Failed to create lobby"
                    ));
                }
            }
            catch (Exception ex)
            {
                await Clients.Caller.SendAsync("Error", new ErrorResponse(ex.Message));
            }
        }

        /// <summary>
        /// Join an existing lobby
        /// </summary>
        public async Task JoinLobby(JoinLobbyHubRequest request)
        {
            try
            {
                var joinRequest = new JoinLobbyRequest(request.RoomCode, request.Nickname);
                var response = await _lobbyService.JoinLobbyAsync(joinRequest, Context.ConnectionId);

                if (response.Success && response.Data != null)
                {
                    // Join the lobby group
                    await Groups.AddToGroupAsync(Context.ConnectionId, $"lobby_{request.RoomCode}");

                    // Notify all players in lobby of new player
                    await Clients.Group($"lobby_{request.RoomCode}").SendAsync("LobbyUpdated",
                        new LobbyUpdatedEvent(response.Data));
                }
                else
                {
                    await Clients.Caller.SendAsync("Error", new ErrorResponse(
                        response.Error ?? "Failed to join lobby"
                    ));
                }
            }
            catch (Exception ex)
            {
                await Clients.Caller.SendAsync("Error", new ErrorResponse(ex.Message));
            }
        }

        /// <summary>
        /// Leave a lobby
        /// </summary>
        public async Task LeaveLobby(LeaveLobbyHubRequest request)
        {
            try
            {
                var response = await _lobbyService.LeaveLobbyAsync(request.RoomCode, Context.ConnectionId);

                // Remove from lobby group
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"lobby_{request.RoomCode}");

                if (response.Success)
                {
                    // Get updated lobby state to notify remaining players
                    var lobbyResponse = await _lobbyService.GetLobbyAsync(request.RoomCode);
                    if (lobbyResponse.Success && lobbyResponse.Data != null)
                    {
                        await Clients.Group($"lobby_{request.RoomCode}").SendAsync("LobbyUpdated",
                            new LobbyUpdatedEvent(lobbyResponse.Data));
                    }
                    else
                    {
                        // Lobby was closed (no more players)
                        await Clients.Group($"lobby_{request.RoomCode}").SendAsync("LobbyClosed");
                    }
                }
                else
                {
                    await Clients.Caller.SendAsync("Error", new ErrorResponse(
                        response.Error ?? "Failed to leave lobby"
                    ));
                }
            }
            catch (Exception ex)
            {
                await Clients.Caller.SendAsync("Error", new ErrorResponse(ex.Message));
            }
        }

        /// <summary>
        /// Start a game from lobby
        /// </summary>
        public async Task StartGame(StartGameHubRequest request)
        {
            try
            {
                var response = await _lobbyService.StartGameAsync(request.RoomCode);

                if (response.Success && response.Data != null)
                {
                    string gameId = response.Data;

                    // Get the lobby to move players to game group
                    var lobbyResponse = await _lobbyService.GetLobbyAsync(request.RoomCode);
                    if (lobbyResponse.Success && lobbyResponse.Data != null)
                    {
                        // Move all players from lobby group to game group
                        foreach (var player in lobbyResponse.Data.Players)
                        {
                            // Note: We'd need to track connection IDs properly in a real implementation
                            // For now, we'll just notify the lobby group
                        }
                    }

                    // Get the game state
                    var gameResponse = await _gameService.GetGameAsync(gameId);
                    if (gameResponse.Success && gameResponse.Data != null)
                    {
                        // Notify all players game has started
                        await Clients.Group($"lobby_{request.RoomCode}").SendAsync("GameStarted",
                            new GameStartedEvent(gameResponse.Data));
                    }
                }
                else
                {
                    await Clients.Caller.SendAsync("Error", new ErrorResponse(
                        response.Error ?? "Failed to start game"
                    ));
                }
            }
            catch (Exception ex)
            {
                await Clients.Caller.SendAsync("Error", new ErrorResponse(ex.Message));
            }
        }

        #endregion

        #region Game Operations

        /// <summary>
        /// Make a move in the game
        /// </summary>
        public async Task MakeMove(MakeMoveHubRequest request)
        {
            try
            {
                // Note: We'd need to get the player ID from the connection context
                // For now, using a placeholder
                string playerId = Context.UserIdentifier ?? "unknown";

                var response = await _gameService.MakeMoveAsync(
                    request.GameId,
                    playerId,
                    request.FromSquare,
                    request.ToSquare
                );

                if (response.Success && response.Data != null)
                {
                    // For MVP, we'll assume the response.Data contains move info
                    // In a real implementation, this would be properly typed
                    await Clients.Group($"game_{request.GameId}").SendAsync("MoveCompleted",
                        new MoveCompletedEvent(
                            new GameMoveResponse("", "", "", "", null, "", null, null, false, DateTime.UtcNow),
                            ""));

                    // Get updated game state
                    var gameResponse = await _gameService.GetGameAsync(request.GameId);
                    if (gameResponse.Success && gameResponse.Data != null)
                    {
                        await Clients.Group($"game_{request.GameId}").SendAsync("GameUpdated",
                            new GameUpdatedEvent(new GameUpdateDto(
                                gameResponse.Data.Id,
                                gameResponse.Data.FEN,
                                gameResponse.Data.CurrentPlayerId,
                                gameResponse.Data.TimeRemaining,
                                null)));

                        // Check for game end
                        if (gameResponse.Data.Status == GameStatus.Finished)
                        {
                            await Clients.Group($"game_{request.GameId}").SendAsync("GameEnded",
                                new GameEndedEvent(new GameEndDto(
                                    gameResponse.Data.Status,
                                    null,
                                    "Game completed")));
                        }
                    }
                }
                else
                {
                    await Clients.Caller.SendAsync("Error", new ErrorResponse(
                        response.Error ?? "Invalid move"
                    ));
                }
            }
            catch (Exception ex)
            {
                await Clients.Caller.SendAsync("Error", new ErrorResponse(ex.Message));
            }
        }

        /// <summary>
        /// Request game state (for reconnection)
        /// </summary>
        public async Task GetGameState(string gameId)
        {
            try
            {
                var response = await _gameService.GetGameAsync(gameId);

                if (response.Success && response.Data != null)
                {
                    // Re-join the game group
                    await Groups.AddToGroupAsync(Context.ConnectionId, $"game_{gameId}");

                    await Clients.Caller.SendAsync("GameStateReceived", response.Data);
                }
                else
                {
                    await Clients.Caller.SendAsync("Error", new ErrorResponse(
                        response.Error ?? "Game not found"
                    ));
                }
            }
            catch (Exception ex)
            {
                await Clients.Caller.SendAsync("Error", new ErrorResponse(ex.Message));
            }
        }

        #endregion

        #region Helper Methods

        /// <summary>
        /// Send a chat message (placeholder for future implementation)
        /// </summary>
        public async Task SendChatMessage(SendChatHubRequest request)
        {
            // Placeholder - would need to determine which group to send to
            await Clients.All.SendAsync("ChatMessage", new ChatMessageEvent(
                new ChatMessageDto("user", "System", request.Message, DateTime.UtcNow)
            ));
        }

        #endregion
    }
}
