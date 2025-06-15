using VibeChess.Backend.Enums;

namespace VibeChess.Backend.DTOs;

// DTO for creating a new lobby
public record CreateLobbyRequest(
    string HostNickname,
    GameMode GameMode = GameMode.Captain,
    int MoveTimerSeconds = 10,
    int MaxPlayers = 32
);

// DTO for joining a lobby
public record JoinLobbyRequest(
    string RoomCode,
    string Nickname,
    PlayerRole Role = PlayerRole.Player
);

// DTO for lobby information sent to clients
public record LobbyResponse(
    string Id,
    string RoomCode,
    GameMode GameMode,
    int MoveTimerSeconds,
    int MaxPlayers,
    LobbyStatus Status,
    List<LobbyPlayerResponse> Players,
    bool CanStart
);

// DTO for player information in lobby
public record LobbyPlayerResponse(
    string Id,
    string Nickname,
    PlayerRole Role
);

// DTO for starting a game from lobby
public record StartGameRequest(
    string RoomCode
);

// DTO for leaving a lobby
public record LeaveLobbyRequest(
    string RoomCode,
    string PlayerId
);
