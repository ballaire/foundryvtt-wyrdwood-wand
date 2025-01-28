
import * as Format from '../helpers/format.mjs';

/**
 * Extend the basic ItemSheet
 * @extends {ItemSheet}
 */
export class WyrdwoodWandSkillSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 400,
      height: 120,
      classes: ['wyrdwood-wand', 'sheet', 'item']
    });
  }

  /** @override */
  get template() {
    return `systems/wyrdwood-wand/templates/item/item-${this.item.type}-sheet.hbs`;
  }

  /** @override */
  async getData() {
    const context = super.getData();
    const itemData = this.document.toPlainObject();

    context.system = itemData.system;
    context.flags = itemData.flags;
    context.config = CONFIG.WYRDWOOD_WAND;

    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    Format.activateFormatListeners(html);

    const sheet = html[0].closest('.window-content');
    this.radioDefault = sheet.querySelector('#radio-formula-default');
    this.radioCustom = sheet.querySelector('#radio-formula-custom');
    this.formulaInput = sheet.querySelector('#custom-formula');

    html.on('click', '#custom-formula', this._onSelectCustomInput.bind(this));
    this._selectActiveRadioButton();
  }

  _onSelectCustomInput() {
    this.radioCustom.checked = true;
  }

  _selectActiveRadioButton() {
    if (this.item.system.useCustom) {
      this.radioCustom.checked = true;
    } else {
      this.radioDefault.checked = true;
    }
  }

  /** @override */
  _onChangeInput(event) {
    return super._onChangeInput(event);
  }
}
