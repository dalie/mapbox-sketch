import { Map } from 'mapbox-gl';
import {
  SketchMode,
  SketchModeClass,
  SketchModeEvent,
} from './modes/sketch.mode';
import { SketchFeature } from './types';

export class MapboxSketch {
  private _modes: Record<string, SketchMode> = {};

  get modes() {
    return this._modes;
  }

  constructor(map: Map, modes: SketchModeClass[]) {
    for (const mode of modes) {
      const m = new mode(map);
      this._modes[m.id] = m;
    }
  }

  destroy() {
    Object.values(this._modes).forEach((mode) => mode.destroy());
  }

  onFeatureUpdate(callback: (event: SketchModeEvent) => void) {
    Object.values(this._modes).forEach((mode) =>
      mode.onFeatureUpdate(callback)
    );
  }

  setFeatures(features: SketchFeature[]) {
    Object.values(this._modes).forEach((mode) =>
      mode.setFeatures(
        features.filter(
          (feature) => feature.properties.mapbox_sketch_mode === mode.id
        )
      )
    );
  }
}
