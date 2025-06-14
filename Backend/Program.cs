using StackExchange.Redis;
using VibeChess.Backend.Configuration;
using VibeChess.Backend.Hubs;
using VibeChess.Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Add configuration
builder.Services.Configure<RedisConfiguration>(
    builder.Configuration.GetSection("Redis"));
builder.Services.Configure<GameConfiguration>(
    builder.Configuration.GetSection("Game"));

// Add Redis
var redisConfig = builder.Configuration.GetSection("Redis").Get<RedisConfiguration>() ?? new RedisConfiguration();
builder.Services.AddSingleton<IConnectionMultiplexer>(provider =>
{
    return ConnectionMultiplexer.Connect(redisConfig.ConnectionString);
});

// Add services
builder.Services.AddSingleton<IRedisService, RedisService>();
builder.Services.AddScoped<LobbyService>();
builder.Services.AddScoped<GameService>();
builder.Services.AddScoped<IChessValidationService, ChessValidationService>();

// Add SignalR
builder.Services.AddSignalR();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000") // Vite and typical React ports
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Add controllers
builder.Services.AddControllers();

// Add Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Use CORS
app.UseCors("AllowFrontend");

app.UseHttpsRedirection();

// Map SignalR hub
app.MapHub<PawnStarsHub>("/pawnstarshub");

// Map controllers
app.MapControllers();

app.Run();
