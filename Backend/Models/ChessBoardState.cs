namespace VibeChess.Backend.Models;

/// <summary>
/// Represents the current state of a chess board
/// </summary>
public class ChessBoardState
{
    // 8x8 board representation (a1 = [0,0], h8 = [7,7])
    public string[,] Board { get; set; } = new string[8, 8];

    // Current turn
    public string ActiveColor { get; set; } = "w"; // "w" for white, "b" for black

    // Castling availability
    public string CastlingAvailability { get; set; } = "KQkq";

    // En passant target square
    public string? EnPassantTarget { get; set; }

    // Halfmove clock (for 50-move rule)
    public int HalfmoveClock { get; set; } = 0;

    // Fullmove number
    public int FullmoveNumber { get; set; } = 1;

    public ChessBoardState()
    {
        InitializeEmptyBoard();
    }

    public ChessBoardState(string[,] board, string activeColor, string castling, string? enPassant, int halfmove, int fullmove)
    {
        Board = board;
        ActiveColor = activeColor;
        CastlingAvailability = castling;
        EnPassantTarget = enPassant;
        HalfmoveClock = halfmove;
        FullmoveNumber = fullmove;
    }

    private void InitializeEmptyBoard()
    {
        for (int rank = 0; rank < 8; rank++)
        {
            for (int file = 0; file < 8; file++)
            {
                Board[rank, file] = "";
            }
        }
    }

    public ChessBoardState Clone()
    {
        var newBoard = new string[8, 8];
        Array.Copy(Board, newBoard, Board.Length);

        return new ChessBoardState(
            newBoard,
            ActiveColor,
            CastlingAvailability,
            EnPassantTarget,
            HalfmoveClock,
            FullmoveNumber
        );
    }
}
