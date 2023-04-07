import { MapboxSketch } from '@dalie/mapbox-sketch';
import { createContext, useContext } from 'react';

export const ReactMapboxSketchContext = createContext<{
  sketch: MapboxSketch;
} | null>(null);

export function useMapboxSketchContext() {
  const context = useContext(ReactMapboxSketchContext);

  if (!context) {
    throw new Error(
      'useMapboxSketchContext must be used within a ReactMapboxSketch component.'
    );
  }

  return context;
}
