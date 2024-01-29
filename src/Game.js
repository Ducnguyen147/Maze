import React, { useEffect } from 'react';
import Phaser from 'phaser';
import mazeWall from '../public/img/maze_wall.png';
import mazeHero from '../public/img/maze_hero.png';
import mazeExit from '../public/img/maze_exit.png';
import mazeMonster from '../public/img/maze_monster.png';
import HeroInfo from './Hero'

// Define our maze
let maze = [];

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
            this.load.json('mazeData', '/input/maze.json');
                
            // Load the image
            this.load.image('wall', mazeWall);
            this.load.image('hero', mazeHero);
            this.load.image('exit', mazeExit);
            this.load.image('monster', mazeMonster);
        },
        create: function() {
            let hero;

            //Maze set up
            const padding = 0.2;
            const data = this.cache.json.get('mazeData');
            maze = data.Dungeon.Layout.map(row => Array.from(row, Number));
            let topdownWall = [];
            for ( let i = 0 ; i <= maze[0].length + 1 ; i++ ) {
                topdownWall.push(1);
            }
            for ( let i = 0 ; i < maze.length ; i++ ) {
                maze[i].unshift(1);
                maze[i].push(1);
            }
            maze.unshift(topdownWall);
            maze.push(topdownWall);

            const effectiveWidth = window.innerWidth * (1 - padding);
            const effectiveHeight = window.innerHeight * (1 - padding);
            this.blockSize = Math.min(effectiveWidth / maze[0].length, effectiveHeight / maze.length) * 1.1;
            const offsetX = this.blockSize * 16;
            const offsetY = this.blockSize / 1.5;
            this.currentX = 1;
            this.currentY= 1;

            // Monster set up
            let monsters = data.Dungeon.Monsters.map(monster => {
                return {
                    x: Number(monster.Position.X),
                    y: Number(monster.Position.Y),
                    intercept: Number(monster.Intercept),
                    benefit: {
                        type: monster.Benefit.Type,
                        amount: Number(monster.Benefit.Amount)
                    }
                };
            });

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
                    } else {
                        const monster = monsters.find(monster => monster.x + 1 === x && monster.y + 1 === y);
                        if (monster) {
                            const mazeMonster = this.add.image(offsetX + x * this.blockSize, offsetY + y * this.blockSize, 'monster');
                            mazeMonster.setScale(this.blockSize / mazeMonster.width);
                        }
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
            if (time - this.lastMoveTime > 150) {
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

  return (
    <div>
        <HeroInfo />
        <div id="phaser-game" ></div>

    </div>
);
}

export default Game;