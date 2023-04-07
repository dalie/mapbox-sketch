import { useCallback, useContext } from 'react';
import {
  ReactMapboxSketchContext,
  useMapboxSketchContext,
} from '../../context/react-mapbox-sketch-context';

export function ReactMapboxSketchControl() {
  const { sketch } = useMapboxSketchContext();

  const handlePolygonClick = useCallback(() => {
    if (sketch) {
      sketch.modes['PolygonMode'].start();
    }
  }, [sketch]);

  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <button
        style={{
          padding: '10px',
          border: 'none',
          background: 'white',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
        onClick={handlePolygonClick}
      >
        Polygon
      </button>
    </div>
  );
}
