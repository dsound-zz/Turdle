import { useEffect, useState } from "react";
import "./App.css";

const turdleWord: string = "sssss";

interface Word {
  letter: string;
  status: "correct" | "misplaced" | "incorrect" | null;
}

function App() {
  const [guess, setGuess] = useState<string>("sssss");
  const [word, setWord] = useState<Word[]>([]);

  function submitWord() {
    const letterStatus: Word[] = [];
    for (const [index, letter] of guess.split("").entries()) {
      const trackedLetter = new Set();
      if (!turdleWord.includes(letter)) {
        letterStatus.push({ letter, status: "incorrect" });
        continue;
      }
      const newIndex = trackedLetter.has(letter) ? index + 1 : index;
      if (
        turdleWord.includes(letter) &&
        turdleWord.indexOf(letter, newIndex) !== index
      ) {
        letterStatus.push({ letter, status: "misplaced" });
        trackedLetter.add(letter);
      } else {
        letterStatus.push({ letter, status: "correct" });
      }
    }
    setWord(letterStatus);
  }
  console.log(word);

  useEffect(() => {
    submitWord();
  }, []);

  return <div />;
}

export default App;
