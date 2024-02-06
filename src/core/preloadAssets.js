import mazeWall from "../../public/img/maze_wall.png";
import mazeHero from "../../public/img/maze_hero.png";
import mazeExit from "../../public/img/maze_exit.png";
import mazeMonster from "../../public/img/maze_monster.png";
import mazeTreasure from "../../public/img/maze_treasure.png";

export function preloadAssets() {
  this.load.json("mazeData", "/input/maze.json");

  // Load the image
  this.load.image("wall", mazeWall);
  this.load.image("hero", mazeHero);
  this.load.image("exit", mazeExit);
  this.load.image("monster", mazeMonster);
  this.load.image("treasure", mazeTreasure);
}
