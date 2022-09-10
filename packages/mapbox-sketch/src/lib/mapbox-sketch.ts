import { FillLayer, GeoJSONSource, Map, MapboxGeoJSONFeature } from 'mapbox-gl';
import { Feature, FeatureCollection, Polygon } from 'geojson';

export class MapboxSketch {
  private _selectedFeature: MapboxGeoJSONFeature | null = null;
  private _hoveredFeature: MapboxGeoJSONFeature | null = null;

  private _features: FeatureCollection = {
    type: 'FeatureCollection',
    features: [],
  };

  private get _source() {
    return this._map.getSource('mapbox_sketch_source') as GeoJSONSource;
  }

  private get _layer() {
    return this._map.getLayer('mapbox_sketch_polygons') as FillLayer;
  }

  get features() {
    return this._features.features;
  }

  set features(features: Feature[]) {
    this._features.features = features;

    this._source?.setData(this._features);
  }

  constructor(private _map: Map) {
    if (!_map.loaded()) {
      _map.once('load', () => {
        this.init();
      });
    } else {
      this.init();
    }
  }

  private init() {
    if (!this._source) {
      this._map.addSource('mapbox_sketch_source', {
        type: 'geojson',
        data: this._features,
        generateId: true,
      });
    }

    if (!this._layer) {
      this._map.addLayer({
        id: 'mapbox_sketch_polygons',
        type: 'fill',
        source: 'mapbox_sketch_source',
        paint: {
          'fill-color': '#66bbcc',
          'fill-opacity': 0.25,
        },
      });

      this._map.addLayer({
        id: 'mapbox_sketch_outline',
        type: 'line',
        source: 'mapbox_sketch_source',
        paint: {
          'line-color': '#66bbcc',
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            4,
            2,
          ],
        },
      });

      this._map.addLayer({
        id: 'mapbox_sketch_edit_polygons',
        type: 'fill',
        source: 'mapbox_sketch_source',
        paint: {
          'fill-color': '#ffc300',
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'edit'], false],
            0.25,
            0,
          ],
        },
      });
    }

    this._map.once('idle', () => {
      this._source?.setData(this._features);
    });

    this._map.on('mousemove', this._layer.id, (event) => {
      const feature = event.features?.length ? event.features[0] : null;

      if (!feature) {
        if (this._hoveredFeature) {
          this._map.setFeatureState(this._hoveredFeature, { hover: false });
        }
        this._hoveredFeature = null;
      } else {
        this._map.setFeatureState(feature, { hover: true });
        this._hoveredFeature = feature;
      }
    });

    this._map.on('mouseleave', this._layer.id, () => {
      if (this._hoveredFeature) {
        this._map.setFeatureState(this._hoveredFeature, { hover: false });
        this._hoveredFeature = null;
      }
    });

    this._map.on('click', (event) => {
      const features = this._map.queryRenderedFeatures(event.point, {
        layers: ['mapbox_sketch_polygons'],
      });
      this.setSelectedFeature(features?.length ? features[0] : null);
    });
  }

  addPolygon(feature: Feature<Polygon>) {
    console.log(feature);
  }

  destroy() {
    if (this._layer) {
      this._map.removeLayer('mapbox_sketch_polygons');
    }

    if (this._source) {
      this._map.removeSource('mapbox_sketch_source');
    }
  }

  setSelectedFeature(feature: MapboxGeoJSONFeature | null) {
    if (!feature) {
      if (this._selectedFeature) {
        this._map.setFeatureState(this._selectedFeature, { edit: false });
        this._selectedFeature = null;
      }
    } else {
      if (this._selectedFeature && feature.id !== this._selectedFeature.id) {
        this._map.setFeatureState(this._selectedFeature, { edit: false });
      }

      this._map.setFeatureState(feature, { edit: true });

      this._selectedFeature = feature;
    }
  }
}
