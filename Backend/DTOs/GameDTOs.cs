using VibeChess.Backend.Enums;

namespace VibeChess.Backend.DTOs;

// DTO for game state sent to clients
public record GameResponse(
    string Id,
    string RoomCode,
    GameMode GameMode,
    int MoveTimerSeconds,
    string CurrentTurn,  // "White" or "Black"
    string FEN,
    GameStatus Status,
    List<GamePlayerResponse> Players,
    string? CurrentPlayerId,
    int? TimeRemaining,  // Seconds remaining for current turn
    List<GameMoveResponse> RecentMoves
);

// DTO for player in active game
public record GamePlayerResponse(
    string Id,
    string Nickname,
    string Team,  // "White" or "Black"
    string Role,  // "Captain" or "Player"  
    string? PieceId,
    bool IsActive,
    bool IsCurrentPlayer
);

// DTO for move information
public record GameMoveResponse(
    string Id,
    string FromSquare,
    string ToSquare,
    string PlayerNickname,
    string? CaptainNickname,
    string PieceType,
    string? CapturedPiece,
    string? Notation,
    bool IsAutoMove,
    DateTime Timestamp
);

// DTO for making a move
public record MakeMoveRequest(
    string GameId,
    string PlayerId,
    string FromSquare,
    string ToSquare,
    string? Promotion = null
);

// DTO for captain selecting a piece (Captain mode)
public record SelectPieceRequest(
    string GameId,
    string PieceId
);

// DTO for real-time game updates (SignalR)
public record GameUpdateDto(
    string CurrentTurn,
    string FEN,
    string? CurrentPlayerId,
    int? TimeRemaining,
    GameMoveResponse? LastMove
);

// DTO for piece selection update (Captain mode)
public record PieceSelectedDto(
    string PieceId,
    string PlayerId,
    string PlayerNickname,
    int TimeRemaining
);

// DTO for timer updates
public record TimerUpdateDto(
    int TimeRemaining,
    string? CurrentPlayerId
);

// DTO for game end
public record GameEndDto(
    GameStatus FinalStatus,
    string? Winner,  // "White", "Black", or null for draw
    string Reason   // "Checkmate", "Stalemate", "Timeout", etc.
);
