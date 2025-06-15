using Microsoft.AspNetCore.Mvc;
using VibeChess.Backend.DTOs;
using VibeChess.Backend.Services;

namespace VibeChess.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LobbyController : ControllerBase
{
    private readonly ILobbyService _lobbyService;
    private readonly ILogger<LobbyController> _logger;

    public LobbyController(ILobbyService lobbyService, ILogger<LobbyController> logger)
    {
        _lobbyService = lobbyService;
        _logger = logger;
    }

    /// <summary>
    /// Create a new lobby
    /// </summary>
    [HttpPost("create")]
    public async Task<ActionResult<ApiResponse<object>>> CreateLobby([FromBody] CreateLobbyRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse.Error<object>("Invalid lobby creation request"));

            var result = await _lobbyService.CreateLobbyAsync(request);
            return result.Success ? Ok(result) : BadRequest(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating lobby");
            return StatusCode(500, ApiResponse.Error<object>("Internal server error"));
        }
    }    /// <summary>
         /// Join an existing lobby (Note: In practice, use SignalR hub for real-time joining)
         /// </summary>
    [HttpPost("{lobbyId}/join")]
    public async Task<ActionResult<ApiResponse<object>>> JoinLobby(
        string lobbyId,
        [FromBody] JoinLobbyRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse.Error<object>("Invalid join request"));

            // Ensure the request roomCode matches the URL parameter
            if (request.RoomCode != lobbyId)
                return BadRequest(ApiResponse.Error<object>("Room code mismatch"));

            // For REST API, we don't have a connectionId, so this is mainly for testing
            // In practice, joining should be done through SignalR hub
            var result = await _lobbyService.JoinLobbyAsync(request, "rest-api-connection");
            return result.Success ? Ok(result) : BadRequest(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error joining lobby {LobbyId}", lobbyId);
            return StatusCode(500, ApiResponse.Error<object>("Internal server error"));
        }
    }

    /// <summary>
    /// Leave a lobby
    /// </summary>
    [HttpPost("{lobbyId}/leave")]
    public async Task<ActionResult<ApiResponse<object>>> LeaveLobby(
        string lobbyId,
        [FromBody] LeaveLobbyRequest request)
    {
        try
        {
            var result = await _lobbyService.LeaveLobbyAsync(lobbyId, request.PlayerId);
            return result.Success ? Ok(result) : BadRequest(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error leaving lobby {LobbyId}", lobbyId);
            return StatusCode(500, ApiResponse.Error("Internal server error"));
        }
    }

    /// <summary>
    /// Get lobby details
    /// </summary>
    [HttpGet("{lobbyId}")]
    public async Task<ActionResult<ApiResponse<object>>> GetLobby(string lobbyId)
    {
        try
        {
            var result = await _lobbyService.GetLobbyAsync(lobbyId);
            return result.Success ? Ok(result) : NotFound(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting lobby {LobbyId}", lobbyId);
            return StatusCode(500, ApiResponse.Error("Internal server error"));
        }
    }

    /// <summary>
    /// Get all active lobbies
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<object>>> GetActiveLobbies()
    {
        try
        {
            var result = await _lobbyService.GetActiveLobbiesAsync();
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active lobbies");
            return StatusCode(500, ApiResponse.Error("Internal server error"));
        }
    }

    /// <summary>
    /// Update lobby settings (host only)
    /// </summary>
    [HttpPut("{lobbyId}/settings")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateLobbySettings(
        string lobbyId,
        [FromBody] UpdateLobbySettingsRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse.Error("Invalid settings update request"));

            var result = await _lobbyService.UpdateLobbySettingsAsync(lobbyId, request);
            return result.Success ? Ok(result) : BadRequest(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating lobby settings {LobbyId}", lobbyId);
            return StatusCode(500, ApiResponse.Error("Internal server error"));
        }
    }
}
