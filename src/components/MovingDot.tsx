import { useState } from 'react';

export const MovingDot = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  return (
    <div
      onPointerMove={(e) => {
        return setPosition({ x: e.clientX - 160, y: e.clientY - 140 });
      }}
      style={{
        position: 'relative',
        width: '100vh',
        height: '50vh',
        border: '1px solid white',
      }}
    >
      <p
        style={{
          position: 'absolute',
          backgroundColor: 'red',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          transform: `translate(${position.x}px, ${position.y}px)`,
          left: -10,
          top: -10,
        }}
      ></p>
    </div>
  );
};
