using VibeChess.Backend.Enums;

namespace VibeChess.Backend.DTOs.SignalRDTOs;

// Hub method DTOs - these are sent TO the server

public record JoinLobbyHubRequest(
    string RoomCode,
    string Nickname,
    PlayerRole Role = PlayerRole.Player
);

public record LeaveLobbyHubRequest(
    string RoomCode
);

public record StartGameHubRequest(
    string RoomCode
);

public record MakeMoveHubRequest(
    string GameId,
    string FromSquare,
    string ToSquare
);

public record SelectPieceHubRequest(
    string GameId,
    string PieceId
);

public record SendChatHubRequest(
    string Message
);

// Hub event DTOs - these are sent FROM the server to clients

public record LobbyUpdatedEvent(
    LobbyResponse Lobby
);

public record PlayerJoinedEvent(
    LobbyPlayerResponse Player
);

public record PlayerLeftEvent(
    string PlayerId,
    string PlayerNickname
);

public record GameStartedEvent(
    GameResponse Game
);

public record GameUpdatedEvent(
    GameUpdateDto Update
);

public record PieceSelectedEvent(
    PieceSelectedDto Selection
);

public record MoveCompletedEvent(
    GameMoveResponse Move,
    string NewFEN
);

public record TimerUpdatedEvent(
    TimerUpdateDto Timer
);

public record GameEndedEvent(
    GameEndDto GameEnd
);

public record PlayerConnectedEvent(
    ConnectionStatusDto Connection
);

public record PlayerDisconnectedEvent(
    ConnectionStatusDto Connection
);

public record ChatMessageEvent(
    ChatMessageDto Message
);

public record ErrorEvent(
    ErrorResponse Error
);
