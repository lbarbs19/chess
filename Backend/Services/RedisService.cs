using StackExchange.Redis;
using System.Text.Json;

namespace VibeChess.Backend.Services;

public interface IRedisService
{
    // Basic operations
    Task<T?> GetAsync<T>(string key) where T : class;
    Task<bool> SetAsync<T>(string key, T value, TimeSpan? expiry = null) where T : class;
    Task<bool> DeleteAsync(string key);
    Task<bool> ExistsAsync(string key);

    // Set operations (for relationships)
    Task<bool> SetAddAsync(string key, string value);
    Task<bool> SetRemoveAsync(string key, string value);
    Task<string[]> SetMembersAsync(string key);
    Task<long> SetLengthAsync(string key);

    // List operations (for ordered data like moves)
    Task<long> ListRightPushAsync(string key, string value);
    Task<string[]> ListRangeAsync(string key, long start = 0, long stop = -1);
    Task<long> ListLengthAsync(string key);

    // Batch operations
    Task<T[]> GetAllAsync<T>(IEnumerable<string> keys) where T : class;
    Task SetAllAsync<T>(Dictionary<string, T> items, TimeSpan? expiry = null) where T : class;

    // Expiry management
    Task<bool> ExpireAsync(string key, TimeSpan expiry);
    Task<TimeSpan?> TimeToLiveAsync(string key);
}

public class RedisService : IRedisService
{
    private readonly IDatabase _database;
    private readonly JsonSerializerOptions _jsonOptions;

    public RedisService(IConnectionMultiplexer redis)
    {
        _database = redis.GetDatabase();
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };
    }

    public async Task<T?> GetAsync<T>(string key) where T : class
    {
        var value = await _database.StringGetAsync(key);
        return value.HasValue ? JsonSerializer.Deserialize<T>(value!, _jsonOptions) : null;
    }

    public async Task<bool> SetAsync<T>(string key, T value, TimeSpan? expiry = null) where T : class
    {
        var json = JsonSerializer.Serialize(value, _jsonOptions);
        return await _database.StringSetAsync(key, json, expiry);
    }

    public async Task<bool> DeleteAsync(string key)
    {
        return await _database.KeyDeleteAsync(key);
    }

    public async Task<bool> ExistsAsync(string key)
    {
        return await _database.KeyExistsAsync(key);
    }

    public async Task<bool> SetAddAsync(string key, string value)
    {
        return await _database.SetAddAsync(key, value);
    }

    public async Task<bool> SetRemoveAsync(string key, string value)
    {
        return await _database.SetRemoveAsync(key, value);
    }

    public async Task<string[]> SetMembersAsync(string key)
    {
        var values = await _database.SetMembersAsync(key);
        return values.Select(v => v.ToString()).ToArray();
    }

    public async Task<long> SetLengthAsync(string key)
    {
        return await _database.SetLengthAsync(key);
    }

    public async Task<long> ListRightPushAsync(string key, string value)
    {
        return await _database.ListRightPushAsync(key, value);
    }

    public async Task<string[]> ListRangeAsync(string key, long start = 0, long stop = -1)
    {
        var values = await _database.ListRangeAsync(key, start, stop);
        return values.Select(v => v.ToString()).ToArray();
    }

    public async Task<long> ListLengthAsync(string key)
    {
        return await _database.ListLengthAsync(key);
    }

    public async Task<T[]> GetAllAsync<T>(IEnumerable<string> keys) where T : class
    {
        var redisKeys = keys.Select(k => (RedisKey)k).ToArray();
        var values = await _database.StringGetAsync(redisKeys);

        return values
            .Where(v => v.HasValue)
            .Select(v => JsonSerializer.Deserialize<T>(v!, _jsonOptions))
            .Where(item => item != null)
            .ToArray()!;
    }

    public async Task SetAllAsync<T>(Dictionary<string, T> items, TimeSpan? expiry = null) where T : class
    {
        var batch = _database.CreateBatch();
        var tasks = items.Select(kvp =>
        {
            var json = JsonSerializer.Serialize(kvp.Value, _jsonOptions);
            return batch.StringSetAsync(kvp.Key, json, expiry);
        });

        batch.Execute();
        await Task.WhenAll(tasks);
    }

    public async Task<bool> ExpireAsync(string key, TimeSpan expiry)
    {
        return await _database.KeyExpireAsync(key, expiry);
    }

    public async Task<TimeSpan?> TimeToLiveAsync(string key)
    {
        return await _database.KeyTimeToLiveAsync(key);
    }
}
