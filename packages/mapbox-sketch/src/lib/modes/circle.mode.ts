import { Position, featureCollection, point } from '@turf/turf';
import { Feature, FeatureCollection } from 'geojson';
import { Map } from 'mapbox-gl';
import { SketchFeature } from '../types/SketchFeature';
import { SketchMode } from '../types/sketch.mode';
import { BaseMode } from './base.mode';

export class CircleMode extends BaseMode implements SketchMode {
  private _hoveredFeatureId: string | number | undefined = undefined;

  constructor(map: Map) {
    super('CircleMode', map, {
      layerType: 'circle',
      layerPaint: {
        'circle-color': 'rgba(0, 0, 0, 0.1)',
        'circle-radius': 5,
      },
    });

    this._map.on('mousemove', this.layerId, this._onHover);
    this._map.on('mouseleave', this.layerId, this._onLayerLeave);
    this._map.on('click', this.layerId, this._onFeatureClick);
  }

  override destroy() {
    this._map.off('mousemove', this.layerId, this._onHover);
    this._map.off('mouseleave', this.layerId, this._onLayerLeave);
    this._map.off('click', this.layerId, this._onFeatureClick);

    super.destroy();
  }

  override start() {
    super.start();

    if (this._map.getCanvas()) {
      this._map.getCanvas().style.cursor = 'crosshair';
    }
    this._map.on('click', this._onCreate);
  }

  override stop() {
    if (this._map.getCanvas()) {
      this._map.getCanvas().style.cursor = '';
    }
    this._map.off('click', this._onCreate);

    super.stop();
  }

  override getDisplayFeatures(features: SketchFeature[]): FeatureCollection {
    const featureCollections = features.map(
      (feature) => this.getDisplayFeature(feature).features
    );

    return featureCollection(featureCollections.flat(1) as Feature[]);
  }

  override getDisplayFeature(feature: SketchFeature): FeatureCollection {
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
