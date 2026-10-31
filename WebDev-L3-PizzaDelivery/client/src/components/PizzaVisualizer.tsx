import React from 'react';

interface PizzaVisualizerProps {
  baseName?: string;
  sauceName?: string;
  cheeseName?: string;
  veggieNames?: string[];
  size?: 'sm' | 'md' | 'lg';
}

export const PizzaVisualizer: React.FC<PizzaVisualizerProps> = ({
  baseName = 'Classic Hand-Tossed',
  sauceName = 'Zesty San Marzano Marinara',
  cheeseName = 'Whole Milk Mozzarella',
  veggieNames = [],
  size = 'lg',
}) => {
  // Base Crust Styling
  const getCrustColors = () => {
    if (baseName.includes('Whole Wheat')) {
      return { outer: '#8b5a2b', crust: '#a06535', inner: '#c68b59' };
    }
    if (baseName.includes('Thin Crust')) {
      return { outer: '#b8860b', crust: '#c8963e', inner: '#deb887' };
    }
    if (baseName.includes('Cauliflower')) {
      return { outer: '#d3c299', crust: '#e2d5b5', inner: '#f3ebd4' };
    }
    if (baseName.includes('Cheese Burst')) {
      return { outer: '#d97706', crust: '#f59e0b', inner: '#fbbf24' };
    }
    // Default Classic Hand-Tossed
    return { outer: '#b45309', crust: '#d97706', inner: '#fde68a' };
  };

  // Sauce Color
  const getSauceColor = () => {
    if (sauceName.includes('Alfredo')) return '#fef3c7'; // Creamy White
    if (sauceName.includes('BBQ')) return '#7c2d12'; // Dark Smoky Brown
    if (sauceName.includes('Pesto')) return '#3f6212'; // Deep Basil Green
    if (sauceName.includes('Peri-Peri')) return '#ea580c'; // Fiery Orange-Red
    return '#dc2626'; // San Marzano Deep Red
  };

  // Cheese Color & Texture
  const getCheeseColors = () => {
    if (cheeseName.includes('Cheddar')) {
      return { base: '#f59e0b', spots: '#d97706' };
    }
    if (cheeseName.includes('Bocconcini')) {
      return { base: '#fef08a', spots: '#ffffff' };
    }
    if (cheeseName.includes('Vegan')) {
      return { base: '#fef9c3', spots: '#fde047' };
    }
    // Default Mozzarella
    return { base: '#fef3c7', spots: '#fde68a' };
  };

  const crustColors = getCrustColors();
  const sauceColor = getSauceColor();
  const cheeseColors = getCheeseColors();

  const dimensions = {
    sm: 'w-48 h-48',
    md: 'w-64 h-64',
    lg: 'w-80 h-80 max-w-full',
  }[size];

  // Helper arrays for veggie placement in concentric rings
  const positionsRing1 = [
    { x: 100, y: 70 },
    { x: 130, y: 100 },
    { x: 100, y: 130 },
    { x: 70, y: 100 },
  ];

  const positionsRing2 = [
    { x: 100, y: 45 },
    { x: 140, y: 60 },
    { x: 155, y: 100 },
    { x: 140, y: 140 },
    { x: 100, y: 155 },
    { x: 60, y: 140 },
    { x: 45, y: 100 },
    { x: 60, y: 60 },
  ];

  return (
    <div className={`relative flex items-center justify-center ${dimensions} mx-auto select-none group`}>
      {/* Wood Peel Platform background glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#38251F]/10 via-[#D97706]/10 to-[#D92D20]/10 blur-xl group-hover:scale-105 transition-transform duration-700"></div>

      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-[0_15px_25px_rgba(56,37,31,0.2)] transition-transform duration-500 hover:rotate-3"
      >
        <defs>
          {/* Crust outer radial gradient */}
          <radialGradient id="crustGrad" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor={crustColors.inner} />
            <stop offset="90%" stopColor={crustColors.crust} />
            <stop offset="100%" stopColor={crustColors.outer} />
          </radialGradient>

          {/* Cheese melt pattern */}
          <radialGradient id="cheeseGrad" cx="45%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="60%" stopColor={cheeseColors.base} stopOpacity="0.95" />
            <stop offset="100%" stopColor={cheeseColors.spots} stopOpacity="0.85" />
          </radialGradient>

          {/* Filter for subtle texture */}
          <filter id="blister">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {/* 1. Base Crust Layer */}
        <circle cx="100" cy="100" r="92" fill="url(#crustGrad)" stroke={crustColors.outer} strokeWidth="3" />

        {/* Oven charred edge blisters */}
        <ellipse cx="100" cy="12" rx="14" ry="4" fill="#451a03" opacity="0.6" transform="rotate(-15 100 12)" />
        <ellipse cx="180" cy="80" rx="12" ry="5" fill="#451a03" opacity="0.6" transform="rotate(35 180 80)" />
        <ellipse cx="120" cy="188" rx="16" ry="4" fill="#451a03" opacity="0.6" transform="rotate(-5 120 188)" />
        <ellipse cx="20" cy="120" rx="14" ry="4" fill="#451a03" opacity="0.6" transform="rotate(-40 20 120)" />

        {/* 2. Sauce Layer */}
        <circle cx="100" cy="100" r="76" fill={sauceColor} opacity="0.9" />

        {/* Sauce swirls */}
        <path
          d="M 60 100 Q 100 60 140 100 T 100 140"
          fill="none"
          stroke="#991b1b"
          strokeWidth="4"
          opacity="0.25"
        />

        {/* 3. Melted Cheese Layer */}
        <circle cx="100" cy="100" r="72" fill="url(#cheeseGrad)" />

        {/* Golden toasted cheese spots */}
        <circle cx="85" cy="80" r="8" fill="#d97706" opacity="0.4" />
        <circle cx="120" cy="95" r="10" fill="#d97706" opacity="0.35" />
        <circle cx="100" cy="125" r="9" fill="#d97706" opacity="0.4" />
        <circle cx="75" cy="115" r="7" fill="#d97706" opacity="0.3" />
        <circle cx="125" cy="65" r="6" fill="#d97706" opacity="0.35" />

        {/* 4. Vegetable Toppings Layers */}
        {veggieNames.map((veg) => {
          // Roasted Bell Peppers
          if (veg.includes('Bell Peppers')) {
            return (
              <g key="peppers">
                {[...positionsRing1, ...positionsRing2.slice(0, 4)].map((pos, i) => (
                  <path
                    key={`pepper-${i}`}
                    d={`M ${pos.x - 7} ${pos.y - 4} Q ${pos.x} ${pos.y + 8} ${pos.x + 8} ${pos.y - 2}`}
                    fill="none"
                    stroke={i % 2 === 0 ? '#16a34a' : '#dc2626'}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    transform={`rotate(${i * 45} ${pos.x} ${pos.y})`}
                  />
                ))}
              </g>
            );
          }

          // Cremini Mushrooms
          if (veg.includes('Mushrooms')) {
            return (
              <g key="mushrooms">
                {positionsRing2.map((pos, i) => (
                  <g key={`mushroom-${i}`} transform={`translate(${pos.x - 6}, ${pos.y - 6}) rotate(${i * 35})`}>
                    <path d="M 2 8 C 2 3, 10 3, 10 8 Z" fill="#78350f" />
                    <rect x="5" y="8" width="2.5" height="4" fill="#d6d3d1" rx="1" />
                  </g>
                ))}
              </g>
            );
          }

          // Kalamata Black Olives
          if (veg.includes('Olives')) {
            return (
              <g key="olives">
                {[...positionsRing1, ...positionsRing2.slice(2, 6)].map((pos, i) => (
                  <g key={`olive-${i}`} transform={`translate(${pos.x - 5}, ${pos.y - 5})`}>
                    <circle cx="5" cy="5" r="4.5" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
                    <circle cx="5" cy="5" r="2.2" fill={sauceColor} />
                  </g>
                ))}
              </g>
            );
          }

          // Pickled Jalapeños
          if (veg.includes('Jalapeños') || veg.includes('Jalapenos')) {
            return (
              <g key="jalapenos">
                {positionsRing1.map((pos, i) => (
                  <g key={`jalapeno-${i}`} transform={`translate(${pos.x - 6}, ${pos.y - 6})`}>
                    <circle cx="6" cy="6" r="5" fill="#15803d" stroke="#166534" strokeWidth="1.5" />
                    <circle cx="6" cy="6" r="2.5" fill={cheeseColors.base} />
                    <circle cx="5" cy="5" r="0.8" fill="#fef08a" />
                  </g>
                ))}
              </g>
            );
          }

          // Sweet Golden Corn
          if (veg.includes('Corn')) {
            return (
              <g key="corn">
                {[...positionsRing1, ...positionsRing2].map((pos, i) => (
                  <g key={`corn-${i}`}>
                    <ellipse cx={pos.x + 3} cy={pos.y - 2} rx="2" ry="1.4" fill="#eab308" stroke="#ca8a04" strokeWidth="0.5" />
                    <ellipse cx={pos.x - 2} cy={pos.y + 3} rx="2" ry="1.4" fill="#facc15" stroke="#ca8a04" strokeWidth="0.5" />
                  </g>
                ))}
              </g>
            );
          }

          // Fresh Baby Spinach
          if (veg.includes('Spinach')) {
            return (
              <g key="spinach">
                {positionsRing2.slice(0, 5).map((pos, i) => (
                  <path
                    key={`spinach-${i}`}
                    d={`M ${pos.x} ${pos.y} Q ${pos.x + 8} ${pos.y - 7} ${pos.x + 14} ${pos.y} Q ${pos.x + 7} ${pos.y + 6} ${pos.x} ${pos.y}`}
                    fill="#15803d"
                    opacity="0.85"
                    transform={`rotate(${i * 70} ${pos.x} ${pos.y})`}
                  />
                ))}
              </g>
            );
          }

          // Sun-dried Tomatoes
          if (veg.includes('Sun-dried')) {
            return (
              <g key="sundried">
                {positionsRing1.map((pos, i) => (
                  <rect
                    key={`sundried-${i}`}
                    x={pos.x - 5}
                    y={pos.y - 3}
                    width="10"
                    height="4"
                    rx="1.5"
                    fill="#991b1b"
                    stroke="#7f1d1d"
                    strokeWidth="0.8"
                    transform={`rotate(${i * 60 + 20} ${pos.x} ${pos.y})`}
                  />
                ))}
              </g>
            );
          }

          // Herbed Paneer Cubes
          if (veg.includes('Paneer')) {
            return (
              <g key="paneer">
                {positionsRing2.slice(1, 6).map((pos, i) => (
                  <g key={`paneer-${i}`} transform={`translate(${pos.x - 5}, ${pos.y - 5}) rotate(${i * 25})`}>
                    <rect x="0" y="0" width="9" height="9" rx="1.5" fill="#fefce8" stroke="#ca8a04" strokeWidth="1" />
                    <circle cx="2.5" cy="3" r="0.7" fill="#15803d" />
                    <circle cx="6" cy="6" r="0.7" fill="#b91c1c" />
                  </g>
                ))}
              </g>
            );
          }

          // Caramelized Onions
          if (veg.includes('Onion')) {
            return (
              <g key="onions">
                {positionsRing2.map((pos, i) => (
                  <path
                    key={`onion-${i}`}
                    d={`M ${pos.x - 6} ${pos.y} C ${pos.x - 2} ${pos.y - 6}, ${pos.x + 4} ${pos.y - 6}, ${pos.x + 8} ${pos.y}`}
                    fill="none"
                    stroke="#831843"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.8"
                    transform={`rotate(${i * 50} ${pos.x} ${pos.y})`}
                  />
                ))}
              </g>
            );
          }

          return null;
        })}

        {/* Subtle slice guide lines */}
        <path d="M 100 24 L 100 176" stroke="#451a03" strokeWidth="0.7" strokeDasharray="3 3" opacity="0.2" />
        <path d="M 24 100 L 176 100" stroke="#451a03" strokeWidth="0.7" strokeDasharray="3 3" opacity="0.2" />
      </svg>
    </div>
  );
};
