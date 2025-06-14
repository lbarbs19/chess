namespace VibeChess.Backend.DTOs;

using VibeChess.Backend.Enums;

// Generic API response wrapper
public record ApiResponse<T>(
    bool Success,
    T? Data,
    string? Error = null,
    string? Message = null
);

// Success response helper
public static class ApiResponse
{
    public static ApiResponse<T> Ok<T>(T data, string? message = null) =>
        new(true, data, null, message);

    public static ApiResponse<object> Ok(string? message = null) =>
        new(true, null, null, message);

    public static ApiResponse<T> Error<T>(string error) =>
        new(false, default, error);
}

// DTO for connection status
public record ConnectionStatusDto(
    string PlayerId,
    string Status,  // "Connected", "Disconnected", "Reconnected"
    DateTime Timestamp
);

// DTO for chat messages (if needed)
public record ChatMessageDto(
    string PlayerId,
    string PlayerNickname,
    string Message,
    DateTime Timestamp
);

// DTO for sending chat messages
public record SendChatRequest(
    string GameId,
    string Message
);

// DTO for error responses
public record ErrorResponse(
    string Error,
    string? Details = null,
    int? Code = null
);

// DTO for validation errors
public record ValidationErrorResponse(
    string Error,
    Dictionary<string, string[]> ValidationErrors
);

// DTO for lobby/game list (if needed for admin or stats)
public record GameSummaryDto(
    string Id,
    string RoomCode,
    GameMode GameMode,
    int PlayerCount,
    GameStatus Status,
    DateTime CreatedAt
);
