// src/ai/flows/ai-opponent-move.ts
'use server';

/**
 * @fileOverview Implements the AI opponent's move logic for Tic-Tac-Toe.
 *
 * - aiOpponentMove - A function to determine the AI's next move.
 * - AiOpponentMoveInput - The input type for the aiOpponentMove function, representing the current board state.
 * - AiOpponentMoveOutput - The return type for the aiOpponentMove function, indicating the AI's chosen move.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiOpponentMoveInputSchema = z.object({
  board: z.array(z.string().nullable()).length(9).describe('The current state of the Tic-Tac-Toe board. Use null to represent empty cell.'),
  playerMark: z.enum(['X', 'O']).describe('The mark of the human player.'),
  aiMark: z.enum(['X', 'O']).describe('The mark of the AI opponent.'),
});
export type AiOpponentMoveInput = z.infer<typeof AiOpponentMoveInputSchema>;

const AiOpponentMoveOutputSchema = z.object({
  move: z.number().int().min(0).max(8).describe('The index (0-8) of the AI opponent\'s chosen move on the board.'),
  explanation: z.string().describe('Explanation of why the AI chose that move.')
});
export type AiOpponentMoveOutput = z.infer<typeof AiOpponentMoveOutputSchema>;

export async function aiOpponentMove(input: AiOpponentMoveInput): Promise<AiOpponentMoveOutput> {
  return aiOpponentMoveFlow(input);
}

const aiOpponentMovePrompt = ai.definePrompt({
  name: 'aiOpponentMovePrompt',
  input: {schema: AiOpponentMoveInputSchema},
  output: {schema: AiOpponentMoveOutputSchema},
  prompt: `You are an expert Tic-Tac-Toe AI. Given the current board state, your mark, and your opponent's mark, determine the best move to make. Always think a step ahead to win.

Current board:
{{#each board}}
{{@index}}: {{this}}
{{/each}}

Your mark: {{{aiMark}}}
Opponent's mark: {{{playerMark}}}

Provide the index (0-8) of your move and briefly explain your reasoning. If there is no immediate winning move, choose a move that blocks the opponent from winning, or makes a smart strategic move based on the current board state. Prioritize winning over blocking, and blocking over random moves.
If there are no strategic plays available, make a random move.
Always respond using JSON.`, 
});

const aiOpponentMoveFlow = ai.defineFlow(
  {
    name: 'aiOpponentMoveFlow',
    inputSchema: AiOpponentMoveInputSchema,
    outputSchema: AiOpponentMoveOutputSchema,
  },
  async input => {
    const {output} = await aiOpponentMovePrompt(input);
    return output!;
  }
);
