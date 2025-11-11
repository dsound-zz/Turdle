import { useEffect, useState } from "react";
import "./App.css";
import { KEYBOARD } from "./utils/keyboard";

const turdleWord: string = "sssss";

function App() {
  const [words, setWords] = useState<string[][]>([]);
  const [currentCol, setCurrentCol] = useState<number>(0);
  const [currentRow, setCurrentRow] = useState<number>(0);

  function handleKeyPress(letter: string) {
    if (letter === "⌫") return handleDelete();
    if (currentCol > 4) return;
    if (currentCol < 4 && letter === "ENTER") return;
    if (currentCol === 4 && letter === "ENTER") return handleSubmit();
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

  function handleSubmit() {
    const wordRow = words[currentRow];
    for (const [index, char] of wordRow.entries()) {
    }
    setWords((prev) => {
      const newGrid = prev.map((row) => [...row]);
      newGrid[currentRow] = letterStatus;
      return newGrid;
    });
  }

  function evaluateGuess(guess: string, targetString: string) {
    const evalutions = guess;
  }

  useEffect(() => {
    setWords(
      Array.from({ length: 6 }, () => Array.from({ length: 5 }, () => ""))
    );
  }, []);

  return (
    <>
      <div className="container-grid">
        {words?.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row?.map((box, colIndex) => (
              <div key={colIndex} className="box">
                {box}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="keyboard">
        {KEYBOARD.map((row, rowIndex) => (
          <div key={rowIndex} className="keyboard-row">
            {row.map((key) => (
              <button
                key={key}
                className="key"
                onClick={() => handleKeyPress(key)}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
