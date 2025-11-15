import { useEffect, useState } from "react";
import "./App.css";
import { KEYBOARD } from "./utils/keyboard";

type EvaluationResult = "correct" | "misplaced" | "incorrect";

const turdleWord: string = "stick";

const priority = {
  incorrect: 0,
  misplaced: 1,
  correct: 2,
} as const;

function App() {
  const [words, setWords] = useState<string[][]>([]);
  const [currentCol, setCurrentCol] = useState<number>(0);
  const [currentRow, setCurrentRow] = useState<number>(0);
  const [evaluations, setEvaluations] = useState<EvaluationResult[][]>([]);
  const [isWinner, setIsWinner] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [usedLetters, setUsedLetters] = useState<Map<string, EvaluationResult>>(
    () => new Map()
  );
  const [flippingBoxes, setFlippingBoxes] = useState<Set<string>>(new Set());

  function handleKeyPress(letter: string) {
    playClickSound();

    if (letter === "⌫") return handleDelete();

    // Prevent typing beyond 5 letters (indices 0-4)
    if (currentCol >= 5 && letter !== "ENTER") return;

    // Prevent submitting before 5 letters are typed
    if (currentCol < 5 && letter === "ENTER") return;

    // Submit when all 5 letters are filled (currentCol === 5)
    if (currentCol === 5 && letter === "ENTER") return handleSubmit();

    setWords((prev) => {
      if (!prev[currentRow]) return prev;
      const newGrid = prev.map((row) => [...row]);

      newGrid[currentRow][currentCol] = letter;

      return newGrid;
    });

    setCurrentCol((col) => col + 1);
  }

  function handleDelete() {
    if (currentCol === 0) return;
    setWords((prev) => {
      const newGrid = prev.map((row) => [...row]);
      newGrid[currentRow][currentCol - 1] = "";

      return newGrid;
    });
    setCurrentCol((col) => col - 1);
  }

  async function handleSubmit() {
    const wordRow = words[currentRow];
    const word = wordRow.join(""); // get the full word

    const evaluationResults: EvaluationResult[] = evaluateWord(
      word,
      turdleWord
    );

    for (const [index, evaluation] of evaluationResults.entries()) {
      // Trigger flip animation
      const boxKey = `${currentRow}-${index}`;
      setFlippingBoxes((prev) => new Set(prev).add(boxKey));

      // Set evaluation (color change happens during flip)
      setEvaluations((prev) => {
        const next = prev.map((evaluationRow) => [...evaluationRow]);
        if (!next[currentRow]) {
          next[currentRow] = [];
        }
        next[currentRow][index] = evaluation;
        return next;
      });

      const letter = words[currentRow][index];

      setUsedLetters((prev) => {
        const next = new Map(prev);
        const existing = next.get(letter);

        if (!existing || priority[evaluation] > priority[existing]) {
          next.set(letter, evaluation);
        }

        return next;
      });

      // Remove flip class after animation completes
      setTimeout(() => {
        setFlippingBoxes((prev) => {
          const next = new Set(prev);
          next.delete(boxKey);
          return next;
        });
      }, 600); // Match animation duration

      await new Promise((res) => setTimeout(res, 500)); // Stagger delay
    }

    const allCorrect = evaluationResults.every(
      (result: string) => result === "correct"
    );

    const noWinner = currentRow === 5 && !allCorrect;

    if (allCorrect) {
      setIsWinner(true);
    } else if (noWinner) {
      setGameOver(true);
    } else {
      // Move to next row
      setCurrentRow((row) => row + 1);
      setCurrentCol(0);
    }
  }

  function evaluateWord(guess: string, target: string) {
    // Normalize both to lowercase for comparison
    const normalizedGuess = guess.toLowerCase();
    const normalizedTarget = target.toLowerCase();

    const results: EvaluationResult[] = new Array(normalizedGuess.length).fill(
      "incorrect"
    );
    const targetChars = normalizedTarget.split("");
    const guessChars = normalizedGuess.split("");
    const usedIndices = new Set<number>();

    // First pass: mark correct positions
    for (let i = 0; i < guessChars.length; i++) {
      if (guessChars[i] === targetChars[i]) {
        results[i] = "correct";
        usedIndices.add(i);
      }
    }

    // Second pass: mark misplaced characters
    for (let i = 0; i < guessChars.length; i++) {
      if (results[i] === "correct") continue;

      for (let j = 0; j < targetChars.length; j++) {
        if (!usedIndices.has(j) && guessChars[i] === targetChars[j]) {
          results[i] = "misplaced";
          usedIndices.add(j);
          break;
        }
      }
    }
    return results;
  }

  useEffect(() => {
    setWords(
      Array.from({ length: 6 }, () => Array.from({ length: 5 }, () => ""))
    );
  }, []);

  function reset() {
    setIsWinner(false);
    setCurrentCol(0);
    setCurrentRow(0);
    setEvaluations([]);
    setGameOver(false);
    setFlippingBoxes(new Set());
    setWords(
      Array.from({ length: 6 }, () => Array.from({ length: 5 }, () => ""))
    );
    setUsedLetters(() => new Map());
  }

  return (
    <>
      {isWinner && (
        <>
          <div className="winner-message">🎉 You Win! 🎉</div>
          <p>
            You did it in{" "}
            {`${currentRow + 1} ${currentRow + 1 === 1 ? "try" : "tries"}`}
          </p>
          <button onClick={() => reset()} style={{ margin: "8px" }}>
            Play again
          </button>
        </>
      )}
      {gameOver && (
        <>
          <div className="gameover-message">Better luck next time!</div>
          <button onClick={() => reset()}>Play again</button>
        </>
      )}
      <div className="container-grid">
        {words?.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row?.map((box, colIndex) => {
              const evaluation = evaluations[rowIndex]?.[colIndex];
              const boxKey = `${rowIndex}-${colIndex}`;
              const isFlipping = flippingBoxes.has(boxKey);
              return (
                <div
                  key={colIndex}
                  className={`box ${evaluation || ""} ${
                    isFlipping ? "flip" : ""
                  }`}
                >
                  {box}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="keyboard">
        {KEYBOARD.map((row, rowIndex) => (
          <div key={rowIndex} className="keyboard-row">
            {row.map((key) => {
              const evaluation = usedLetters.get(key) || null;

              return (
                <button
                  key={key}
                  className={`key ${evaluation || ""}`}
                  onClick={() => handleKeyPress(key)}
                >
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}

export default App;

function playClickSound() {
  const audioContext = new AudioContext();
  const bufferSize = audioContext.sampleRate * 0.01; // 10ms of audio
  const buffer = audioContext.createBuffer(
    1,
    bufferSize,
    audioContext.sampleRate
  );
  const data = buffer.getChannelData(0);

  // Fill with white noise
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = audioContext.createBufferSource();
  const gainNode = audioContext.createGain();

  source.buffer = buffer;
  source.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Quick fade out for click sound
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.01
  );

  source.start(audioContext.currentTime);
  source.stop(audioContext.currentTime + 0.01);
}
