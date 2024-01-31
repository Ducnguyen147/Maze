import React, { useEffect } from "react";
import Phaser from "phaser";
import mazeWall from "../public/img/maze_wall.png";
import mazeHero from "../public/img/maze_hero.png";
import mazeExit from "../public/img/maze_exit.png";
import mazeMonster from "../public/img/maze_monster.png";
import mazeTreasure from "../public/img/maze_treasure.png";
import heroData from "../public/input/maze_hero.json";
import directions from "../public/input/directions.json";

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
      parent: "phaser-game",
      scene: {
        preload: function () {
          this.load.json("mazeData", "/input/maze.json");

          // Load the image
          this.load.image("wall", mazeWall);
          this.load.image("hero", mazeHero);
          this.load.image("exit", mazeExit);
          this.load.image("monster", mazeMonster);
          this.load.image("treasure", mazeTreasure);
        },
        create: function () {
          this.gameTime = 0;
          this.heroName = heroData.Name;
          this.heroMaxHP = Number(heroData.parameters.MaxHP);
          this.heroHP = Number(heroData.parameters.HP);
          this.heroAware = Number(heroData.parameters.Awareness);
          this.heroStealth = Number(heroData.parameters.Stealth);
          this.heroSpeed = Number(heroData.parameters.Speed);
          this.message = "Start!";

          this.currentDirectionIndex = 0;

          //Maze set up
          const padding = 0.2;
          const data = this.cache.json.get("mazeData");
          maze = data.Dungeon.Layout.map((row) => Array.from(row, Number));
          let topdownWall = [];
          for (let i = 0; i <= maze[0].length + 1; i++) {
            topdownWall.push(1);
          }
          for (let i = 0; i < maze.length; i++) {
            maze[i].unshift(1);
            maze[i].push(1);
          }
          maze.unshift(topdownWall);
          maze.push(topdownWall);

          const effectiveWidth = window.innerWidth * (1 - padding);
          const effectiveHeight = window.innerHeight * (1 - padding);
          this.blockSize =
            Math.min(
              effectiveWidth / maze[0].length,
              effectiveHeight / maze.length
            ) * 1.2;
          const mazeWidth = this.blockSize * maze[0].length;
          const offsetX = (window.innerWidth - mazeWidth) / 2;
          const mazeHeight = this.blockSize * maze.length;
          const offsetY = (window.innerHeight - mazeHeight) / 2;
          this.currentX = 1;
          this.currentY = 1;

          // Monster set up
          let monsters = data.Dungeon.Monsters.map((monster) => {
            return {
              x: Number(monster.Position.X),
              y: Number(monster.Position.Y),
              intercept: Number(monster.Intercept),
              benefit: {
                type: monster.Benefit.Type,
                amount: Number(monster.Benefit.Amount),
              },
            };
          });

          // Treasure set up
          let treasures = data.Dungeon.Treasures.map((treasure) => {
            return {
              x: Number(treasure.Position.X),
              y: Number(treasure.Position.Y),
              hidden: Number(treasure.Hidden),
              benefit: {
                type: treasure.Benefit.Type,
                amount: Number(treasure.Benefit.Amount),
              },
            };
          });

          this.monsters = {};
          this.treasures = {};

          monsters.forEach((monster) => {
            const key = `${monster.x + 1}-${monster.y + 1}`;
            this.monsters[key] = this.add.image(
              offsetX + (monster.x + 1) * this.blockSize,
              offsetY + (monster.y + 1) * this.blockSize,
              "monster"
            );
            this.monsters[key].setScale(
              this.blockSize / this.monsters[key].width
            );
            maze[monster.y + 1][monster.x + 1] = -1;
            this.monsters[key].encountered = false;
            this.monsters[key].intercept = monster.intercept;
            this.monsters[key].benefitType = monster.benefit.type;
            this.monsters[key].benefitAmount = monster.benefit.amount;
            if (monster.benefit.amount) {
              this.monsters[
                key
              ].message = `Fight monster (Intercept: ${monster.intercept})! \n(Benefit) ${monster.benefit.type}: +${monster.benefit.amount}`;
            } else {
              this.monsters[
                key
              ].message = `Fight monster! \n(Benefit) ${monster.benefit.type}: ${monster.benefit.amount}`;
            }
          });

          treasures.forEach((treasure) => {
            const key = `${treasure.x + 1}-${treasure.y + 1}`;
            this.treasures[key] = this.add.image(
              offsetX + (treasure.x + 1) * this.blockSize,
              offsetY + (treasure.y + 1) * this.blockSize,
              "treasure"
            );
            this.treasures[key].setScale(
              this.blockSize / this.treasures[key].width
            );
            maze[treasure.y + 1][treasure.x + 1] = 2;
            this.treasures[key].encountered = false;
            this.treasures[key].hidden = treasure.hidden;
            this.treasures[key].benefitType = treasure.benefit.type;
            this.treasures[key].benefitAmount = Number(treasure.benefit.amount);
            if (treasure.benefit.amount >= 0) {
              this.treasures[
                key
              ].message = `Treasure found (Hidden: ${treasure.hidden})! \n(Benefit) ${treasure.benefit.type}: +${treasure.benefit.amount}`;
            } else {
              this.treasures[
                key
              ].message = `Treasure found (Hidden: ${treasure.hidden})! \n(Benefit) ${treasure.benefit.type}: ${treasure.benefit.amount}`;
            }
          });

          // Create the maze
          for (let y = 0; y < maze.length; y++) {
            for (let x = 0; x < maze[y].length; x++) {
              if (maze[y][x] === 1) {
                const image = this.add.image(
                  offsetX + x * this.blockSize,
                  offsetY + y * this.blockSize,
                  "wall"
                );
                image.setScale(this.blockSize / image.width);
              } else if (x == 1 && y == 1) {
                this.hero = this.add.image(
                  offsetX + x * this.blockSize,
                  offsetY + y * this.blockSize,
                  "hero"
                );
                this.hero.setScale(this.blockSize / this.hero.width);
              } else if (x == maze[y].length - 2 && y == maze.length - 2) {
                const image = this.add.image(
                  offsetX + x * this.blockSize,
                  offsetY + y * this.blockSize,
                  "exit"
                );
                image.setScale(this.blockSize / image.width);
              }
            }
          }

          // Create cursor keys
          this.cursors = this.input.keyboard.createCursorKeys();

          // Add a property to track the last time the hero moved
          this.lastMoveTime = 0;
          this.boostedSpeed = 0;
          this.gameTimeText = this.add.text(
            10,
            10,
            `Game Time (mins): ${this.gameTime}`,
            { fontSize: "16px", fill: "#ffffff" }
          );
          this.showName = this.add.text(10, 50, `Name: ${this.heroName}`, {
            fontSize: "16px",
            fill: "#ffffff",
          });
          this.showHP = this.add.text(10, 70, `HP: ${this.heroHP}`, {
            fontSize: "16px",
            fill: "#ffffff",
          });
          this.showAware = this.add.text(10, 90, `Aware: ${this.heroAware}`, {
            fontSize: "16px",
            fill: "#ffffff",
          });
          this.showStealth = this.add.text(
            10,
            110,
            `Stealth: ${this.heroStealth}`,
            { fontSize: "16px", fill: "#ffffff" }
          );
          this.showSpeed = this.add.text(10, 130, `Speed: ${this.heroSpeed}`, {
            fontSize: "16px",
            fill: "#ffffff",
          });
          this.textMessage = this.add.text(10, 200, `Message:`, {
            fontSize: "16px",
            fill: "#ffffff",
          });
          this.showMessage = this.add.text(10, 220, `${this.message}`, {
            fontSize: "16px",
            fill: "#ffffff",
          });
        },

        update: function (time) {
          const updateHero = (x, y) => {
            const key = `${x}-${y}`;
            if (
              maze[y][x] == 2 &&
              this.treasures[key] &&
              !this.treasures[key].encountered &&
              this.heroAware >= this.treasures[key].hidden
            ) {
              switch (this.treasures[key].benefitType) {
                case "HP":
                  this.heroHP += this.treasures[key].benefitAmount;
                  if (this.heroHP > this.heroMaxHP) {
                    this.heroHP = this.heroMaxHP;
                  }
                  break;
                case "Awareness":
                  this.heroAware += this.treasures[key].benefitAmount;
                  break;
                case "Stealth":
                  this.heroStealth += this.treasures[key].benefitAmount;
                  break;
                case "Speed":
                  this.heroSpeed += this.treasures[key].benefitAmount;
                  break;
                case "Flash":
                  this.heroSpeed += 5;
                  this.boostedSpeed += this.treasures[key].benefitAmount + 1; //Does not count the current move
                  break;
              }
              this.treasures[key].setVisible(false);
              this.treasures[key].encountered = true;
              this.message = this.treasures[key].message;
            } else if (
              maze[y][x] == -1 &&
              this.monsters[key] &&
              !this.monsters[key].encountered &&
              this.heroStealth < this.monsters[key].intercept
            ) {
              this.gameTime += 10 + (10 - this.heroSpeed);
              this.heroHP -= 1;
              if (this.heroHP <= 0) {
                this.gameTime += 60;
                this.heroHP = this.heroMaxHP;
              }
              switch (this.monsters[key].benefitType) {
                case "HP":
                  this.heroMaxHP += this.monsters[key].benefitAmount;
                  break;
                case "Awareness":
                  this.heroAware += this.monsters[key].benefitAmount;
                  break;
                case "Stealth":
                  this.heroStealth += this.monsters[key].benefitAmount;
                  break;
                case "Speed":
                  this.heroSpeed += this.monsters[key].benefitAmount;
                  break;
              }
              this.monsters[key].setVisible(false);
              this.monsters[key].encountered = true;
              this.message = this.monsters[key].message;
            }
            maze[y][x] = 0;
          };

          // Hero speed
          if (time - this.lastMoveTime > 200) {
            if (
              maze[this.currentY][this.currentX] == -1 ||
              maze[this.currentY][this.currentX] == 2
            ) {
              updateHero(this.currentX, this.currentY);
              if (this.boostedSpeed > 0) {
                this.boostedSpeed--;
                if (this.boostedSpeed === 0) {
                  this.heroSpeed -= 5;
                }
              }
            }

            const currentDirection =
              directions.Directions[this.currentDirectionIndex];

            switch (currentDirection) {
              case "E":
                if (maze[this.currentY][this.currentX + 1] !== 1) {
                  this.gameTime += 10 + (10 - this.heroSpeed);
                  this.hero.x += this.blockSize;
                  this.currentX += 1;
                }
                break;
              case "S":
                if (maze[this.currentY + 1][this.currentX] !== 1) {
                  this.gameTime += 10 + (10 - this.heroSpeed);
                  this.hero.y += this.blockSize;
                  this.currentY += 1;
                }
                break;
              case "N":
                if (maze[this.currentY - 1][this.currentX] !== 1) {
                  this.gameTime += 10 + (10 - this.heroSpeed);
                  this.hero.y -= this.blockSize;
                  this.currentY -= 1;
                }
                break;
              case "W":
                if (maze[this.currentY][this.currentX - 1] !== 1) {
                  this.gameTime += 10 + (10 - this.heroSpeed);
                  this.hero.x -= this.blockSize;
                  this.currentX -= 1;
                }
                break;
            }

            this.currentDirectionIndex++;

            //   if (this.cursors.left.isDown && maze[this.currentY][this.currentX - 1] !== 1) {
            //     this.gameTime += 10 + (10 - this.heroSpeed);
            //     this.hero.x -= this.blockSize;
            //     this.currentX -= 1;
            //     // this.message = 'Keep going!';
            //     if (this.boostedSpeed > 0) {
            //         this.boostedSpeed--;
            //         if (this.boostedSpeed === 0) {
            //             this.heroSpeed -= 5;
            //         }
            //     }
            //   } else if (this.cursors.right.isDown && maze[this.currentY][this.currentX + 1] !== 1) {
            //     this.gameTime += 10 + (10 - this.heroSpeed);
            //     this.hero.x += this.blockSize;
            //     this.currentX += 1;
            //     this.message = 'Keep going!';
            //     if (this.boostedSpeed > 0) {
            //         this.boostedSpeed--;
            //         if (this.boostedSpeed === 0) {
            //             this.heroSpeed -= 5;
            //         }
            //     }
            //   }

            //   if (this.cursors.up.isDown && maze[this.currentY - 1][this.currentX] !== 1) {
            //     this.gameTime += 10 + (10 - this.heroSpeed);
            //     this.hero.y -= this.blockSize;
            //     this.currentY -= 1;
            //     this.message = 'Keep going!';
            //     if (this.boostedSpeed > 0) {
            //         this.boostedSpeed--;
            //         if (this.boostedSpeed === 0) {
            //             this.heroSpeed -= 5;
            //         }
            //     }
            //   } else if (this.cursors.down.isDown && maze[this.currentY + 1][this.currentX] !== 1) {
            //     this.gameTime += 10 + (10 - this.heroSpeed);
            //     this.hero.y += this.blockSize;
            //     this.currentY += 1;
            //     this.message = 'Keep going!';
            //     if (this.boostedSpeed > 0) {
            //         this.boostedSpeed--;
            //         if (this.boostedSpeed === 0) {
            //             this.heroSpeed -= 5;
            //         }
            //     }
            //   }

            // Update data
            this.lastMoveTime = time;
            this.gameTimeText.setText(
              `Game Time (mins): ${this.gameTime.toFixed(1)}`
            );
            this.showName.setText(`Name: ${this.heroName}`);
            this.showHP.setText(`HP: ${this.heroHP} / ${this.heroMaxHP}`);
            this.showAware.setText(`Awareness: ${this.heroAware}`);
            this.showStealth.setText(`Stealth: ${this.heroStealth}`);
            this.showSpeed.setText(`Speed: ${this.heroSpeed.toFixed(1)}`);
            this.textMessage.setText(`Message:`);
            this.showMessage.setText(`${this.message}`);
          }
        },
      },
    };

    new Phaser.Game(config);
  }, []);

  return (
    <div>
      <div id="phaser-game"></div>
    </div>
  );
}

export default Game;
