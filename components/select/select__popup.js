/**
 * @description Displays a popup with select's options.
 */

import React from 'react';
import {findDOMNode} from 'react-dom';
import classNames from 'classnames';

import RingComponentWithShortcuts from '../ring-component/ring-component_with-shortcuts';
import Popup from '../popup/popup';
import List from '../list/list';
import Input from '../input/input';
import LoaderInline from '../loader-inline/loader-inline';
import shortcutsHOC from '../shortcuts/shortcuts-hoc';
import {filterWrapper} from '../popup/popup.css';
import {preventDefault} from '../global/dom';
import getUID from '../global/get-uid';

function noop() {}

const InputWithShortcuts = shortcutsHOC(Input);

export default class SelectPopup extends RingComponentWithShortcuts {
  isClickingPopup = false; // This flag is to true while an item in the popup is being clicked

  static defaultProps = {
    data: [],
    activeIndex: null,
    toolbar: null,
    filter: false, // can be either boolean or an object with "value" and "placeholder" properties
    message: null,
    anchorElement: null,
    maxHeight: 250,
    loading: false,
    minWidth: Popup.PopupProps.MinWidth.TARGET,
    onSelect: noop,
    onCloseAttempt: noop,
    onFilter: noop,
    onLoadMore: noop
  };

  state = {
    popupShortcuts: false,
    popupFilterShortcutsOptions: {
      modal: true,
      disabled: true
    }
  };

  popupFilterShortcuts = {
    map: {
      up: e => (this.list && this.list.upHandler(e)),
      down: e => (this.list && this.list.downHandler(e)),
      enter: e => (this.list && this.list.enterHandler(e)),
      esc: e => this.props.onCloseAttempt(e),
      tab: e => this.tabPress(e)
    }
  };

  popupFilterOnFocus = () => this._togglePopupFilterShortcuts(false);
  popupFilterOnBlur = () => this._togglePopupFilterShortcuts(true);

  _togglePopupFilterShortcuts(value) {
    this.setState({
      popupFilterShortcutsOptions: {
        modal: true,
        disabled: value
      }
    });
  }

  _focusAndStoreInput = el => {
    this.filter = el;
    if (el) {
      findDOMNode(el).focus();
    }
  };

  didMount() {
    window.document.addEventListener('mouseup', this.mouseUpHandler);
  }

  willReceiveProps(nextProps) {
    if (nextProps.hidden !== this.props.hidden) {
      this.setState({
        popupShortcuts: !nextProps.hidden,
        shortcuts: !nextProps.hidden && this.props.filter
      });
    }
  }

  willUnmount() {
    window.document.removeEventListener('mouseup', this.mouseUpHandler);
  }

  getShortcutsProps() {
    return {
      map: {
        tab: this.tabPress
      },
      scope: getUID('select-popup-')
    };
  }

  listOnMouseOut = () => {
    this.list.clearSelected();
  }

  mouseDownHandler = () => {
    this.isClickingPopup = true;
  }

  mouseUpHandler = () => {
    this.isClickingPopup = false;
  }

  listScrollToIndex(index) {
    this.list && this.list.setActiveItem(index);
  }

  isVisible() {
    return this.popup && this.popup.isVisible();
  }

  onListSelect = selected => {
    const getSelectItemEvent = () => {
      let event;
      if (document.createEvent) {
        event = document.createEvent('Event');
        event.initEvent('select', true, false);
      }
      return event;
    };

    this.props.onSelect(selected, getSelectItemEvent());
  }

  tabPress = event => {
    preventDefault(event);

    const listActiveItem = this.list && this.list.state.activeItem;
    if (listActiveItem) {
      this.onListSelect(listActiveItem);
    }
    this.props.onCloseAttempt();
  }

  getFilter() {
    if (this.props.filter && !this.props.hidden) {
      return (
        <div className={filterWrapper}>
          <InputWithShortcuts
            rgShortcutsOptions={this.state.popupFilterShortcutsOptions}
            rgShortcutsMap={this.popupFilterShortcuts.map}

            value={this.props.filterValue}
            inputRef={this._focusAndStoreInput}
            onBlur={this.popupFilterOnBlur}
            onFocus={this.popupFilterOnFocus}
            className="ring-js-shortcuts ring-input_filter-popup"
            placeholder={this.props.filter.placeholder || ''}
            onChange={this.props.onFilter}
          />
        </div>
      );
    }

    return null;
  }

  getBottomLine() {
    return (<div>
      {this.props.loading && <LoaderInline/>}

      {this.props.message &&
      <div className="ring-select__message">{this.props.message}</div>}
    </div>);
  }

  listRef = el => {
    this.list = el;
  };

  getList() {
    if (this.props.data.length) {
      return (
        <List
          maxHeight={this.props.maxHeight}
          data={this.props.data}
          activeIndex={this.props.activeIndex}
          ref={this.listRef}
          restoreActiveIndex={true}
          activateSingleItem={true}
          onSelect={this.onListSelect}
          onMouseOut={this.listOnMouseOut}
          onScrollToBottom={this.props.onLoadMore}
          shortcuts={this.state.popupShortcuts}
          disableMoveDownOverflow={this.props.loading}
        />
      );
    }

    return null;
  }

  popupRef = el => {
    this.popup = el;
  };

  render() {
    const classes = classNames(
      'ring-select-popup',
      this.props.className
    );

    return (
      <Popup
        ref={this.popupRef}
        hidden={this.props.hidden}
        attached={false}
        className={classes}
        dontCloseOnAnchorClick={true}
        keepMounted={true}
        anchorElement={this.props.anchorElement}
        minWidth={this.props.minWidth}
        onCloseAttempt={this.props.onCloseAttempt}
        directions={this.props.directions}
        top={this.props.top}
        left={this.props.left}
        onMouseDown={this.mouseDownHandler}
      >
        {this.getFilter()}
        {this.getList()}
        {this.getBottomLine()}
        {this.props.toolbar}
      </Popup>
    );
  }
}
