import React from 'react';
import './Dice.css';

export default function Dice({ value, rolling, color, onClick, disabled }) {
  const style = {
    backgroundColor: color,
    color: color === 'yellow' ? '#000' : '#fff',
  };

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`dice ${rolling ? 'rolling' : ''} ${!disabled && onClick ? 'clickable' : ''}`}
      style={style}
      onClick={handleClick}
    >
      {value && <span className="dice-value">{value}</span>}
    </div>
  );
}
