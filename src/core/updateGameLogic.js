export function updateGameLogic(time) {
  const maze = this.game.registry.get("maze");
  const directions = this.game.registry.get("directions");
  if (
    this.currentX === maze[0].length - 2 &&
    this.currentY === maze.length - 2
  ) {
    this.message = "You have exited the maze!\nCongratulations";
  }
  const isAnimating = this.game.registry.get("isAnimating");
  if (!isAnimating) {
    return;
  }

  const speedGame = this.game.registry.get("speedGame");

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
  if (time - this.lastMoveTime > speedGame) {
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

    const currentDirection = directions.Directions[this.currentDirectionIndex];

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

    // Update data
    this.lastMoveTime = time;
    this.gameTimeText.setText(`Game Time (mins): ${this.gameTime.toFixed(1)}`);
    this.showName.setText(`Name: ${this.heroName}`);
    this.showHP.setText(`HP: ${this.heroHP} / ${this.heroMaxHP}`);
    this.showAware.setText(`Awareness: ${this.heroAware}`);
    this.showStealth.setText(`Stealth: ${this.heroStealth}`);
    this.showSpeed.setText(`Speed: ${this.heroSpeed.toFixed(1)}`);
    this.textMessage.setText(`Message:`);
    this.showMessage.setText(`${this.message}`);
    this.setGameTime(this.gameTime);
  }
}
