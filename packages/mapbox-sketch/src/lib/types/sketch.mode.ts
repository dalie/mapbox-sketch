import { FeatureCollection } from 'geojson';
import { Map } from 'mapbox-gl';
import { SketchFeature } from './SketchFeature';

export type SketchModeEventType = 'select' | 'create' | 'update' | 'delete';

export interface SketchModeEvent {
  type: SketchModeEventType;
  modeId: string;
  featureId: string | number | undefined;
  feature?: SketchFeature;
}

export interface SketchMode {
  id: string;
  destroy: () => void;
  onFeatureUpdate: (callback: (event: SketchModeEvent) => void) => void;
  setFeatures: (features: SketchFeature[]) => void;
  start: () => void;
  stop: () => void;
  getDisplayFeature: (feature: SketchFeature) => FeatureCollection;
}

export type SketchModeClass = new (map: Map) => SketchMode;
