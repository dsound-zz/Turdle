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
  const [words, setWords] = useState<Word[][]>([]);

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

  useEffect(() => {
    submitWord();
  }, []);

  useEffect(() => {
    console.log("in useEffect: ", word);
    const currentWordsIndex = words.length;
    const winningWords = word
      .map((letter) => letter.status)
      .every((status) => status === "correct");

    if (winningWords) {
      console.log(`You won in ${currentWordsIndex + 1} tries!`);
    }
  }, [word, words]);

  console.log(word, words);

  return <div />;
}

export default App;
