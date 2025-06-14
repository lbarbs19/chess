using ChessDotNet;
using VibeChess.Backend.Enums;

namespace VibeChess.Backend.Services;

public class ChessValidationService : IChessValidationService
{
    public bool IsMoveLegal(string fen, string from, string to, string? promotion = null)
    {
        var game = new ChessGame(fen);
        var move = new Move(new Position(from), new Position(to), game.WhoseTurn, promotion.ToPromotionChar());
        return game.IsValidMove(move);
    }
    public string MakeMove(string fen, string from, string to, string? promotion = null)
    {
        var game = new ChessGame(fen);
        var move = new Move(new Position(from), new Position(to), game.WhoseTurn, promotion.ToPromotionChar());
        if (game.IsValidMove(move))
        {
            // Try the public MakeMove method instead of ApplyMove
            var result = game.MakeMove(move, true);
            if (result == MoveType.Invalid)
                return fen; // Return original FEN if move is invalid
            return game.GetFen();
        }
        return fen; // Return original FEN if move is invalid
    }

    public bool IsCheckmate(string fen)
    {
        var game = new ChessGame(fen);
        return game.IsCheckmated(game.WhoseTurn);
    }

    public bool IsStalemate(string fen)
    {
        var game = new ChessGame(fen);
        return game.IsStalemated(game.WhoseTurn);
    }

    public string GetCurrentTurn(string fen)
    {
        var game = new ChessGame(fen);
        return game.WhoseTurn == Player.White ? "White" : "Black";
    }
}

public static class PromotionExtensions
{
    public static char? ToPromotionChar(this string? promotion)
    {
        return promotion?.ToLower() switch
        {
            "q" or "queen" => 'q',
            "r" or "rook" => 'r',
            "b" or "bishop" => 'b',
            "n" or "knight" => 'n',
            _ => null
        };
    }
}
