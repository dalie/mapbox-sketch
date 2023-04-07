import { useCallback } from 'react';
import { useMapboxSketchContext } from '../../context/react-mapbox-sketch-context';
import { SketchMode } from '@dalie/mapbox-sketch';

export function ReactMapboxSketchControl() {
  const { sketch } = useMapboxSketchContext();

  const handleModeClick = useCallback(
    (newMode: SketchMode) => {
      if (sketch) {
        if (newMode.isSketching) {
          Object.values(sketch.modes).forEach((mode) => {
            mode.stop();
            mode.enable();
          });
        } else {
          Object.values(sketch.modes).forEach((mode) => {
            if (mode.id !== newMode.id) {
              mode.disable();
            }
          });
          newMode.start();
        }
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
      {Object.values(sketch.modes).map((mode) => (
        <button
          key={mode.id}
          disabled={mode.disabled}
          style={{
            padding: '10px',
            border: 'none',
            background: 'white',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
          onClick={() => handleModeClick(mode)}
        >
          {mode.id}
        </button>
      ))}
    </div>
  );
}
