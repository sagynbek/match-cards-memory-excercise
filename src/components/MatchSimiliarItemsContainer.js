import React, { useEffect, useState, useContext } from "react";
import { cloneDeep } from "lodash";
import GameDifficultyContext from "../contexts/GameDifficultyContext";
import { DIFFICULTY_LEVEL_CONFIGURATION } from "../constants/GameDifficulty";

const GAME_STATUS = {
  PLAYING: "PLAYING",
  WON: "WON",
  LOST: "LOST"
};

const MatchSimiliarItemsContainer = () => {
  const { difficulty } = useContext(GameDifficultyContext);
  const [matrix, setMatrix] = useState(null);
  const [lastOpenAr, setLastOpenAr] = useState([]);
  const [isFlipingEnabled, setIsFlipingEnabled] = useState(false);
  const [tries, setTries] = useState(0);
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.PLAYING);
  const [discoveredCount, setDiscoveredCount] = useState(0);

  const { MATRIX_WIDTH, MATRIX_HEIGHT } = DIFFICULTY_LEVEL_CONFIGURATION[
    difficulty
  ];
  const MAX_TOTAL_TRIES = MATRIX_WIDTH * MATRIX_HEIGHT * 2.5;

  useEffect(() => {
    // Initialize game matrix
    if ((MATRIX_HEIGHT * MATRIX_WIDTH) % 2 === 0) {
      const sourceOfRandomValues = [],
        emptyCoordinates = [],
        newMatrix = [];

      // Random values of cells, 1 value will be used in 2 cells
      for (let i = 0; i < (MATRIX_HEIGHT * MATRIX_WIDTH) / 2; i++) {
        sourceOfRandomValues.push(Math.round(Math.random() * 90 + 10));
      }
      for (let itX = 0; itX < MATRIX_WIDTH; itX++) {
        newMatrix.push([]);
        for (let itY = 0; itY < MATRIX_HEIGHT; itY++) {
          emptyCoordinates.push({ x: itX, y: itY });
          newMatrix[itX].push({});
        }
      }

      function getRandomItemFromAr(sourceAr) {
        if (sourceAr.length > 0) {
          let pos = Math.floor(Math.random() * sourceAr.length);
          let result = sourceAr[pos];
          sourceAr.splice(pos, 1);
          return result;
        }
        return null;
      }

      while (emptyCoordinates.length > 0) {
        const value = getRandomItemFromAr(sourceOfRandomValues);

        for (let it = 0; it < 2; it++) {
          const coordinate1 = getRandomItemFromAr(emptyCoordinates);

          newMatrix[coordinate1.x][coordinate1.y] = {
            value,
            isOpen: true,
            isDiscovered: false
          };
        }
      }
      setMatrix(newMatrix);

      // After matrix data is being displayed, we close all matrix items after some time
      setTimeout(() => {
        setMatrix(matrix => {
          const newMatrix = cloneDeep(matrix);
          for (let itX = 0; itX < MATRIX_WIDTH; itX++) {
            for (let itY = 0; itY < MATRIX_HEIGHT; itY++) {
              newMatrix[itX][itY].isOpen = false;
            }
          }

          return newMatrix;
        });
        setIsFlipingEnabled(true);
      }, 2000);
    }
  }, [setMatrix]);

  // After some flips, this useEffect checks if there are 2 open cells and tries to close them
  useEffect(() => {
    if (lastOpenAr.length >= 2) {
      const newMatrix = cloneDeep(matrix);

      setTimeout(() => {
        while (lastOpenAr.length > 0) {
          const { x, y } = lastOpenAr[0];
          if (newMatrix[x][y].isDiscovered === false) {
            newMatrix[x][y].isOpen = false;
          }
          lastOpenAr.splice(0, 1);
        }

        setIsFlipingEnabled(true);
        setMatrix(newMatrix);
        setLastOpenAr([]);
      }, 1000);

      setIsFlipingEnabled(false);
    }
  }, [lastOpenAr, setLastOpenAr, matrix, setMatrix, setIsFlipingEnabled]);

  useEffect(() => {
    if (Array.isArray(matrix)) {
      let discovered = 0;
      for (let itX = 0; itX < MATRIX_WIDTH; itX++) {
        for (let itY = 0; itY < MATRIX_HEIGHT; itY++) {
          discovered += matrix[itX][itY].isDiscovered;
        }
      }
      setDiscoveredCount(discovered);
    }
  }, [matrix, setDiscoveredCount, setGameStatus]);

  useEffect(() => {
    if (MAX_TOTAL_TRIES < tries) {
      setGameStatus(GAME_STATUS.LOST);
    }
  }, [tries, setGameStatus]);
  useEffect(() => {
    if (discoveredCount === MATRIX_WIDTH * MATRIX_HEIGHT) {
      setGameStatus(GAME_STATUS.WON);
    }
  }, [discoveredCount, setGameStatus]);

  function handleToggleCell(x, y) {
    const newMatrix = cloneDeep(matrix);
    const newLastOpenAr = cloneDeep(lastOpenAr);

    const newMatrixValue = newMatrix[x][y];
    if (
      !newMatrixValue.isDiscovered &&
      isFlipingEnabled &&
      gameStatus === GAME_STATUS.PLAYING
    ) {
      /** Toggle isOpen */
      newMatrixValue.isOpen = !newMatrixValue.isOpen;

      /** Check if we have discovered 2 items */
      const pairInd = newLastOpenAr.findIndex(item => {
        return (
          newMatrixValue.isOpen &&
          !(item.x === x && item.y === y) &&
          newMatrix[item.x][item.y].value === newMatrixValue.value
        );
      });

      // 2 matching cells found
      if (pairInd !== -1) {
        // Set as discovered 2 cells
        newMatrixValue.isDiscovered = true;
        newMatrix[newLastOpenAr[pairInd].x][
          newLastOpenAr[pairInd].y
        ].isDiscovered = true;
        newLastOpenAr.splice(pairInd, 1);
      }
      // Meaning user simply opened one cell
      else if (newMatrixValue.isOpen) {
        newLastOpenAr.push({ x, y });
      }
      // Meaning user closes already open cell
      else {
        const itemPos = newLastOpenAr.findIndex(
          item => item.x === x && item.y === y
        );
        if (itemPos !== -1) {
          newLastOpenAr.splice(itemPos, 1);
        }
      }

      newMatrix[x][y] = newMatrixValue;
      setMatrix(newMatrix);
      setLastOpenAr(newLastOpenAr);
      setTries(tries => tries + 1);
    }
  }

  let contentContainer = null;

  if (matrix !== null) {
    contentContainer = matrix.map((matrixX, keyX) => {
      return (
        <tr key={keyX}>
          {matrixX.map((item, keyY) => {
            const { isOpen, isDiscovered, value } = item;
            let content = "X";
            let style = {};

            if (isOpen || isDiscovered) {
              if (isDiscovered) {
                style = { backgroundColor: "green" };
              } else if (isOpen) {
                style = { backgroundColor: "yellow" };
              }
              content = value;
            }
            if (!isFlipingEnabled) {
              style.cursor = "not-allowed";
            }

            return (
              <td
                onClick={() => {
                  handleToggleCell(keyX, keyY);
                }}
                style={style}
                key={keyY}
              >
                {content}
              </td>
            );
          })}
        </tr>
      );
    });
  }

  let gameStatusContainer = null;
  if (gameStatus === GAME_STATUS.WON) {
    gameStatusContainer = (
      <h1 style={{ color: "green" }}>
        Congratulations you won, in {tries} tries
      </h1>
    );
  }
  if (gameStatus === GAME_STATUS.LOST) {
    gameStatusContainer = (
      <h1 style={{ color: "red" }}>
        {MAX_TOTAL_TRIES} tries exceeded, you LOST
      </h1>
    );
  }

  return (
    <React.Fragment>
      {gameStatus === GAME_STATUS.PLAYING ? (
        <h3>
          Flips: {tries} | Flips Left:{" "}
          {MAX_TOTAL_TRIES - tries >= 0 ? MAX_TOTAL_TRIES - tries : 0}
        </h3>
      ) : (
        gameStatusContainer
      )}
      <h3>Discovered count: {discoveredCount}</h3>

      <div>
        Hint: <em>Flip and match similiar cards</em>
      </div>

      <table>
        <tbody>{contentContainer}</tbody>
      </table>
    </React.Fragment>
  );
};

export default MatchSimiliarItemsContainer;
