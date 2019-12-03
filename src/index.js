import React, { useState } from "react";
import { render } from "react-dom";
import MatchSimiliarItemsContainer from "./components/MatchSimiliarItemsContainer";

import "./styles.css";
import GameDifficultyContext from "./contexts/GameDifficultyContext";
import { GAME_DIFFICULTY } from "./constants/GameDifficulty";
import SelectGameDifficulty from "./components/SelectGameDifficulty";

function App() {
  const [gameKey, setGameKey] = useState(0);
  const [difficulty, setDifficulty] = useState(GAME_DIFFICULTY.ELEPHANT);

  const gameDifficultyValues = {
    difficulty,
    setDifficulty
  };

  return (
    <div className="App">
      <GameDifficultyContext.Provider value={gameDifficultyValues}>
        <MatchSimiliarItemsContainer key={gameKey + difficulty} />
        <button
          onClick={() => {
            setGameKey(gameKey => gameKey + 1);
          }}
        >
          Restart
        </button>
        <SelectGameDifficulty />
      </GameDifficultyContext.Provider>
    </div>
  );
}

const rootElement = document.getElementById("root");
render(<App />, rootElement);
