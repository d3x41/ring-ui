import {render, screen} from '@testing-library/react';

import ButtonSet from './button-set';

describe('Button Set', () => {
  it('should create component', () => {
    render(<ButtonSet />);
    expect(screen.getByTestId('ring-button-set')).to.exist;
  });
});
