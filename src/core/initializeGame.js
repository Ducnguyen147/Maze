import Phaser from "phaser";
import setupScene from "./setupScene";

const initializeGame = (
  gameRef,
  setGameTime,
  speedGame,
  setMaze
) => {
  if (gameRef.current) {
    gameRef.current.destroy(true); // Destroy the current game instance
  }
  const config = {
    type: Phaser.AUTO,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: window.innerWidth,
      height: window.innerHeight,
    },
    parent: "phaser-game",
    scene: setupScene(setGameTime, speedGame, setMaze),
  };

  gameRef.current = new Phaser.Game(config);
};

export default initializeGame;
