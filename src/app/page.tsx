import { TicTacToe } from '@/components/tic-tac-toe';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-md">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-center mb-4 text-primary">
          Noughts and Crosses AI
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Can you beat the AI? The first to get 3 in a row wins.
        </p>
        <TicTacToe />
      </div>
    </main>
  );
}
