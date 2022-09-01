import { render } from '@testing-library/react';

import ReactMapboxSketch from './react-mapbox-sketch';

describe('ReactMapboxSketch', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ReactMapboxSketch />);
    expect(baseElement).toBeTruthy();
  });
});
