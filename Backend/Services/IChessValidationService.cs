namespace VibeChess.Backend.Services;

public interface IChessValidationService
{
    bool IsMoveLegal(string fen, string from, string to, string? promotion = null);
    string MakeMove(string fen, string from, string to, string? promotion = null);
    bool IsCheckmate(string fen);
    bool IsStalemate(string fen);
    string GetCurrentTurn(string fen);
}
