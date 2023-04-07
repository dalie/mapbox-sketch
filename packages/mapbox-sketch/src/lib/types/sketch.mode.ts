import { FeatureCollection } from 'geojson';
import { Map } from 'mapbox-gl';
import { SketchFeature } from './SketchFeature';

export type SketchEventType =
  | 'select'
  | 'create'
  | 'update'
  | 'delete'
  | 'start'
  | 'stop';

export interface SketchEventBase {
  type: SketchEventType;
  modeId: string;
}

export interface SketchModeEvent extends SketchEventBase {
  type: 'start' | 'stop';
}

export interface SketchFeatureEvent extends SketchEventBase {
  type: 'create' | 'delete' | 'select' | 'update';
  featureId?: string | number | undefined;
  feature?: SketchFeature;
}

export type SketchEvent = SketchModeEvent | SketchFeatureEvent;

export interface SketchMode {
  id: string;
  isSketching: boolean;
  disabled: boolean;
  disable(): void;
  enable(): void;
  addListeners: () => void;
  removeListeners: () => void;
  destroy: () => void;
  onFeatureUpdate: (callback: (event: SketchEvent) => void) => void;
  setFeatures: (features: SketchFeature[]) => void;
  start: () => void;
  stop: () => void;
  getDisplayFeature: (feature: SketchFeature) => FeatureCollection;
}

export type SketchModeClass = new (map: Map) => SketchMode;
