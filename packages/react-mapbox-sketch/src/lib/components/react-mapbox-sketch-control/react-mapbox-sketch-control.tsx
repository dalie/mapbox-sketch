import { useCallback } from 'react';
import { useMapboxSketchContext } from '../../context/react-mapbox-sketch-context';

export function ReactMapboxSketchControl() {
  const { sketch } = useMapboxSketchContext();

  const handleModeClick = useCallback(
    (modeId: string) => {
      if (sketch) {
        sketch.modes[modeId].start();
      }
    },
    [sketch]
  );

  if (!sketch) {
    return null;
  }

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
      {Object.keys(sketch.modes).map((modeId) => (
        <button
          key={modeId}
          style={{
            padding: '10px',
            border: 'none',
            background: 'white',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
          onClick={() => handleModeClick(modeId)}
        >
          {modeId}
        </button>
      ))}
    </div>
  );
}
