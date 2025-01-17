import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class WyrdwoodWandItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['wyrdwood-wand', 'sheet', 'item'],
      width: 520,
      height: 480,
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
    const path = 'systems/wyrdwood-wand/templates/item';
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.hbs`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.hbs`.
    return `${path}/item-${this.item.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve base data structure.
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const itemData = this.document.toPlainObject();

    // Enrich description info for display
    // Enrichment turns text like `[[/r 1d20]]` into buttons
    context.enrichedDescription = await TextEditor.enrichHTML(
      this.item.system.description,
      {
        // Whether to show secret blocks in the finished html
        secrets: this.document.isOwner,
        // Necessary in v11, can be removed in v12
        async: true,
        // Data to fill in for inline rolls
        rollData: this.item.getRollData(),
        // Relative UUID resolution
        relativeTo: this.item,
      }
    );

    // Add the item's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;

    // Adding a pointer to CONFIG.WYRDWOOD_WAND
    context.config = CONFIG.WYRDWOOD_WAND;

    // Prepare active effects for easier access
    context.effects = prepareActiveEffectCategories(this.item.effects);

    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Active Effect management
    html.on('click', '.effect-control', (ev) =>
      onManageActiveEffect(ev, this.item)
    );

    function updateInputSize(parent, input) {
      if (input.value) {
        parent.dataset.value = input.value;
      }
      else if (parent.dataset.defaultValue) {
        parent.dataset.value = parent.dataset.defaultValue;
      }
      else {
        parent.dataset.value = 'Empty';
      }
    }

    html.on('input', '.input-sizer-input', (event) => {
      event.preventDefault();
      let input = event.currentTarget;
      let parent = input.parentNode;

      updateInputSize(parent, input);
    });

    html[0].querySelectorAll('.input-sizer-input').forEach((input) => {
      let parent = input.parentNode;

      updateInputSize(parent, input);
    });

    html.on('click', '.add-section-button', this._onAddAbilitySection.bind(this));

    html.on('change', '.ability-section-update', this._onAbilitySectionUpdate.bind(this));

    html.on('click', '.aether-check', this._onToggleAetherCost.bind(this));
    html.on('click', '.dropdown-button', this._onToggleDropdown.bind(this));
    html.on('click', '.sheet-wrapper', this._onCloseDropdowns.bind(this));
    html.on('click', '.color-select a', this._onColorSelect.bind(this));
    html.on('click', '.ability-section-up', this._onAbilitySectionMoveUp.bind(this));
    html.on('click', '.ability-section-down', this._onAbilitySectionMoveDown.bind(this));
    html.on('click', '.delete-section', this._onAbilitySectionDelete.bind(this));

    this._disableAbilitySectionArrows(html[0]);
    this._updateEditMode(html[0].closest('.window-content'));
  }
  
  _onAddAbilitySection(event) {
    event.preventDefault();

    let newSection = {
      editContent: '',
      displayContent: '<p></p>',
      background: 'blank',
    }

    let sections = [...this.item.system.sections, newSection];

    this.submit({updateData: {"system.sections": sections}});
  }

  _onAbilitySectionUpdate(event) {
    event.preventDefault();

    let input = event.currentTarget;
    let section = input.closest('.ability-section');
    let index = section.dataset.index;

    // Convert separate lines to <p>s for non-edit mode only
    let displayValue = '<p>' + input.value.replace(/\n/g, '</p><p>') + '</p>';

    let sections = this.item.system.sections;
    sections[index].editContent = input.value;
    sections[index].displayContent = displayValue;

    this.submit({updateData: {"system.sections": sections}});
  }

  _onToggleAetherCost(event) {
    event.preventDefault();

    this.submit({updateData: {"system.aetherCost": !this.item.system.aetherCost}});
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

    this.submit({updateData: {"system.sections": sections}});
  }

  _onAbilitySectionMoveUp(event) {
    event.preventDefault();

    let index = event.currentTarget.closest('.ability-section').dataset.index;
    let sections = this.item.system.sections;

    index = parseInt(index);
    if (index <= 0) return;

    sections = [...sections.slice(0, index - 1), sections[index], sections[index - 1], ...sections.slice(index + 1, sections.length)];

    this.submit({updateData: {"system.sections": sections}});
  }

  _onAbilitySectionMoveDown(event) {
    event.preventDefault();

    let index = event.currentTarget.closest('.ability-section').dataset.index;
    let sections = this.item.system.sections;

    index = parseInt(index);
    if (index >= sections.length - 1) return;

    sections = [...sections.slice(0, index), sections[index + 1], sections[index], ...sections.slice(index + 2, sections.length)];

    this.submit({updateData: {"system.sections": sections}});
  }

  _onAbilitySectionDelete(event) {
    event.preventDefault();

    let index = event.currentTarget.closest('.ability-section').dataset.index;
    let sections = this.item.system.sections;

    index = parseInt(index);
    sections.splice(index, 1);

    this.submit({updateData: {"system.sections": sections}});
  }

  _disableAbilitySectionArrows(sheet) {
    let sections = sheet.querySelector('.extra-sections').children;
    if (sections.length == 0) return;

    sections[0].querySelector('.ability-section-up').classList.add('gray-out');
    sections[sections.length - 1].querySelector('.ability-section-down').classList.add('gray-out');
  }

  _updateEditMode(sheet) {
    const inputs = sheet.querySelectorAll('input.edit-mode-input');
    let editMode = sheet.classList.contains('edit-mode');
    
    inputs.forEach(input => {
      input.disabled = !editMode;
    });
  }

  _onToggleEditMode(event) {
    event.preventDefault();

    const editButton = event.currentTarget;
    editButton.classList.toggle('editing-glow');

    const sheet = editButton.closest('.app').querySelector('.window-content');
    sheet.classList.toggle('edit-mode');
    this._updateEditMode(sheet);
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

  /** @override 
   * 
   * Prevent triggers for events handled elsewhere.
  */
  async _onChangeInput(event) {
  
    for (const ignoreClass of ['.ability-section-update']) {
      if (event.currentTarget.matches(ignoreClass)) {
        return;
      }
    }

    return super._onChangeInput(event);
  }
}
