namespace VibeChess.Backend.Configuration
{
    public class GameConfiguration
    {
        public int DefaultMoveTimeSeconds { get; set; } = 30;
        public int MaxPlayersPerLobby { get; set; } = 12;
        public int MinPlayersToStart { get; set; } = 4;
        public int LobbyTimeoutMinutes { get; set; } = 30;
        public int GameTimeoutMinutes { get; set; } = 60;
        public int ReconnectionGraceMinutes { get; set; } = 5;
        public bool AllowSpectators { get; set; } = false; // For MVP
        public string DefaultStartingFen { get; set; } = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    }
}
