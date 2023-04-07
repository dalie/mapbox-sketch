import {
  CircleMode,
  PolygonMode,
  SketchFeature,
  SketchModeEvent,
} from '@dalie/mapbox-sketch';
import {
  ReactMapboxSketch,
  ReactMapboxSketchControl,
} from '@dalie/react-mapbox-sketch';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useCallback, useEffect, useState } from 'react';
import { Map as ReactMap } from 'react-map-gl';

const sketchModes = [CircleMode, PolygonMode];

export function App() {
  const [features, setFeatures] = useState<SketchFeature[]>([]);
  const cachedFeatures = localStorage.getItem('features');

  useEffect(() => {
    if (cachedFeatures) {
      setFeatures(cachedFeatures ? JSON.parse(cachedFeatures) : []);
    }
  }, [cachedFeatures]);

  const handleSketchUpdate = useCallback((event: SketchModeEvent) => {
    setFeatures((oldValue) => {
      const newFeatures = [
        ...oldValue.filter(
          (feature) => feature.properties.mapbox_sketch_id !== event.featureId
        ),
      ];

      if (event.type !== 'delete' && event.feature) {
        newFeatures.push(event.feature);
      }

      localStorage.setItem('features', JSON.stringify(newFeatures));
      return newFeatures;
    });
  }, []);

  return (
    <div
      style={{
        width: '800px',
        height: '600px',
      }}
    >
      <ReactMap
        mapboxAccessToken="pk.eyJ1IjoiZG9taW5pY2FsaWUiLCJhIjoiY2tuZzJ0YWtvMDcwejJxczlwa2NtbW0zeSJ9.ire3NMM19l7z4Zeqa20RVw"
        initialViewState={{
          longitude: -74.3,
          latitude: 45.4799,
          zoom: 14,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
      >
        <ReactMapboxSketch
          features={features}
          modes={sketchModes}
          onUpdate={handleSketchUpdate}
        >
          <ReactMapboxSketchControl />
        </ReactMapboxSketch>
      </ReactMap>
    </div>
  );
}

export default App;
