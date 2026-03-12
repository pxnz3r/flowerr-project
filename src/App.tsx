import { useState } from 'react';
import SVGFilters from './components/SVGFilters';
import PaperTexture from './components/PaperTexture';
import GenerativeArt from './components/GenerativeArt';
import UILayer from './components/UILayer';

function App() {
  const [showPoem, setShowPoem] = useState(false);

  return (
    <>
      <SVGFilters />
      <PaperTexture />
      <GenerativeArt onComplete={() => setShowPoem(true)} />
      <UILayer showPoem={showPoem} />
    </>
  );
}

export default App;
