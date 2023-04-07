import { Map } from 'mapbox-gl';
import { SketchFeature } from './types';
import { SketchEvent, SketchMode, SketchModeClass } from './types/sketch.mode';

export class MapboxSketch {
  private _modes: Record<string, SketchMode> = {};

  get modes() {
    return this._modes;
  }

  constructor(map: Map, modes: SketchModeClass[]) {
    for (const mode of modes) {
      const m = new mode(map);
      this._modes[m.id] = m;
      m.enable();
      m.onFeatureUpdate((event) => {
        if (event.type === 'start') {
          Object.values(this._modes).forEach((mode) => {
            if (mode.isSketching && mode.id !== m.id) {
              mode.stop();
              mode.disable();
            }
          });
        }
        if (event.type === 'stop') {
          Object.values(this._modes).forEach((mode) => {
            mode.enable();
          });
        }
      });
    }
  }

  destroy() {
    Object.values(this._modes).forEach((mode) => mode.destroy());
  }

  onFeatureUpdate(callback: (event: SketchEvent) => void) {
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
