"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { aiOpponentMove } from "@/ai/flows/ai-opponent-move";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { IconX, IconO } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Player = "X" | "O";
type Board = (Player | null)[];

const PLAYER_MARK: Player = "X";
const AI_MARK: Player = "O";
const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6], // diagonals
];

const calculateWinner = (board: Board): { winner: Player | null; line: number[] | null } => {
  for (const line of WINNING_COMBINATIONS) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return { winner: null, line: null };
};

export function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>(PLAYER_MARK);
  const [winner, setWinner] = useState<Player | "Draw" | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");
  const { toast } = useToast();

  const handleCellClick = (index: number) => {
    if (board[index] || winner || currentPlayer !== PLAYER_MARK) return;

    const newBoard = [...board];
    newBoard[index] = PLAYER_MARK;
    setBoard(newBoard);
    setCurrentPlayer(AI_MARK);
  };

  const makeAiMove = useCallback(async () => {
    setIsAiThinking(true);
    setAiExplanation("");
    try {
      const result = await aiOpponentMove({
        board,
        playerMark: PLAYER_MARK,
        aiMark: AI_MARK,
      });

      if (board[result.move] === null) {
        const newBoard = [...board];
        newBoard[result.move] = AI_MARK;
        setBoard(newBoard);
        setAiExplanation(result.explanation);
      } else {
        // AI made an invalid move, so let's find the first available spot.
        const fallbackMove = board.findIndex((cell) => cell === null);
        if (fallbackMove !== -1) {
          const newBoard = [...board];
          newBoard[fallbackMove] = AI_MARK;
          setBoard(newBoard);
          setAiExplanation("The AI made an invalid move, so I picked a valid one instead.");
        }
      }
    } catch (error) {
      console.error("AI Error:", error);
      toast({
        title: "AI Error",
        description: "The AI failed to make a move. You can try again or restart.",
        variant: "destructive",
      });
       const fallbackMove = board.findIndex((cell) => cell === null);
        if (fallbackMove !== -1) {
          const newBoard = [...board];
          newBoard[fallbackMove] = AI_MARK;
          setBoard(newBoard);
          setAiExplanation("The AI encountered an error, so I picked a valid move instead.");
        }
    } finally {
      setIsAiThinking(false);
      setCurrentPlayer(PLAYER_MARK);
    }
  }, [board, toast]);

  useEffect(() => {
    const { winner: newWinner, line } = calculateWinner(board);
    if (newWinner) {
      setWinner(newWinner);
      setWinningLine(line);
    } else if (!board.includes(null)) {
      setWinner("Draw");
    } else if (currentPlayer === AI_MARK && !newWinner) {
      // Add a slight delay for better UX
      const timer = setTimeout(() => makeAiMove(), 750);
      return () => clearTimeout(timer);
    }
  }, [board, currentPlayer, makeAiMove]);

  const handleRestart = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer(PLAYER_MARK);
    setWinner(null);
    setWinningLine(null);
    setIsAiThinking(false);
    setAiExplanation("");
  };

  const getStatusMessage = () => {
    if (winner) {
      if (winner === "Draw") return "It's a Draw!";
      return winner === PLAYER_MARK ? "Congratulations, You Win!" : "The AI Wins!";
    }
    if (isAiThinking) return "AI is thinking...";
    return "Your Turn";
  };

  return (
    <Card className="shadow-2xl">
      <CardContent className="p-6">
        <div className="flex justify-center items-center mb-4 h-8">
          <p className="text-xl font-semibold text-center text-foreground">{getStatusMessage()}</p>
        </div>
        <div className="relative grid grid-cols-3 gap-2 aspect-square">
          {board.map((cell, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={() => handleCellClick(index)}
                disabled={!!cell || !!winner || isAiThinking}
                className={cn(
                  "w-full h-full rounded-lg flex items-center justify-center text-6xl md:text-7xl font-bold transition-colors duration-300",
                  "bg-secondary/50 hover:bg-secondary disabled:cursor-not-allowed",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
                   winningLine?.includes(index) ? (winner === PLAYER_MARK ? "bg-accent text-accent-foreground" : "bg-destructive text-destructive-foreground") : "",
                )}
                aria-label={`Cell ${index + 1}`}
              >
                <AnimatePresence>
                  {cell && (
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 90 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className={cn(
                        "transition-colors",
                         cell === PLAYER_MARK ? "text-primary" : "text-foreground/80",
                         winningLine?.includes(index) && "text-white"
                      )}
                    >
                      {cell === "X" ? <IconX /> : <IconO />}
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
          {isAiThinking && (
             <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
             </div>
          )}
        </div>
        <div className="h-10 mt-4 text-center text-muted-foreground text-sm">
            {aiExplanation && <p>AI's thought: "{aiExplanation}"</p>}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleRestart} className="w-full" variant={winner ? 'default' : 'outline'}>
          {winner ? "Play Again" : "Restart Game"}
        </Button>
      </CardFooter>
    </Card>
  );
}
