import {
  MapboxSketch,
  SketchFeature,
  SketchModeClass,
  SketchModeEvent,
} from '@dalie/mapbox-sketch';
import { PropsWithChildren, useEffect, useState } from 'react';
import { useMap } from 'react-map-gl';
import { ReactMapboxSketchContext } from '../../context/react-mapbox-sketch-context';

/* eslint-disable-next-line */
export interface ReactMapboxSketchProps extends PropsWithChildren {
  features: SketchFeature[];
  modes: SketchModeClass[];
  onUpdate?: (event: SketchModeEvent) => void;
}

export function ReactMapboxSketch({
  children,
  features,
  modes,
  onUpdate,
}: ReactMapboxSketchProps) {
  const { current: map } = useMap();
  const [sketch, setSketch] = useState<MapboxSketch | null>(null);

  useEffect(() => {
    return () => {
      if (sketch) {
        sketch.destroy();
        setSketch(null);
      }
    };
  }, [sketch]);

  if (!map) {
    return null;
  }

  const initSketch = () => {
    setSketch((oldValue) => {
      if (oldValue) {
        oldValue.destroy();
      }

      const sketch = new MapboxSketch(map.getMap(), modes);
      if (onUpdate) {
        sketch.onFeatureUpdate(onUpdate);
      }

      sketch.setFeatures(features as SketchFeature[]);
      return sketch;
    });
  };

  if (!sketch) {
    if (map.isStyleLoaded()) {
      initSketch();
    } else {
      map.once('styledata', () => {
        initSketch();
      });
    }
  }

  if (!sketch) {
    return null;
  }

  sketch.setFeatures(features);
  return (
    <ReactMapboxSketchContext.Provider value={{ sketch }}>
      {children}
    </ReactMapboxSketchContext.Provider>
  );
}

export default ReactMapboxSketch;
