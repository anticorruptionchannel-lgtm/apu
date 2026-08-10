import React from 'react';

interface AccPkLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const AccPkLogo: React.FC<AccPkLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const sizeMap = {
    sm: { width: 140, height: 60 },
    md: { width: 220, height: 95 },
    lg: { width: 300, height: 130 },
    xl: { width: 400, height: 170 },
  };

  const { width, height } = sizeMap[size];

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 320 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-md"
      >
        {/* Outer Red 'A' Shape */}
        <polygon points="110,10 160,10 205,100 170,100 156,70 114,70 100,100 65,100" fill="#E53935" />
        {/* Inner white cutout for A */}
        <polygon points="135,28 150,60 120,60" fill="#FFFFFF" />
        
        {/* Crescent and Star inside lower center of A */}
        <path
          d="M138,54 A10,10 0 1,0 148,42 A8,8 0 1,1 138,54 Z"
          fill="#0a0a0c"
        />
        {/* Star */}
        <polygon
          points="148,44 149.5,47 153,47.5 150.5,50 151,53.5 148,52 145,53.5 145.5,50 143,47.5 146.5,47"
          fill="#0a0a0c"
        />

        {/* Vertical Text "CRUSH CORRUPTION" on Left Leg of A */}
        <g transform="translate(85, 92) rotate(-64)">
          <text
            x="0"
            y="0"
            fill="#FFFFFF"
            fontSize="8"
            fontWeight="bold"
            fontFamily="sans-serif"
            letterSpacing="1"
          >
            CRUSH CORRUPTION
          </text>
        </g>

        {/* Subtitle Under A: ANTI CORRUPTION CHANNEL */}
        {showSubtitle && (
          <text
            x="135"
            y="112"
            textAnchor="middle"
            fill="#E53935"
            fontSize="10"
            fontWeight="800"
            fontFamily="sans-serif"
            letterSpacing="0.5"
          >
            ANTI CORRUPTION CHANNEL
          </text>
        )}

        {/* YouTube Play Icon + ACC PK */}
        <g transform="translate(75, 118)">
          {/* Red YouTube Button */}
          <rect x="0" y="0" width="28" height="18" rx="4" fill="#E53935" />
          {/* White Play Triangle */}
          <polygon points="11,5 11,13 19,9" fill="#FFFFFF" />
          {/* Text ACC PK */}
          <text
            x="36"
            y="14"
            fill="#FFFFFF"
            fontSize="16"
            fontWeight="900"
            fontFamily="sans-serif"
            letterSpacing="1"
          >
            ACC PK
          </text>
        </g>
      </svg>
    </div>
  );
};
