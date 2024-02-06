import React, { useEffect, useState, useRef } from "react";
import Phaser from "phaser";
import initializeGame from "./core/initializeGame";

function Game() {
  const [gameTime, setGameTime] = useState(0);
  const [speedGame, setSpeedGame] = useState("fast");
  const [isAnimating, setIsAnimating] = useState(false);
  const [maze, setMaze] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [directions, setDirections] = useState([]); 
  const [hero, setHero] = useState([]); 
  const gameRef = useRef(null);


  useEffect(() => {
    fetch('/input/teams.json')
      .then(response => response.json())
      .then(data => {
        setTeams(data);
        if (data.length > 0) {
          setSelectedTeam(data[0]);
        }
      })
      .catch(error => console.error("Failed to load teams.json", error));
  }, []);

  useEffect(() => {
    initializeGame(gameRef, setGameTime, speedGame, setMaze);
    if (!selectedTeam) return;
    const loadHeroAndDirections = async () => {
      const heroModule = await import(`../public/input/players/${selectedTeam}/maze_hero.json`);
      setHero(heroModule.default);
      if (gameRef.current) {
        gameRef.current.registry.set('hero', heroModule.default);
      }
      const directionsModule = await import(`../public/input/players/${selectedTeam}/directions.json`);
      setDirections(directionsModule.default);
      if (gameRef.current) {
        gameRef.current.registry.set('directions', directionsModule.default);
      }
    };
    
    loadHeroAndDirections();

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
      }
    };
  }, [selectedTeam]);

  const handleSpeedChange = (event) => {
    const speed = event.target.value;
    let speedValue;
    switch (speed) {
      case "fast":
        speedValue = 0;
        break;
      case "normal":
        speedValue = 200;
        break;
      case "slow":
        speedValue = 400;
        break;
      default:
        return;
    }
    setSpeedGame(speedValue);
    if (gameRef.current) {
      gameRef.current.registry.set("speedGame", speedValue);
    }
  };

  const validateDirections = () => {
    const directionData = directions.Directions;
    let x = 1;
    let y = 1;

    for (let dir of directionData) {
      switch (dir) {
        case "N":
          y -= 1;
          break;
        case "S":
          y += 1;
          break;
        case "E":
          x += 1;
          break;
        case "W":
          x -= 1;
          break;
        default:
          alert("Invalid direction");
          return;
      }

      if (
        maze[y] === undefined ||
        maze[y][x] === undefined ||
        maze[y][x] === 1
      ) {
        alert("Hit a wall or out of bounds");
        return;
      }

      if (x === maze[0].length - 2 && y === maze.length - 2) {
        alert(
          `Direction is good enough to exit the maze. Current game time: ${gameTime} minutes.`
        );
        return;
      }
    }
    alert("Direction is not good enough to exit the maze.");
  };

  const handleAnimateClick = () => {
    setIsAnimating(true);
    if (gameRef.current) {
      gameRef.current.registry.set("isAnimating", true);
    }
  };

  const resetAndReloadDirections = async () => {
    setIsAnimating(false);
    setGameTime(0);
    setSpeedGame("fast");
    initializeGame(gameRef, setGameTime, speedGame, setMaze);
    
    // Load hero and directions again after reset
    const heroModule = await import(`../public/input/players/${selectedTeam}/maze_hero.json`);
      setHero(heroModule.default);
      if (gameRef.current) {
        gameRef.current.registry.set('hero', heroModule.default);
      }
      
    const directionsModule = await import(`../public/input/players/${selectedTeam}/directions.json`);
    setDirections(directionsModule.default);
    if (gameRef.current) {
      gameRef.current.registry.set('directions', directionsModule.default);
    }
  };
  

  return (
    <div>
      <div style={{ backgroundColor: "black", borderRadius: "5px" }}>
      <select 
          onChange={(e) => setSelectedTeam(e.target.value)} 
          style={{ cursor: "pointer", margin: "5px" }}
          value={selectedTeam} // Ensures the selected value is controlled
        >
          {teams.map(team => (
            <option key={team} value={team}>{team}</option>
          ))}
        </select>
        <select
          onChange={handleSpeedChange}
          style={{ cursor: "pointer", margin: "5px" }}
        >
          <option value="fast">Fast</option>
          <option value="normal">Normal</option>
          <option value="slow">Slow</option>
        </select>
        <button
          onClick={resetAndReloadDirections}
          style={{ cursor: "pointer", margin: "5px" }}
        >
          Reset
        </button>
        <button
          onClick={validateDirections}
          style={{ cursor: "pointer", margin: "5px" }}
        >
          Validate
        </button>
        <button
          onClick={handleAnimateClick}
          style={{ cursor: "pointer", margin: "5px" }}
        >
          Animate
        </button>
      </div>
      <div id="phaser-game"></div>
    </div>
  );
}

export default Game;
