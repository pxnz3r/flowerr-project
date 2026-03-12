import React from 'react';

interface UILayerProps {
  showPoem: boolean;
}

const UILayer: React.FC<UILayerProps> = ({ showPoem }) => {
  return (
    <div className="ui-layer">
      <div className="title-block">
        <h1>Organic Flow</h1>
      </div>
      <div className={`meta-data ${showPoem ? 'visible' : ''}`} id="poemText">
        Like wild flowers<br />
        reaching for the sun,<br />
        I grow toward you,<br />
        rooted in love,<br />
        blooming endlessly.
      </div>
    </div>
  );
};

export default UILayer;
