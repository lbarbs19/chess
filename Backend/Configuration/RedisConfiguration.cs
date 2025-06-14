namespace VibeChess.Backend.Configuration
{
    public class RedisConfiguration
    {
        public string ConnectionString { get; set; } = "localhost:6379";
        public int Database { get; set; } = 0;
        public string KeyPrefix { get; set; } = "vibechess:";
        public int DefaultExpiration { get; set; } = 86400; // 24 hours in seconds
    }
}
