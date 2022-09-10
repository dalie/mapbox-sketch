import { Map as ReactMap } from 'react-map-gl';
import { ReactMapboxSketch } from '@mapbox-sketch/react-mapbox-sketch';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Feature } from 'geojson';
import { useEffect, useState } from 'react';

export function App() {
  const [features, setFeatures] = useState<Feature[]>([]);

  useEffect(() => {
    setFeatures([
      {
        type: 'Feature',
        properties: {
          shape: 'Polygon',
          name: 'Unnamed Layer',
          category: 'default',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-74.300324, 45.479211],
              [-74.299959, 45.472967],
              [-74.297707, 45.473058],
              [-74.288846, 45.474352],
              [-74.286315, 45.479648],
              [-74.300324, 45.479211],
            ],
          ],
        },
        id: '4b361b87-a5ae-421f-8a38-f84ea5b1a81c',
      },
      {
        type: 'Feature',
        properties: {
          shape: 'Polygon',
          name: 'Unnamed Layer',
          category: 'default',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-74.304573, 45.47697],
              [-74.307491, 45.474803],
              [-74.306376, 45.473283],
              [-74.300111, 45.474427],
              [-74.300454, 45.476744],
              [-74.304573, 45.47697],
            ],
          ],
        },
        id: '89c89e53-b4d9-4153-b2b6-889522904947',
      },
    ]);
  }, []);
  return (
    <>
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
        <ReactMapboxSketch features={features} />
      </ReactMap>

      <div />
    </>
  );
}

export default App;
