import React, { useEffect, useState, useContext } from "react";
import GameDifficultyContext from "../contexts/GameDifficultyContext";
import {
  GAME_DIFFICULTY,
  DIFFICULTY_LEVEL_CONFIGURATION
} from "../constants/GameDifficulty";

const SelectGameDifficulty = () => {
  const { difficulty, setDifficulty } = useContext(GameDifficultyContext);

  const optionsContainer = Object.keys(GAME_DIFFICULTY).map(difficultyItem => {
    return (
      <React.Fragment>
        <input
          type="radio"
          name="difficulty"
          value={difficultyItem}
          checked={difficultyItem === difficulty}
          onChange={() => {
            setDifficulty(difficultyItem);
          }}
        />
        {difficultyItem} (
        {DIFFICULTY_LEVEL_CONFIGURATION[difficultyItem].MATRIX_WIDTH}x
        {DIFFICULTY_LEVEL_CONFIGURATION[difficultyItem].MATRIX_HEIGHT})
        <br />
      </React.Fragment>
    );
  });

  return (
    <div>
      <hr />
      <h4>Select Memory Level:</h4>
      {optionsContainer}
      {/* <input type="radio" name="difficulty" value="easy" />
      <input type="radio" name="difficulty" value="medium" />
      <input type="radio" name="difficulty" value="hard" /> */}
    </div>
  );
};

export default SelectGameDifficulty;
