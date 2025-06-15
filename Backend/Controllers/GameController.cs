using Microsoft.AspNetCore.Mvc;
using VibeChess.Backend.DTOs;
using VibeChess.Backend.Services;
using VibeChess.Backend.Enums;

namespace VibeChess.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GameController : ControllerBase
{
    private readonly IGameService _gameService;
    private readonly IChessValidationService _chessValidationService;
    private readonly ILogger<GameController> _logger;

    public GameController(
        IGameService gameService,
        IChessValidationService chessValidationService,
        ILogger<GameController> logger)
    {
        _gameService = gameService;
        _chessValidationService = chessValidationService;
        _logger = logger;
    }

    /// <summary>
    /// Create a new game from a lobby
    /// </summary>
    [HttpPost("create/{lobbyId}")]
    public async Task<ActionResult<ApiResponse<GameResponse>>> CreateGame(string lobbyId)
    {
        try
        {
            var result = await _gameService.CreateGameFromLobbyAsync(lobbyId);
            return result.Success ? Ok(result) : BadRequest(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating game from lobby {LobbyId}", lobbyId);
            return StatusCode(500, ApiResponse.Error<GameResponse>("Internal server error"));
        }
    }

    /// <summary>
    /// Get game details by ID
    /// </summary>
    [HttpGet("{gameId}")]
    public async Task<ActionResult<ApiResponse<GameResponse>>> GetGame(string gameId)
    {
        try
        {
            var result = await _gameService.GetGameAsync(gameId);
            return result.Success ? Ok(result) : NotFound(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting game {GameId}", gameId);
            return StatusCode(500, ApiResponse.Error<GameResponse>("Internal server error"));
        }
    }

    /// <summary>
    /// Make a move in a game
    /// </summary>
    [HttpPost("{gameId}/move")]
    public async Task<ActionResult<ApiResponse<object>>> MakeMove(
        string gameId, 
        [FromBody] MakeMoveRequest request)
    {
        try
        {            if (!ModelState.IsValid)
                return BadRequest(ApiResponse.Error<object>("Invalid move request"));

            var result = await _gameService.MakeMoveAsync(
                gameId, 
                request.PlayerId, 
                request.FromSquare, 
                request.ToSquare);

            return result.Success ? Ok(result) : BadRequest(result);
        }
        catch (Exception ex)
        {            _logger.LogError(ex, "Error making move in game {GameId}", gameId);
            return StatusCode(500, ApiResponse.Error<object>("Internal server error"));
        }
    }

    /// <summary>
    /// Validate a chess move without executing it
    /// </summary>
    [HttpPost("validate-move")]
    public ActionResult<ApiResponse<bool>> ValidateMove([FromBody] ValidateMoveRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse.Error<bool>("Invalid validation request"));

            var isLegal = _chessValidationService.IsMoveLegal(
                request.Fen, 
                request.FromSquare, 
                request.ToSquare, 
                request.Promotion);

            return Ok(ApiResponse.Ok(isLegal));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating move");
            return StatusCode(500, ApiResponse.Error<bool>("Internal server error"));
        }
    }

    /// <summary>
    /// End a game
    /// </summary>
    [HttpPost("{gameId}/end")]
    public async Task<ActionResult<ApiResponse<object>>> EndGame(
        string gameId, 
        [FromBody] EndGameRequest request)
    {
        try
        {
            var result = await _gameService.EndGameAsync(gameId, request.FinalStatus, request.Winner);
            return result.Success ? Ok(result) : BadRequest(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error ending game {GameId}", gameId);
            return StatusCode(500, ApiResponse.Error("Internal server error"));
        }
    }

    /// <summary>
    /// Get game players
    /// </summary>
    [HttpGet("{gameId}/players")]
    public async Task<ActionResult<ApiResponse<object>>> GetGamePlayers(string gameId)
    {
        try
        {
            var players = await _gameService.GetGamePlayersAsync(gameId);
            return Ok(ApiResponse.Ok(players));
        }
        catch (Exception ex)        {
            _logger.LogError(ex, "Error getting players for game {GameId}", gameId);
            return StatusCode(500, ApiResponse.Error<object>("Internal server error"));
        }
    }

    /// <summary>
    /// Get game move history
    /// </summary>
    [HttpGet("{gameId}/moves")]
    public async Task<ActionResult<ApiResponse<object>>> GetGameMoves(string gameId, [FromQuery] int? lastN = null)
    {
        try
        {
            var moves = await _gameService.GetGameMovesAsync(gameId, lastN);
            return Ok(ApiResponse.Ok(moves));
        }
        catch (Exception ex)        {
            _logger.LogError(ex, "Error getting moves for game {GameId}", gameId);
            return StatusCode(500, ApiResponse.Error<object>("Internal server error"));
        }
    }
}
