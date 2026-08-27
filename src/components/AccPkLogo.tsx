import React from 'react';
import accPkLogoUrl from '../assets/acc-pk-logo.png';

interface AccPkLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

// The official ACC PK logo image — not a recreation. Only ever resized here, never
// redrawn or altered (see src/assets/acc-pk-logo.png for the one edit made to the
// source file: making its solid white background transparent).
export const AccPkLogo: React.FC<AccPkLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const sizeMap = {
    sm: 56,
    md: 80,
    lg: 110,
    xl: 150,
  };

  const dimension = sizeMap[size];

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <img
        src={accPkLogoUrl}
        alt="ACC PK official logo"
        width={dimension}
        height={dimension}
        className="object-contain drop-shadow-md"
        style={{ width: dimension, height: dimension }}
      />
      {showSubtitle && (
        <span className="text-[#E53935] text-[10px] font-extrabold tracking-wide mt-0.5 uppercase">
          Anti Corruption Channel
        </span>
      )}
    </div>
  );
};
