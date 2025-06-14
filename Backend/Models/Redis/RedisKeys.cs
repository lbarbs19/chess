namespace VibeChess.Backend.Models.Redis;

/// <summary>
/// Redis key patterns and helper methods for consistent key management
/// </summary>
public static class RedisKeys
{
    // Lobby keys
    public static string Lobby(string roomCode) => $"lobby:{roomCode}";
    public static string LobbyPlayers(string roomCode) => $"lobby:{roomCode}:players";
    public static string LobbyPlayer(string playerId) => $"lobby-player:{playerId}";

    // Game keys
    public static string Game(string gameId) => $"game:{gameId}";
    public static string GamePlayers(string gameId) => $"game:{gameId}:players";
    public static string GameMoves(string gameId) => $"game:{gameId}:moves";
    public static string GamePlayer(string playerId) => $"game-player:{playerId}";
    public static string Move(string moveId) => $"move:{moveId}";

    // Connection mapping
    public static string ConnectionToPlayer(string connectionId) => $"conn:{connectionId}";

    // Global sets
    public static string ActiveLobbies() => "active-lobbies";
    public static string ActiveGames() => "active-games";

    // SignalR groups
    public static string LobbyGroup(string roomCode) => $"lobby-{roomCode}";
    public static string GameGroup(string gameId) => $"game-{gameId}";
    public static string CaptainGroup(string gameId) => $"captain-{gameId}";

    // Timer keys (with TTL)
    public static string TurnTimer(string gameId) => $"timer:{gameId}";
}

/// <summary>
/// Common Redis operations and data types
/// </summary>
public static class RedisOperations
{
    // Hash operations for objects
    public const string SET_OBJECT = "SET";
    public const string GET_OBJECT = "GET";
    public const string DELETE_OBJECT = "DEL";

    // Set operations for relationships
    public const string ADD_TO_SET = "SADD";
    public const string REMOVE_FROM_SET = "SREM";
    public const string GET_SET_MEMBERS = "SMEMBERS";

    // List operations for ordered data (moves)
    public const string PUSH_TO_LIST = "RPUSH";
    public const string GET_LIST = "LRANGE";

    // TTL for temporary data
    public const string SET_EXPIRY = "EXPIRE";
    public const int LOBBY_TTL_HOURS = 24;
    public const int GAME_TTL_HOURS = 48;
    public const int TIMER_TTL_SECONDS = 15; // Slightly longer than move timer
}
