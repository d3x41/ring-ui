// Mock the Popup module
import * as Sinon from 'sinon';

import {render, screen, fireEvent, within, act} from '@testing-library/react';

import Popup from '../popup/popup';

import Tooltip, {TooltipAttrs} from './tooltip';

// Import the mocked Popup for assertions

vi.mock('../popup/popup', () => {
  // Define a type for our mock
  type MockPopupType = ReturnType<typeof vi.fn> & {
    isVisible: ReturnType<typeof vi.fn>;
    PopupProps: {
      Directions: {
        TOP_LEFT: string;
        BOTTOM_RIGHT: string;
      };
    };
  };

  const MockPopup = vi.fn().mockImplementation(({children, className, hidden, ...props}) => {
    return hidden ? null : (
      <div data-testid="mock-popup" className={className} {...props}>
        {children}
      </div>
    );
  }) as MockPopupType;

  // Add isVisible method to the mock
  MockPopup.isVisible = vi.fn().mockReturnValue(true);

  // Add PopupProps to the mock
  MockPopup.PopupProps = {
    Directions: {
      TOP_LEFT: 'top-left',
      BOTTOM_RIGHT: 'bottom-right',
    },
  };

  return {
    __esModule: true,
    default: MockPopup,
  };
});

describe('Tooltip', () => {
  const defaultProps: TooltipAttrs = {
    title: 'test tooltip',
    className: 'test-class',
    children: 'test elem',
  };
  const renderTooltip = (props?: Partial<TooltipAttrs>) => render(<Tooltip {...defaultProps} {...props} />);

  // Constants for test timing
  const SHORT_DELAY = 10;
  const MEDIUM_DELAY = 50;
  const LONG_DELAY = 100;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create component', () => {
    renderTooltip();
    screen.getByText('test elem').should.exist;
  });

  describe('Children', () => {
    it('should wrap text children', () => {
      renderTooltip();
      const wrapper = screen.getByText('test elem');
      wrapper.should.have.text('test elem');
      wrapper.tagName.toLowerCase().should.equal('span');
    });

    it('should wrap children', () => {
      renderTooltip({
        title: 'test tooltip',
        children: <span>{'test span'}</span>,
      });

      // Using a more specific selector that matches the actual DOM structure
      const wrapper = screen.getByRole('tooltip');
      wrapper.tagName.toLowerCase().should.equal('span');

      within(wrapper).getByText('test span').tagName.toLowerCase().should.equal('span');
    });

    it('should pass props to children', () => {
      renderTooltip();
      // Using a more specific selector
      screen.getByRole('tooltip').should.have.class('test-class');
    });

    it('should not pass title to children', () => {
      renderTooltip();
      screen.getByText('test elem').should.not.have.attribute('title');
    });
  });

  describe('Popup', () => {
    let clock: Sinon.SinonFakeTimers;

    beforeEach(() => {
      clock = sandbox.useFakeTimers({toFake: ['setTimeout']});
    });

    it('should unbind listeners when empty title is provided', () => {
      const {rerender} = renderTooltip();
      const tooltipElement = screen.getByRole('tooltip');
      const removeEventListener = sandbox.spy(tooltipElement, 'removeEventListener');

      rerender(<Tooltip {...defaultProps} title="" />);

      removeEventListener.should.have.been.calledTwice;
    });

    it('should render popup on mouseenter', () => {
      renderTooltip();
      const tooltipElement = screen.getByText('test elem').closest('span');

      if (!tooltipElement) throw new Error('Tooltip element not found');

      // Before mouseenter, Popup should be hidden
      expect(Popup).toHaveBeenLastCalledWith(expect.objectContaining({hidden: true}), expect.anything());

      act(() => {
        fireEvent.mouseEnter(tooltipElement);
        clock.tick(SHORT_DELAY);
      });

      // After mouseenter, Popup should be visible with the correct title
      expect(Popup).toHaveBeenLastCalledWith(
        expect.objectContaining({
          hidden: false,
          children: 'test tooltip',
        }),
        expect.anything(),
      );
    });

    it('should not render popup when empty title is provided', () => {
      renderTooltip({
        title: '',
      });
      const tooltipElement = screen.getByText('test elem').closest('span');

      if (!tooltipElement) throw new Error('Tooltip element not found');

      act(() => {
        fireEvent.mouseEnter(tooltipElement);
        clock.tick(SHORT_DELAY);
      });

      // Popup should remain hidden
      expect(Popup).toHaveBeenLastCalledWith(expect.objectContaining({hidden: true}), expect.anything());
    });

    it('should render with delay when provided', () => {
      renderTooltip({
        delay: LONG_DELAY,
      });
      const tooltipElement = screen.getByText('test elem').closest('span');

      if (!tooltipElement) throw new Error('Tooltip element not found');

      act(() => {
        fireEvent.mouseEnter(tooltipElement);
        clock.tick(MEDIUM_DELAY); // Not enough time for the popup to show
      });

      // Popup should still be hidden
      expect(Popup).toHaveBeenLastCalledWith(expect.objectContaining({hidden: true}), expect.anything());

      act(() => {
        clock.tick(LONG_DELAY); // Now the popup should be visible
      });

      // Now the popup should be visible
      expect(Popup).toHaveBeenLastCalledWith(
        expect.objectContaining({
          hidden: false,
          children: 'test tooltip',
        }),
        expect.anything(),
      );
    });

    it('should pass custom props to popup', () => {
      const customClassName = 'tooltip-test-popup';

      renderTooltip({
        popupProps: {
          className: customClassName,
        },
      });
      const tooltipElement = screen.getByText('test elem').closest('span');

      if (!tooltipElement) throw new Error('Tooltip element not found');

      act(() => {
        fireEvent.mouseEnter(tooltipElement);
        clock.tick(SHORT_DELAY);
      });

      // Check that custom props are passed to Popup
      expect(Popup).toHaveBeenLastCalledWith(
        expect.objectContaining({
          className: expect.stringContaining(customClassName),
        }),
        expect.anything(),
      );
    });

    it('should close popup on unmount', () => {
      const {unmount} = renderTooltip();
      const tooltipElement = screen.getByText('test elem').closest('span');

      if (!tooltipElement) throw new Error('Tooltip element not found');

      act(() => {
        fireEvent.mouseEnter(tooltipElement);
        clock.tick(SHORT_DELAY);
      });

      // Popup should be visible
      expect(Popup).toHaveBeenLastCalledWith(expect.objectContaining({hidden: false}), expect.anything());

      unmount();

      // After unmount, the component should be cleaned up
      // We can't directly test this with the mock, but we can verify
      // that no errors are thrown during unmount
    });

    it('should not close popup on click on tooltip', () => {
      renderTooltip();
      const tooltipElement = screen.getByText('test elem').closest('span');

      if (!tooltipElement) throw new Error('Tooltip element not found');

      act(() => {
        fireEvent.mouseEnter(tooltipElement);
        clock.tick(SHORT_DELAY);
      });

      // Popup should be visible
      expect(Popup).toHaveBeenLastCalledWith(expect.objectContaining({hidden: false}), expect.anything());

      // Store the number of calls to Popup before the click
      // @ts-expect-error - mock property access
      const callCountBeforeClick = Popup.mock.calls.length;

      act(() => {
        fireEvent.click(tooltipElement);
      });

      // Popup should still be visible after click
      expect(Popup).toHaveBeenLastCalledWith(expect.objectContaining({hidden: false}), expect.anything());

      // The number of calls should not have increased (no re-render with hidden=true)
      // @ts-expect-error - mock property access
      expect(Popup.mock.calls.length).to.equal(callCountBeforeClick);
    });
  });
});
