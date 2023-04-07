import { Feature, Geometry } from 'geojson';
import { FeatureProperties } from './FeatureProperties';

export type SketchFeature = Feature<Geometry, FeatureProperties>;
