'use client';
import { useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

export default function ChessGame() {
  const [game, setGame] = useState(() => new Chess());
  const [fen, setFen] = useState(game.fen());
  const [status, setStatus] = useState("");

  function safeGameMutate(modify: (game: Chess) => void) {
    setGame((g) => {
      const update = new Chess(g.fen());
      try {
        modify(update);
        setFen(update.fen());
        updateStatus(update);
        return update;
      } catch (e) {
        // If error, reset the game
        const newGame = new Chess();
        setFen(newGame.fen());
        setStatus("White's turn");
        return newGame;
      }
    });
  }

  function onPieceDrop({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null; }): boolean {
    if (!targetSquare) return false;
    let move = null;
    safeGameMutate((game) => {
      // Only allow legal moves
      const moves = game.moves({ verbose: true }) as { from: string; to: string }[];
      const isLegal = moves.some(m => m.from === sourceSquare && m.to === targetSquare);
      if (!isLegal) return;
      move = game.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    });
    return move !== null;
  }

  function canDragPiece({ piece, square }: { piece: { pieceType: string }; square: string | null; }) {
    if (!square) return false;
    // Only allow dragging pieces of the current turn
    const turn = game.turn();
    if (turn === 'w' && piece.pieceType.startsWith('w')) return true;
    if (turn === 'b' && piece.pieceType.startsWith('b')) return true;
    return false;
  }

  function updateStatus(chess: Chess) {
    let status = "";
    if (chess.isCheckmate()) {
      status = `Checkmate! ${chess.turn() === "w" ? "Black" : "White"} wins.`;
    } else if (chess.isDraw()) {
      status = "Draw!";
    } else {
      status = `${chess.turn() === "w" ? "White" : "Black"}'s turn`;
      if (chess.isCheck()) {
        status += ", Check!";
      }
    }
    setStatus(status);
  }

  // Update status on first render
  useState(() => {
    updateStatus(game);
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <h1 className="text-3xl font-bold mb-4 text-center text-gray-800 dark:text-gray-100">Cloud Chess</h1>
      <Chessboard
        options={{
          position: fen,
          onPieceDrop,
          canDragPiece,
          allowDragging: true,
          boardStyle: { width: 400, borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" },
        }}
      />
      <div className="mt-4 text-lg text-gray-700 dark:text-gray-200">{status}</div>
      <button
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        onClick={() => {
          const newGame = new Chess();
          setGame(newGame);
          setFen(newGame.fen());
          setStatus("White's turn");
        }}
      >
        New Game
      </button>
    </div>
  );
}
