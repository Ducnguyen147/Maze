import React from 'react';
import heroData from '../public/input/maze_hero.json';

const HeroInfo = () => {
    return (
        <div style={heroInfoStyle}>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div style={{ padding: '10px' }}>
                    <h2>{heroData.Name}</h2>
                </div>
                <div style={{ padding: '10px', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '30px' }}>
                    <p>HP: {heroData.parameters.HP}</p>
                    <p>Awareness: {heroData.parameters.Awareness}</p>
                    <p>Stealth: {heroData.parameters.Stealth}</p>
                    <p>Velocity: {heroData.parameters.Velocity}</p>
                </div>
            </div>
        </div>
    );
};

const heroInfoStyle = {
    fontFamily: 'Pixel, Arial, sans-serif',
    backgroundColor: 'black',
    color: 'white',
};

export default HeroInfo;