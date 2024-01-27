import React, { useEffect } from 'react';
import Phaser from 'phaser';
import mazeWall from '../public/img/maze_wall.png';
import mazeHero from '../public/img/maze_hero.png';
import mazeExit from '../public/img/maze_exit.png';

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
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight,
      },
      parent: 'phaser-game',
      scene: {
        preload: function() {
            // Load the image
            this.load.image('wall', mazeWall);
            this.load.image('hero', mazeHero);
            this.load.image('exit', mazeExit);
        },
        create: function() {
            let hero;
            const padding = 0.2;
            const effectiveWidth = window.innerWidth * (1 - padding);
            const effectiveHeight = window.innerHeight * (1 - padding);
            this.blockSize = Math.min(effectiveWidth / maze[0].length, effectiveHeight / maze.length);
            const offsetX = this.blockSize / 1.5;
            const offsetY = this.blockSize / 1.5;
            this.currentX = 1;
            this.currentY= 1;
            // Create the maze
            for (let y = 0; y < maze.length; y++) {
                for (let x = 0; x < maze[y].length; x++) {
                    if (maze[y][x] === 1) {
                        const image = this.add.image(offsetX + x * this.blockSize, offsetY + y * this.blockSize, 'wall');
                        image.setScale(this.blockSize / image.width);
                    } else if ( x == 1 && y == 1) {
                        this.hero = this.add.image(offsetX + x * this.blockSize, offsetY + y * this.blockSize, 'hero');
                        this.hero.setScale(this.blockSize / this.hero.width);
                    } else if ( x == maze[y].length - 2 && y == maze.length-2) {
                        const image = this.add.image(offsetX + x * this.blockSize, offsetY + y * this.blockSize, 'exit');
                        image.setScale(this.blockSize / image.width);
                    }
                }
            }

            // Create cursor keys
            this.cursors = this.input.keyboard.createCursorKeys();

            // Add a property to track the last time the hero moved
            this.lastMoveTime = 0;
        },
        
        update(time) {
            // Only move the hero if enough time has passed since the last move
            console.log(this.currentX, this.currentY);
            if (time - this.lastMoveTime > 250) {
              if (this.cursors.left.isDown && maze[this.currentY][this.currentX - 1] !== 1) {
                this.hero.x -= this.blockSize;
                this.currentX -= 1;
              } else if (this.cursors.right.isDown && maze[this.currentY][this.currentX + 1] !== 1) {
                this.hero.x += this.blockSize;
                this.currentX += 1;
              }
          
              if (this.cursors.up.isDown && maze[this.currentY - 1][this.currentX] !== 1) {
                this.hero.y -= this.blockSize;
                this.currentY -= 1;
              } else if (this.cursors.down.isDown && maze[this.currentY + 1][this.currentX] !== 1) {
                this.hero.y += this.blockSize;
                this.currentY += 1;
              }
          
              // Update the last move time
              this.lastMoveTime = time;
            }
          }
      }
    };

    new Phaser.Game(config);
  }, []);

  return <div id="phaser-game" style={{ width: '100%', height: '100%' }}></div>;
}

export default Game;