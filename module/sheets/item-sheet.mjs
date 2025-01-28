import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

import * as Dice from '../helpers/dice.mjs';
import * as Format from '../helpers/format.mjs';

/**
 * Extend the basic ItemSheet
 * @extends {ItemSheet}
 */
export class WyrdwoodWandItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 520,
      height: 480,
      classes: ['wyrdwood-wand', 'sheet', 'item'],
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'description',
        },
      ],
    });
  }

  /** @override */
  get template() {
    return `systems/wyrdwood-wand/templates/item/item-${this.item.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    const context = super.getData();
    const itemData = this.document.toPlainObject();

    context.system = itemData.system;
    context.flags = itemData.flags;

    context.config = CONFIG.WYRDWOOD_WAND;
    context.effects = prepareActiveEffectCategories(this.item.effects);

    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Active Effect management
    html.on('click', '.effect-control', (event) =>
      onManageActiveEffect(event, this.item)
    );

    html.on('click', '.add-section-button', this._onAddAbilitySection.bind(this));
    html.on('click', '.aether-check', this._onToggleAetherCost.bind(this));
    html.on('click', '.dropdown-button', this._onToggleDropdown.bind(this));
    html.on('click', '.sheet-wrapper', this._onCloseDropdowns.bind(this));
    html.on('click', '.color-select a', this._onColorSelect.bind(this));
    html.on('click', '.ability-section-up', this._onAbilitySectionMoveUp.bind(this));
    html.on('click', '.ability-section-down', this._onAbilitySectionMoveDown.bind(this));
    html.on('click', '.delete-section', this._onAbilitySectionDelete.bind(this));

    const sheet = html[0].closest('.window-content');

    this._disableAbilitySectionArrows(sheet);
    if (this.fromActorSheet)
      this._toggleEditMode(sheet.closest('.app'));
    else
      this._updateEditMode(sheet.closest('.app'));

    Format.activateFormatListeners(html);
  }

  _onAddAbilitySection(event) {
    event.preventDefault();

    let newSection = {
      editContent: '',
      displayContent: '<p></p>',
      background: 'blank',
    };

    this.submit({updateData: {'system.sections': [...this.item.system.sections, newSection]}});
  }

  _onToggleAetherCost(event) {
    event.preventDefault();

    this.submit({updateData: {'system.aetherCost': !this.item.system.aetherCost}});
  }

  _onToggleDropdown(event) {
    event.preventDefault();

    let content = event.currentTarget.parentNode.querySelector('.dropdown-content');

    content.classList.toggle('hidden');
  }

  _onCloseDropdowns(event) {
    event.preventDefault();

    event.currentTarget.querySelectorAll('.dropdown-content').forEach((element) => {
      if (event.target.parentNode == element.parentNode) {
        return; // Clicked on dropdown, don't double trigger
      }

      element.classList.add('hidden');
    });
  }

  _onColorSelect(event) {
    event.preventDefault();

    let color = event.currentTarget.className;
    let index = event.currentTarget.closest('.ability-section').dataset.index;

    let sections = this.item.system.sections;
    sections[index].background = color;

    this.submit({updateData: {'system.sections': sections}});
  }

  _onAbilitySectionMoveUp(event) {
    event.preventDefault();

    let index = event.currentTarget.closest('.ability-section').dataset.index;
    let sections = this.item.system.sections;

    index = parseInt(index);
    if (index <= 0) return;

    let section = sections[index];
    sections[index] = sections[index - 1];
    sections[index - 1] = section

    this.submit({updateData: {'system.sections': sections}});
  }

  _onAbilitySectionMoveDown(event) {
    event.preventDefault();

    let index = event.currentTarget.closest('.ability-section').dataset.index;
    let sections = this.item.system.sections;

    index = parseInt(index);
    if (index >= sections.length - 1) return;

    let section = sections[index];
    sections[index] = sections[index + 1];
    sections[index + 1] = section

    this.submit({updateData: {'system.sections': sections}});
  }

  _onAbilitySectionDelete(event) {
    event.preventDefault();

    let index = event.currentTarget.closest('.ability-section').dataset.index;
    let sections = this.item.system.sections;

    index = parseInt(index);
    sections.splice(index, 1);

    this.submit({updateData: {'system.sections': sections}});
  }

  _disableAbilitySectionArrows(sheet) {
    let sections = sheet.querySelector('.extra-sections')?.children;
    if (!sections || sections.length == 0) return;

    sections[0].querySelector('.ability-section-up').classList.add('gray-out');
    sections[sections.length - 1].querySelector('.ability-section-down').classList.add('gray-out');
  }

  _updateEditMode(app) {
    const sheet = app.querySelector('.window-content');
    if (!sheet.classList.contains('normal-mode') && !sheet.classList.contains('edit-mode')) {
      sheet.classList.add('normal-mode');
    }

    const inputs = sheet.querySelectorAll('input.edit-mode-input');
    let editMode = sheet.classList.contains('edit-mode');
    
    inputs.forEach(input => {
      input.disabled = !editMode;
    });
  }

  _toggleEditMode(app) {
    const editButton = app.querySelector('.edit-button');
    const sheet = app.querySelector('.window-content');

    editButton.classList.toggle('editing-glow');
    sheet.classList.toggle('edit-mode');
    sheet.classList.toggle('normal-mode');

    this._updateEditMode(app);
  }

  _onToggleEditMode(event) {
    event.preventDefault();

    const app = event.currentTarget.closest('.app');
    this._toggleEditMode(app);
  }
  
  /** @override */
  async _render(force=false, options={}) {
    if (options.fromActorSheet) {
      this.fromActorSheet = true;
    }
    else {
      this.fromActorSheet = false;
    }
    
    if (this.skipRender) {
      this.skipRender = false;
      return;
    }

    super._render(force, options);
  }

  /** @override */
  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();

    let editButton = {
      label: 'MISC.edit',
      class: 'edit-button',
      icon: 'fas fa-edit',

      onclick: this._onToggleEditMode.bind(this)
    };

    return [editButton, ...buttons];
  }
}
