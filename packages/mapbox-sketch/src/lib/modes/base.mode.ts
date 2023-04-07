import { GeoJSONSource, Map } from 'mapbox-gl';
import { SketchMode, SketchModeEvent } from '../types/sketch.mode';
import { SketchFeature } from '../types';
import { Feature, FeatureCollection } from 'geojson';
import { featureCollection } from '@turf/turf';

interface BaseModeOptions {
  layerType?: mapboxgl.AnyLayer['type'];
  layerPaint?: mapboxgl.AnyPaint;
  editLayerPaint?: mapboxgl.AnyPaint;
}

export class BaseMode implements SketchMode {
  protected _isSketching = false;
  protected _eventHandlers: ((event: SketchModeEvent) => void)[] = [];
  protected _features: SketchFeature[] = [];

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

  constructor(
    private _id: string,
    protected _map: Map,
    options?: BaseModeOptions
  ) {
    const defaultOptions: BaseModeOptions = {
      layerType: 'circle',
      layerPaint: {
        'circle-radius': 30,
        'circle-color': '#ff0000',
        'circle-stroke-width': 2,
        'circle-stroke-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          1,
          0,
        ],
      },
      editLayerPaint: {
        'fill-color': '#00c3ff',
        'fill-opacity': [
          'case',
          ['==', ['get', 'mapbox_sketch_mode'], this._id],
          0.25,
          0,
        ],
      },
    };

    const mergedOptions = { ...defaultOptions, ...options };

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
        type: mergedOptions.layerType as any,
        source: this.sourceId,
        paint: mergedOptions.layerPaint as any,
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
    }
  }

  destroy() {
    this.stop();
    if (this._map.getLayer(this.layerId)) {
      this._map.removeLayer(this.layerId);
      this._map.removeLayer(this.editLayerId);
      this._map.removeSource(this.sourceId);
    }
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
  }

  stop() {
    this._isSketching = false;
  }
}
