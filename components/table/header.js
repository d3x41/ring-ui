/* eslint-disable react/jsx-max-props-per-line */

import React, {PureComponent, PropTypes} from 'react';
import classNames from 'classnames';
import Waypoint from 'react-waypoint';

import style from './table.css';

import HeaderCell from './header-cell';
import Checkbox from '../checkbox/checkbox';

export default class Header extends PureComponent {
  static propTypes = {
    caption: PropTypes.string,
    selectable: PropTypes.bool,
    multiSelectable: PropTypes.bool,
    draggable: PropTypes.bool,
    checked: PropTypes.bool,
    sticky: PropTypes.bool,
    topStickOffset: PropTypes.string,
    onCheckboxChange: PropTypes.func,
    columns: PropTypes.array.isRequired,
    onSort: PropTypes.func,
    sortKey: PropTypes.string,
    sortOrder: PropTypes.bool
  }

  static defaultProps = {
    selectable: true,
    multiSelectable: true,
    draggable: false,
    checked: true,
    sticky: true,
    topStickOffset: '0px',
    onSort: () => {},
    onCheckboxChange: () => {},
    sortKey: 'id',
    sortOrder: true
  }

  state = {
    fixed: false,
    headerWidth: null,
    widths: []
  };

  onCheckboxFocus = event => {
    event.target.blur();
  }

  storeColumnsRowNode = node => {
    if (node) {
      this._columnsRowNode = node;
      this.calculateColumnsWidths(node);
    }
  }

  onScrollIn = () => {
    this.calculateColumnsWidths(this._columnsRowNode);
    this.setState({fixed: false});
  }

  onScrollOut = () => {
    this.calculateColumnsWidths(this._columnsRowNode);
    this.setState({fixed: true});
  }

  calculateColumnsWidths(columnsRowNode) {
    this.setState({
      headerWidth: columnsRowNode.clientWidth,
      widths: [...columnsRowNode.childNodes].map(column => column.clientWidth)
    });
  }

  createCells(widths = []) {
    const {selectable, multiSelectable, draggable, columns, checked, onCheckboxChange, onSort, sortKey, sortOrder} = this.props;

    const metaColumnClasses = classNames(style.metaColumn, {
      [style.metaColumnSpaced]: selectable
    });

    const metaColumn = (
      <div className={metaColumnClasses}>
        {selectable && multiSelectable &&
        <Checkbox
          checked={checked}
          onChange={onCheckboxChange}
          onFocus={this.onCheckboxFocus}
        />}
      </div>
    );

    const headerCells = columns.map((column, index) => {
      const columnStyle = widths[index] ? {width: widths[index]} : null;
      const props = {key: index, column, onSort, sortKey, sortOrder, style: columnStyle};
      return (
        <HeaderCell {...props}>
          {index === 0 && (draggable || selectable) && metaColumn}
        </HeaderCell>
      );
    });

    return headerCells;
  }

  render() {
    const {caption, sticky, topStickOffset} = this.props;
    const {fixed, widths, headerWidth} = this.state;

    const regularCells = this.createCells();

    return (
      <thead data-test="ring-table-header">
        {sticky &&
          <Waypoint
            topOffset={topStickOffset}
            onEnter={this.onScrollIn}
            onLeave={this.onScrollOut}
          >
            <tr data-test="ring-table-header-row"/>
          </Waypoint>
        }

        {caption &&
          <tr data-test="ring-table-header-row">
            <th
              className={classNames(style.headerCell, style.caption)}
              colSpan={regularCells.length + 1}
              data-test="ring-table-header-cell"
            >{caption}</th>
          </tr>
        }

        <tr ref={this.storeColumnsRowNode} data-test="ring-table-header-row">{regularCells}</tr>

        {fixed && sticky &&
          <tr
            className={style.subHeaderFixed}
            style={{width: headerWidth, top: topStickOffset}}
            data-test="ring-table-header-row"
          >
            {this.createCells(widths)}
          </tr>
        }
      </thead>
    );
  }
}
