namespace VibeChess.Backend.Enums;

public enum GameMode
{
    Captain,
    NoCaptain
}

public enum GameStatus
{
    WaitingForPlayers,
    InProgress,
    Finished,
    Abandoned
}

public enum LobbyStatus
{
    WaitingForPlayers,
    ReadyToStart,
    GameStarted,
    Abandoned
}

public enum Team
{
    White,
    Black
}

public enum PlayerRole
{
    Captain,
    Player
}
