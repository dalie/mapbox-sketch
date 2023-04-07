export interface FeatureProperties {
  [name: string]: unknown;
  mapbox_sketch_id?: string;
  mapbox_sketch_mode?: string;
  mapbox_sketch_state?: 'default' | 'creating' | 'editing' | 'selected';
}
