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
    
    this._updateEditMode(html[0].parentNode);

    html.on('click', '.add-section-button', this._onAddAbilitySection.bind(this));

    html.on('change', '.ability-section-update', this._onAbilitySectionUpdate.bind(this));

    console.log(this.item.system);
  }
  
  _onAddAbilitySection(event) {
    event.preventDefault();

    let newSection = {
      title: 'New',
      description: '',
      bullet: false,
      indent: 0,
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
    let field = input.dataset.field;

    let sections = structuredClone(this.item.system.sections);
    sections[index][field] = input.value;

    this.submit({updateData: {"system.sections": sections}});
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
