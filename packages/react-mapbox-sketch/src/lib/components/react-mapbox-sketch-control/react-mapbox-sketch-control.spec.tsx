import { render } from '@testing-library/react';

import ReactMapboxSketchControl from './react-mapbox-sketch-control';

describe('ReactMapboxSketchControl', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ReactMapboxSketchControl />);
    expect(baseElement).toBeTruthy();
  });
});
