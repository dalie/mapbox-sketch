import styles from './react-mapbox-sketch.module.scss';

/* eslint-disable-next-line */
export interface ReactMapboxSketchProps {}

export function ReactMapboxSketch(props: ReactMapboxSketchProps) {
  return (
    <div className={styles['container']}>
      <h1>ReactMapboxSketch!</h1>
    </div>
  );
}

export default ReactMapboxSketch;
