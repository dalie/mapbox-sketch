import { featureCollection } from '@turf/turf';
import { Feature, FeatureCollection } from 'geojson';
import { GeoJSONSource, Map } from 'mapbox-gl';
import { SketchFeature } from '../types';
import { SketchEvent } from '../types/sketch.mode';

interface BaseModeOptions {
  layerType?: mapboxgl.AnyLayer['type'];
  layerPaint?: mapboxgl.AnyPaint;
  editLayerPaint?: mapboxgl.AnyPaint;
}

export class BaseMode {
  protected _disabled = false;
  protected _isSketching = false;
  protected _eventHandlers: ((event: SketchEvent) => void)[] = [];
  protected _features: SketchFeature[] = [];

  get id() {
    return this._id;
  }

  get disabled() {
    return this._disabled;
  }

  get isSketching() {
    return this._isSketching;
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

  /**
   * Initialize the source and layer for the mode.
   */
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: mergedOptions.layerType as any,
        source: this.sourceId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  addListeners() {
    //implemented in child classes
  }

  removeListeners() {
    //implemented in child classes
  }

  /**
   * Calls stop and removes the source and layers.
   */
  destroy() {
    this.stop();
    if (this._map.getLayer(this.layerId)) {
      this._map.removeLayer(this.layerId);
      this._map.removeLayer(this.editLayerId);
      this._map.removeSource(this.sourceId);
    }
  }

  disable() {
    this._disabled = true;
    this.removeListeners();
  }

  enable() {
    this._disabled = false;
    this.addListeners();
  }

  /**
   * Returns a FeatureCollection with all features.
   */
  getDisplayFeatures(features: SketchFeature[]): FeatureCollection {
    const featureCollections = features.map(
      (feature) => this.getDisplayFeature(feature).features
    );

    return featureCollection(featureCollections.flat(1) as Feature[]);
  }

  /**
   * Returns a FeatureCollection with a single feature.
   */
  getDisplayFeature(feature: SketchFeature): FeatureCollection {
    return {
      type: 'FeatureCollection',
      features: [feature],
    };
  }

  /**
   * Calls all event handlers.
   */
  onFeatureUpdate(callback: (event: SketchEvent) => void) {
    this._eventHandlers.push(callback);
  }

  /**
   * Sets the features and updates the source.
   */
  setFeatures(features: SketchFeature[]) {
    this._features = features;
    this.source.setData(this.getDisplayFeatures(features));
  }

  /**
   * Toggles _isSketching and calls start or stop.
   */
  start() {
    this._isSketching = !this._isSketching;
    if (!this._isSketching) {
      return this.stop();
    }

    this._eventHandlers.forEach((handler) =>
      handler({
        type: 'start',
        modeId: this._id,
      })
    );
  }

  /**
   * Sets _isSketching to false.
   */
  stop() {
    if (this._isSketching) {
      this._eventHandlers.forEach((handler) =>
        handler({
          type: 'stop',
          modeId: this._id,
        })
      );
    }
    this._isSketching = false;
  }
}
