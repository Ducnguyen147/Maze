import { preloadAssets } from "./preloadAssets";
import { createGameObjects } from "./createGameObjects";
import { updateGameLogic } from "./updateGameLogic";

const setupScene = (setGameTime, speedGame, setMaze) => ({
  preload: function () {
    preloadAssets.call(this);
  },
  create: function () {
    createGameObjects.call(
      this,
      setGameTime,
      speedGame,
      setMaze
    );
  },
  update: function (time) {
    const directions = this.game.registry.get('directions');
    updateGameLogic.call(this, time);
  },
});

export default setupScene;
