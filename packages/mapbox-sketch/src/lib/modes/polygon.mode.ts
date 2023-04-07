import { Position, featureCollection, point } from '@turf/turf';
import { Feature, FeatureCollection } from 'geojson';
import { GeoJSONSource, Map } from 'mapbox-gl';
import { SketchFeature } from '../types/SketchFeature';
import { SketchMode, SketchModeEvent } from './sketch.mode';

export class PolygonMode implements SketchMode {
  private _id = 'PolygonMode';
  private _isSketching = false;
  private _features: SketchFeature[] = [];
  private _hoveredFeatureId: string | number | undefined = undefined;
  private _eventHandlers: ((event: SketchModeEvent) => void)[] = [];

  get id() {
    return this._id;
  }

  get sourceId() {
    return `mapbox_sketch_${this._id}_source`;
  }

  get layerId() {
    return `mapbox_sketch_${this._id}_layer`;
  }

  get editLayerId() {
    return `mapbox_sketch_${this._id}_edit_layer`;
  }

  get source() {
    return this._map.getSource(this.sourceId) as GeoJSONSource;
  }

  constructor(private _map: Map) {
    if (!this.source) {
      this._map.addSource(this.sourceId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
        promoteId: 'mapbox_sketch_id',
      });

      this._map.addLayer({
        id: this.layerId,
        type: 'circle',
        source: this.sourceId,
        paint: {
          'circle-radius': 30,
          'circle-color': '#00c3ff',
          'circle-stroke-width': 2,
          'circle-stroke-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            1,
            0,
          ],
        },
      });

      this._map.addLayer({
        id: this.editLayerId,
        type: 'fill',
        source: this.sourceId,
        paint: {
          'fill-color': '#00c3ff',
          'fill-opacity': [
            'case',
            ['==', ['get', 'mapbox_sketch_mode'], this._id],
            0.25,
            0,
          ],
        },
      });

      this._map.on('mousemove', this.layerId, this._onHover);
      this._map.on('mouseleave', this.layerId, this._onLayerLeave);
      this._map.on('click', this.layerId, this._onFeatureClick);
    }
  }

  destroy() {
    this.stop();
    if (this._map.getLayer(this.layerId)) {
      this._map.off('mousemove', this.layerId, this._onHover);
      this._map.off('mouseleave', this.layerId, this._onLayerLeave);
      this._map.off('click', this.layerId, this._onFeatureClick);

      this._map.removeLayer(this.layerId);
      this._map.removeLayer(this.editLayerId);
      this._map.removeSource(this.sourceId);
    }
  }

  onFeatureUpdate(callback: (event: SketchModeEvent) => void) {
    this._eventHandlers.push(callback);
  }

  setFeatures(features: SketchFeature[]) {
    this._features = features;
    this.source.setData(this.getDisplayFeatures(features));
  }

  start() {
    this._isSketching = !this._isSketching;
    if (!this._isSketching) {
      return this.stop();
    }

    if (this._map.getCanvas()) {
      this._map.getCanvas().style.cursor = 'crosshair';
    }
    this._map.on('click', this._onCreate);
  }

  stop() {
    this._isSketching = false;
    if (this._map.getCanvas()) {
      this._map.getCanvas().style.cursor = '';
    }
    this._map.off('click', this._onCreate);
  }

  getDisplayFeatures(features: SketchFeature[]): FeatureCollection {
    const featureCollections = features.map(
      (feature) => this.getDisplayFeature(feature).features
    );

    return featureCollection(featureCollections.flat(1) as Feature[]);
  }

  getDisplayFeature(feature: SketchFeature): FeatureCollection {
    return {
      type: 'FeatureCollection',
      features: [feature],
    };
  }

  private _onCreate = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
    const coordinates = e.lngLat.toArray() as Position;
    const feature = point(coordinates) as SketchFeature;
    feature.properties.mapbox_sketch_id = crypto.randomUUID();
    feature.properties.mapbox_sketch_mode = this.id;
    feature.properties.mapbox_sketch_state = 'default';

    this._eventHandlers.forEach((callback) =>
      callback({
        type: 'create',
        modeId: this.id,
        featureId: feature.properties.mapbox_sketch_id,
        feature,
      })
    );

    this._features.push(feature);
    this.source.setData(this.getDisplayFeatures(this._features));
    this.stop();
  };

  private _onHover = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
    const features = e['features'] as SketchFeature[];
    if (features.length > 0) {
      if (this._hoveredFeatureId !== undefined) {
        if (this._hoveredFeatureId === features[0].id) {
          return;
        }

        this._map.setFeatureState(
          {
            source: this.sourceId,
            id: this._hoveredFeatureId,
          },
          { hover: false }
        );
      }

      this._hoveredFeatureId = features[0].id;
      this._map.setFeatureState(
        {
          source: this.sourceId,
          id: this._hoveredFeatureId,
        },
        { hover: true }
      );
    }
  };

  private _onLayerLeave = () => {
    if (this._hoveredFeatureId !== undefined) {
      this._map.setFeatureState(
        {
          source: this.sourceId,
          id: this._hoveredFeatureId,
        },
        { hover: false }
      );
    }
    this._hoveredFeatureId = undefined;
  };

  private _onFeatureClick = (
    e: mapboxgl.MapMouseEvent & mapboxgl.EventData
  ) => {
    const features = e['features'] as SketchFeature[];
    if (features.length > 0) {
      this._eventHandlers.forEach((callback) =>
        callback({
          type: 'delete',
          modeId: this.id,
          featureId: features[0].properties.mapbox_sketch_id,
        })
      );
    }
  };
}
