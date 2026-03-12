import React from 'react';

const SVGFilters: React.FC = () => {
  return (
    <svg className="svg-defs" aria-hidden="true">
      <defs>
        <filter id="paper-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
          <feColorMatrix
            type="matrix"
            values="0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 0.6 0"
            in="noise"
            result="coloredNoise"
          />
          <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="composite" />
        </filter>

        <filter id="watercolor">
          <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="1" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" />
          <feGaussianBlur stdDeviation="0.4" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="1.2" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  );
};

export default SVGFilters;
