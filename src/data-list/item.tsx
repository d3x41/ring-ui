import {PureComponent, ReactNode} from 'react';
import chevronRightIcon from '@jetbrains/icons/chevron-right';
import chevronDownIcon from '@jetbrains/icons/chevron-down';

import Link from '../link/link';
import Text from '../text/text';
import LoaderInline from '../loader-inline/loader-inline';

import Button from '../button/button';

import {SelectionItem} from '../table/selection';

import Selection from './selection';

import Title from './title';

import styles from './data-list.css';

export enum moreLessButtonStates {
  UNUSED,
  MORE,
  MORE_LOADING,
  LESS,
}

const ITEM_LEFT_OFFSET = 32;
const LIST_LEFT_OFFSET = 24;

export interface BaseFormattedItem<T> {
  items?: readonly T[];
  title?: ReactNode;
  collapsible?: boolean | null | undefined;
  collapsed?: boolean | null | undefined;
  onCollapse?: () => void;
  onExpand?: () => void;
  selectable?: boolean | undefined;
}

export interface FormattedItem<T> extends BaseFormattedItem<T> {
  key?: string | null | undefined;
  id?: string | number | null | undefined;
}

export interface ItemProps<T extends SelectionItem> extends BaseFormattedItem<T> {
  item: T;
  onFocus: (item: T) => void;
  onSelect: (item: T, selected: boolean) => void;
  itemFormatter: (item: T) => FormattedItem<T>;
  level: number;
  parentShift: number;
  showMoreLessButton: moreLessButtonStates;
  onItemMoreLess: (item: T, more: boolean) => void;
  className?: string | null | undefined;
  showFocus?: boolean | undefined;
  selection: Selection<T>;
  selected?: boolean | undefined;
  partialSelected?: boolean | undefined;
}

export default class Item<T extends SelectionItem> extends PureComponent<ItemProps<T>> {
  static defaultProps = {
    items: [],
    level: 0,
    parentShift: 0,
    showMoreLessButton: moreLessButtonStates.UNUSED,
    onItemMoreLess: () => {},
  };

  onShowMore = () => {
    const {onItemMoreLess, item} = this.props;
    onItemMoreLess(item, true);
  };

  onShowLess = () => {
    const {onItemMoreLess, item} = this.props;
    onItemMoreLess(item, false);
  };

  onFocus = () => {
    const {onFocus, item} = this.props;
    onFocus(item);
  };

  onSelect = (selected: boolean) => {
    const {onSelect, item} = this.props;
    onSelect(item, selected);
  };

  renderItem = (model: T, parentShift: number) => {
    const {onFocus, onSelect, selection, level, itemFormatter} = this.props;

    const item = itemFormatter(model);

    return (
      <Item
        key={item.key || item.id}
        item={model}
        title={item.title}
        items={item.items}
        level={level + 1}
        parentShift={parentShift}
        itemFormatter={itemFormatter}
        collapsible={item.collapsible}
        collapsed={item.collapsed}
        onCollapse={item.onCollapse}
        onExpand={item.onExpand}
        showFocus={selection.isFocused(model)}
        onFocus={onFocus}
        selection={selection}
        selectable={item.selectable}
        selected={selection.isSelected(model)}
        partialSelected={selection.isPartialSelected(model)}
        onSelect={onSelect}
      />
    );
  };

  render() {
    const {
      title,
      items,
      showMoreLessButton,
      level,
      parentShift,
      showFocus,
      selectable,
      selected,
      partialSelected,
      collapsible,
      collapsed,
      onCollapse,
      onExpand,
    } = this.props;

    let moreLessButton;
    if (showMoreLessButton === moreLessButtonStates.MORE || showMoreLessButton === moreLessButtonStates.MORE_LOADING) {
      moreLessButton = (
        <Text info>
          <Link inherit pseudo onClick={this.onShowMore}>
            {'Show more'}
          </Link>
          {showMoreLessButton === moreLessButtonStates.MORE_LOADING && (
            <LoaderInline className={styles.showMoreLoader} />
          )}
        </Text>
      );
    } else if (showMoreLessButton === moreLessButtonStates.LESS) {
      moreLessButton = (
        <Text info>
          <Link inherit pseudo onClick={this.onShowLess}>
            {'Show less'}
          </Link>
        </Text>
      );
    }

    let collapserExpander = null;
    if (collapsible) {
      if (collapsed) {
        collapserExpander = (
          <Button
            title="Expand"
            onClick={onExpand}
            icon={chevronRightIcon}
            className={styles.collapseButton}
            iconClassName={styles.collapseIcon}
            data-test="ring-data-list-expand"
          />
        );
      } else {
        collapserExpander = (
          <Button
            title="Collapse"
            onClick={onCollapse}
            icon={chevronDownIcon}
            className={styles.collapseButton}
            iconClassName={styles.collapseIcon}
            data-test="ring-data-list-collapse"
          />
        );
      }
    }

    const itemIsEmpty = !items?.length || (collapsible && collapsed);
    const offset = level * LIST_LEFT_OFFSET + ITEM_LEFT_OFFSET + parentShift;

    return (
      <li>
        <Title
          title={title}
          focused={showFocus}
          showFocus={showFocus}
          selectable={selectable}
          selected={selected}
          partialSelected={partialSelected}
          collapserExpander={collapserExpander}
          onFocus={this.onFocus}
          onSelect={this.onSelect}
          offset={offset}
        />

        {!itemIsEmpty ? (
          <ul className={styles.itemContent}>
            {items.map(model => this.renderItem(model, parentShift))}

            {showMoreLessButton !== moreLessButtonStates.UNUSED ? (
              <li className={styles.showMore}>{moreLessButton}</li>
            ) : null}
          </ul>
        ) : null}
      </li>
    );
  }
}
