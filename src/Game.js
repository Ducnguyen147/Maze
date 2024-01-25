import React, { useEffect } from 'react';
import Phaser from 'phaser';

// Define our maze
const maze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

function Game() {
  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'phaser-game',
      scene: {
        create: function() {
          // Create the maze
          for (let y = 0; y < maze.length; y++) {
            for (let x = 0; x < maze[y].length; x++) {
              if (maze[y][x] === 1) {
                this.add.rectangle(x * 80, y * 60, 80, 60, 0xFFFFFF);
              }
            }
          }
        }
      }
    };

    new Phaser.Game(config);
  }, []);

  return <div id="phaser-game"></div>;
}

export default Game;