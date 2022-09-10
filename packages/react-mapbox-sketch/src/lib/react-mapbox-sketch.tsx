import { MapboxSketch } from '@dalie/mapbox-sketch';
import { Feature } from 'geojson';
import { useEffect, useMemo } from 'react';
import { useMap } from 'react-map-gl';

/* eslint-disable-next-line */
export interface ReactMapboxSketchProps {
  features: Feature[];
}

export function ReactMapboxSketch(props: ReactMapboxSketchProps) {
  const { current: map } = useMap();

  const sketch = useMemo(() => {
    if (map) {
      console.log('new sketch');
      return new MapboxSketch(map.getMap());
    } else {
      return null;
    }
  }, [map]);

  useEffect(() => {
    return () => {
      if (sketch) {
        sketch.destroy();
      }
    };
  }, [sketch]);

  useEffect(() => {
    if (sketch) {
      sketch.features = props.features;
    }
  }, [props.features, sketch]);

  return null;
}

export default ReactMapboxSketch;
