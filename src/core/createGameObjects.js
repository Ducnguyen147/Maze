// import heroData from "../../public/input/players/teamA/maze_hero.json";

export function createGameObjects(
  setGameTime,
  speedGame,
  setMaze
) {
  const heroData = this.game.registry.get("hero");
  this.gameTime = 0;
  this.heroName = heroData.Name;
  this.heroMaxHP = Number(heroData.parameters.MaxHP);
  this.heroHP = Number(heroData.parameters.HP);
  this.heroAware = Number(heroData.parameters.Awareness);
  this.heroStealth = Number(heroData.parameters.Stealth);
  this.heroSpeed = Number(heroData.parameters.Speed);
  this.message = "Start!";

  this.currentDirectionIndex = 0;
  this.setGameTime = setGameTime;

  this.game.registry.set(
    "speedGame",
    speedGame === "fast" ? 0 : speedGame === "normal" ? 200 : 400
  );
  this.game.registry.set("isAnimating", false);

  //Maze set up
  const padding = 0.2;
  const data = this.cache.json.get("mazeData");
  let maze = data.Dungeon.Layout.map((row) => Array.from(row, Number));
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

  setMaze(maze);
  this.game.registry.set("maze", maze);

  const effectiveWidth = window.innerWidth * (1 - padding);
  const effectiveHeight = window.innerHeight * (1 - padding);
  this.blockSize =
    Math.min(effectiveWidth / maze[0].length, effectiveHeight / maze.length) *
    1.2;
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
    this.monsters[key].setScale(this.blockSize / this.monsters[key].width);
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
    this.treasures[key].setScale(this.blockSize / this.treasures[key].width);
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
  this.showStealth = this.add.text(10, 110, `Stealth: ${this.heroStealth}`, {
    fontSize: "16px",
    fill: "#ffffff",
  });
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
}
