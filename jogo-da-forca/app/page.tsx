// app/page.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { HangmanDrawing } from "../components/HangmanDrawing";
import { HangmanWord } from "../components/HangmanWord";
import { Keyboard } from "../components/Keyboard";
import words from "./wordList.json";
import styles from "./page.module.css";

function getWord() {
  // Garante que a lista de palavras exista e não esteja vazia antes de sortear
  if (!words || words.length === 0) {
    return "fallback"; // Retorna uma palavra padrão caso a lista falhe
  }
  return words[Math.floor(Math.random() * words.length)];
}

export default function Home() {
  // 1. O ESTADO INICIA COM UMA PALAVRA FIXA E VÁLIDA
  // Isso garante que o servidor e o cliente renderizem a mesma coisa inicialmente.
  const [wordToGuess, setWordToGuess] = useState(words[0] || "inicial");
  
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);

  // 2. ESTE USEEFFECT SORTEIA A PRIMEIRA PALAVRA APENAS NO CLIENTE
  // Ele roda uma vez, depois que a página já carregou no navegador, evitando o conflito.
  useEffect(() => {
    setWordToGuess(getWord());
    setGuessedLetters([]); // Limpa as letras tentadas do estado inicial
  }, [])


  const incorrectLetters = guessedLetters.filter(
    (letter: string) => !wordToGuess.includes(letter)
  );

  const isLoser = incorrectLetters.length >= 6;
  const isWinner = wordToGuess
    .split("")
    .every((letter: string) => guessedLetters.includes(letter));

  const addGuessedLetter = useCallback(
    (letter: string) => {
      if (guessedLetters.includes(letter) || isLoser || isWinner) return;
      setGuessedLetters((currentLetters) => [...currentLetters, letter]);
    },
    [guessedLetters, isWinner, isLoser]
  );
  
  const handleRestart = useCallback(() => {
    setGuessedLetters([]);
    setWordToGuess(getWord());
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key;
      if (!key.match(/^[a-z]$/)) return;
      e.preventDefault();
      addGuessedLetter(key);
    };
    document.addEventListener("keypress", handler);
    return () => {
      document.removeEventListener("keypress", handler);
    };
  }, [addGuessedLetter]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key
      if (key !== "Enter") return
      e.preventDefault()
      handleRestart();
    }
    document.addEventListener("keypress", handler)
    return () => {
      document.removeEventListener("keypress", handler)
    }
  }, [handleRestart])

  return (
    <div
      style={{
        maxWidth: "800px",
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        margin: "0 auto",
        alignItems: "center",
      }}
    >
      <div style={{ fontSize: "2rem", textAlign: "center", height: "80px" }}>
        {isWinner && "Você venceu! 🎉"}
        {isLoser && "Que pena, você perdeu! 😢"}
        {(isWinner || isLoser) && (
          <button onClick={handleRestart} className={styles.restartBtn}>
            Reiniciar Jogo
          </button>
        )}
      </div>
      <HangmanDrawing numberOfIncorrectGuesses={incorrectLetters.length} />
      <HangmanWord
        reveal={isLoser}
        guessedLetters={guessedLetters}
        wordToGuess={wordToGuess}
      />
      <div style={{ alignSelf: "stretch" }}>
        <Keyboard
          disabled={isWinner || isLoser}
          activeLetters={guessedLetters.filter((letter) =>
            wordToGuess.includes(letter)
          )}
          inactiveLetters={incorrectLetters}
          addGuessedLetter={addGuessedLetter}
        />
      </div>
    </div>
  );
}