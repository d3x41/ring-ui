/**
 * @fileoverview Base editor controller. Class, which abstracts interactions
 * with editor for DiffTool and represents basic interface: enabling, disabling,
 * setting content, setting editor editable.
 * @author igor.alexeenko (Igor Alekseyenko)
 */

define(['diff/diff__tools'], function(diffTool) {
  'use strict';

  // NB! Fragile code. Add EditorController class to utility namespace, which
  // is defined in diff__tools.js. It means, that diff__tools.js should always
  // called before this file. Not sure, how require.js resolves it, but it
  // seems to me, that is is works fine. But if we had a tool, which resolves
  // namespaces, it would be better.
  /**
   * @param {Element} element
   * @param {boolean=} opt_editable
   * @constructor
   */
  diffTool.EditorController = function(element, opt_editable) {
    this.element_ = element;

    if (diffTool.isDef(opt_editable)) {
      this.editable_ = /** @type {!boolean} */ (opt_editable);
    }
  };

  /**
   * @param {boolean=} opt_editable
   * @param {string=} opt_value
   * @return {Object}
   * @static
   */
  diffTool.EditorController.getCodeMirrorOptions = function(opt_editable,
                                                            opt_value) {
    var opts = {};

    if (diffTool.isDef(opt_value)) {
      // NB! Some parameters we could get by analyzing given piece of code.
      opts = diffTool.EditorController.getCodeOptionsFromValue(opt_value);
    }

    return diffTool.mixin({
      indentUnit: 4,
      indentWithTabs: false,
      lineNumbers: true,
      readOnly: Boolean(opt_editable),
      smartIndent: true,
      tabMode: 'indent',
      tabSize: 4
    }, opts);
  };

  // todo(igor.alexeenko): There is a problem with code analyze, because
  // somehow, I have to find out what kind of line endings is used in
  // given code and use this line endings instead of system default endings.

  /**
   * @param {string} value
   * @return {Object}
   */
  diffTool.EditorController.getCodeOptionsFromValue = function(value) {
    var indentWithTabs = /\n?\t+/.test(value);

    return {
      indentWithTabs: indentWithTabs
    };
  };

  /**
   * @type {boolean}
   * @private
   */
  diffTool.EditorController.prototype.enabled_ = false;

  /**
   * @type {boolean}
   * @private
   */
  diffTool.EditorController.prototype.editable_ = true;

  /**
   * @type {Element}
   * @private
   */
  diffTool.EditorController.prototype.element_ = null;

  /**
   * @param {boolean} editable
   */
  diffTool.EditorController.prototype.setEditable = function(editable) {
    if (editable !== this.editable_) {
      this.editable_ = editable;
      this.setEditableInternal(editable);
    }
  };

  // NB!(igor.alexeenko): Tests runner does not allow to equal internal
  // methods to {diffTool.abstractMethod}s, because it's always falls, when
  // some method raises an exception.
  // todo(igor.alexeenko): Change all internal methods to nullFunction
  // when child classes implements.
  /**
   * @param {boolean} editable
   * @protected
   */
  diffTool.EditorController.prototype.setEditableInternal =
      diffTool.nullFunction;

  /**
   * @return {boolean}
   */
  diffTool.EditorController.prototype.isEditable = function() {
    return this.editable_;
  };

  /**
   * @param {string} original
   * @param {string} modified
   * @param {Array.<Object>} diff
   */
  diffTool.EditorController.prototype.setContent = function(original,
                                                            modified, diff) {
    /**
     * @type {string}
     * @private
     */
    this.contentOriginal_ = original;

    /**
     * @type {string}
     * @private
     */
    this.contentModified_ = modified;

    // todo(igor.alexeenko): formalize data-type of this object.
    /**
     * Information about difference between original and modified content.
     * @type {Array.<Object>}
     * @private
     */
    this.diff_ = diff;

    this.setContentInternal(original, modified, diff);
  };

  /**
   * @param {string} original
   * @param {string} modified
   * @param {Array.<Object>} diff
   * @protected
   */
  diffTool.EditorController.prototype.setContentInternal =
      diffTool.nullFunction;

  /**
   * @param {boolean} enabled
   */
  diffTool.EditorController.prototype.setEnabled = function(enabled) {
    if (enabled !== this.enabled_) {
      this.enabled_ = enabled;
      this.setEnabledInternal(enabled);
    }
  };

  /**
   * @param {boolean} enabled
   */
  diffTool.EditorController.prototype.setEnabledInternal =
      diffTool.nullFunction;

  /**
   * @return {boolean}
   */
  diffTool.EditorController.prototype.isEnabled = function() {
    return this.enabled_;
  };

  return diffTool.EditorController;
});
