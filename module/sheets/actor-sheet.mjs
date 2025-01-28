import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

import * as Dice from '../helpers/dice.mjs';
import * as Format from '../helpers/format.mjs';

/**
 * Extend the basic ActorSheet
 * @extends {ActorSheet}
 */
export class WyrdwoodWandActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['wyrdwood-wand', 'sheet', 'actor'],
      width: 600,
      height: 600,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'stats',
        },
      ],
    });
  }

  /** @override */
  get template() {
    return `systems/wyrdwood-wand/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /** @override */
  async getData() {
    const context = super.getData();

    const actorData = this.document.toPlainObject();

    context.system = actorData.system;
    context.flags = actorData.flags;

    context.config = CONFIG.WYRDWOOD_WAND;

    if (actorData.type === 'character') {
      this._prepareItems(context);
    }
    this._prepareCharacterData(context);

    context.effects = prepareActiveEffectCategories(
      this.actor.allApplicableEffects()
    );

    return context;
  }

  /**
   * Character-specific context modifications
   *
   * @param {object} context The context object to mutate
   */
  _prepareCharacterData(context) {
    // This is where you can enrich character-specific editor fields
    // or setup anything else that's specific to this type
  }

  /**
   * Organize and classify Items for Actor sheets.
   *
   * @param {object} context The context object to mutate
   */
  _prepareItems(context) {
    const skills = [];
    const paths = [];
    const talents = [];
    const basicActions = [];
    const techniques = [];
    const rites = [];

    for (let item of context.items) {
      item.img = item.img || Item.DEFAULT_ICON;
      if (item.type === 'skill') {
        skills.push(item);
      }
      else if (item.type === 'path') {
        paths.push(item);
      }
      else if (item.type === 'talent') {
        talents.push(item)
      }
      else if (item.type === 'ability') {
        if (item.system.abilityType === 'basic') {
          basicActions.push(item)
        }
        else if (item.system.abilityType === 'technique') {
          techniques.push(item)
        }
        else if (item.system.abilityType === 'rite') {
          rites.push(item)
        }
      }
    }

    context.skills = skills;
    context.paths = paths;
    context.talents = talents;
    context.basicActions = basicActions;
    context.techniques = techniques;
    context.rites = rites;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.on('click', '.item-edit', (event) => {
      const li = $(event.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.sheet.render(true);
    });

    // Add Inventory Item
    html.on('click', '.item-create', this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.on('click', '.item-delete', (event) => {
      const li = $(event.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.on('click', '.effect-control', (event) => {
      const row = event.currentTarget.closest('li');
      const document =
        row.dataset.parentId === this.actor.id
          ? this.actor
          : this.actor.items.get(row.dataset.parentId);
      onManageActiveEffect(event, document);
    });

    // Rollable abilities.
    html.on('click', '.rollable', this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = (event) => this._onDragStart(event);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains('inventory-header')) return;
        li.setAttribute('draggable', true);
        li.addEventListener('dragstart', handler, false);
      });
    }

    html.on('click', '.add-item', (event) => {
      event.preventDefault();
      
      let element = event.currentTarget;
      let itemData = {
        name: game.i18n.localize(element.dataset.newText),
        type: element.dataset.type
      }

      this.actor.createEmbeddedDocuments('Item', [itemData]);
    });

    html.on('change', '.item-inline-edit', (event) => {
      event.preventDefault();

      let element = event.currentTarget;
      let itemId = element.closest('.item').dataset.itemId;
      let item = this.actor.items.get(itemId);
      let field = element.dataset.field;

      item.update({[field]: element.value});
    });

    html.on('click', '.feature-edit', this._onFeatureEdit.bind(this));
    html.on('click', '.feature-delete', this._onFeatureDelete.bind(this));
    html.on('click', '.ability-filter', this._onToggleAbilityFilter.bind(this));
    html.on('click', '.collapsible-title', this._onToggleCollapsed.bind(this));
    html.on('click', '.hidden-content-title', this._onToggleAbilityExpand.bind(this));
    html.on('click', '.ability-up', this._onAbilityMoveUp.bind(this));
    html.on('click', '.ability-down', this._onAbilityMoveDown.bind(this));
    html.on('click', '.ability-edit', this._onAbilityEdit.bind(this));
    html.on('click', '.ability-delete', this._onAbilityDelete.bind(this));
    html.on('input', '.ability-tab-body .search-bar', this._onUpdateAbilitySearch.bind(this));

    const sheet = html[0].closest('.window-content');
    this._updateEditMode(sheet);
    this._disableAbilityArrows(sheet);
    this._applyAbilityFilters(sheet);
    this._applyAbilityExpand(sheet);
    this._updateAbilitySearch(sheet);

    Format.activateFormatListeners(html);
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = foundry.utils.duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data,
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system['type'];

    // Finally, create the item!
    return await Item.create(itemData, { parent: this.actor });
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    event.stopPropagation();
    const element = event.currentTarget;
    const dataset = element.dataset;

    if (dataset.rollType == 'item') {
      const itemId = element.closest('.item').dataset.itemId;
      const item = this.actor.items.get(itemId);
      if (item) return item.roll();
    }

    else if (dataset.rollType == 'risk') {
      Dice.riskRoll({
        actorData: this.actor.system,
        attribute: dataset.attribute,
        skillId: dataset.skillId,
      });
    }
  }

  _onFeatureEdit(event) {
    event.preventDefault();

    const itemId = event.currentTarget.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);
    item.sheet.render(true, {fromActorSheet: true});
  }

  _onFeatureDelete(event) { 
    event.preventDefault();
    
    const itemId = event.currentTarget.closest('.item').dataset.itemId;
    this.actor.deleteEmbeddedDocuments('Item', [itemId]);
  }

  _onUpdateAbilitySearch(event) {
    event.preventDefault();

    this.abilitySearchString = event.currentTarget.value;
    this._updateAbilitySearch(event.currentTarget.closest('.window-content'));
  }

  _onToggleAbilityFilter(event) {
    event.preventDefault();
    event.currentTarget.classList.toggle('inactive');
    
    const filter = event.currentTarget.dataset.filter;
    const index = this.abilityFilters.indexOf(filter);
    if (index == -1)
      this.abilityFilters.push(filter);
    else
      this.abilityFilters.splice(index, 1);

    this._applyAbilityFilters(event.currentTarget.closest('.window-content'));
  }

  _onToggleCollapsed(event) {
    event.preventDefault();

    let element = event.currentTarget;
    let parent = element.parentNode;
    let arrow = element.querySelector('.expand-arrow');
    let collapsible = parent.querySelector('.ability-collapsible-wrapper');

    if (arrow)
      arrow.classList.toggle('expanded');
    if (collapsible) {
      collapsible.style.setProperty('--collapse-height', '-' + parent.scrollHeight + 'px');
      collapsible.classList.toggle('expanded');
    }
  }

  _onToggleAbilityExpand(event) {
    event.preventDefault();

    const parent = event.currentTarget.parentNode;
    const abilityId = parent.dataset.itemId;
    const index = this.expandedAbilities.indexOf(abilityId);
    if (index == -1)
      this.expandedAbilities.push(abilityId);
    else
      this.expandedAbilities.splice(index, 1);

    const hiddenContent = parent.querySelector('.ability-hidden-toggle');

    if (hiddenContent) {
      hiddenContent.hidden = !hiddenContent.hidden;
    }
  }
  
  _onToggleEditMode(event) {
    event.preventDefault();

    this.submit();

    const editButton = event.currentTarget;
    editButton.classList.toggle('editing-glow');

    const sheet = editButton.closest('.app').querySelector('.window-content');
    sheet.classList.toggle('edit-mode');
    sheet.classList.toggle('normal-mode');
    this._updateEditMode(sheet);
  }

  _updateEditMode(sheet) {
    if (!sheet.classList.contains('normal-mode') && !sheet.classList.contains('edit-mode')) {
      sheet.classList.add('normal-mode');
    }

    const inputs = sheet.querySelectorAll('input.edit-mode-input');
    let editMode = sheet.classList.contains('edit-mode');
    
    inputs.forEach(input => {
      input.disabled = !editMode;
    });
  }

  _swapAbilities(sheet, first, second) {

    first.parentNode.insertBefore(second, first);
    let firstIndex = first.dataset.abilityIndex;
    first.dataset.abilityIndex = second.dataset.abilityIndex;
    second.dataset.abilityIndex = firstIndex;
    this._disableAbilityArrows(sheet);

    const updateData = Array.from(first.parentNode.children).map((child) => ({sort: child.dataset.abilityIndex, _id: child.dataset.itemId}));

    this.skipRender = true;
    this.actor.updateEmbeddedDocuments('Item', updateData);
  }

  _onAbilityMoveUp(event) {
    event.preventDefault();

    const source = event.currentTarget.closest('.ability-sheet');
    const sourceIndex = parseInt(source.dataset.abilityIndex);
    const target = source.parentNode.querySelector(`[data-ability-index='${sourceIndex - 1}']`);
    if (!target) {
      event.stopPropagation();
      return;
    }

    const sheet = event.currentTarget.closest('.window-content')
    this._swapAbilities(sheet, target, source);

    event.stopPropagation();
  }

  _onAbilityMoveDown(event) {
    event.preventDefault();

    const source = event.currentTarget.closest('.ability-sheet');
    const sourceIndex = parseInt(source.dataset.abilityIndex);
    const target = source.parentNode.querySelector(`[data-ability-index='${sourceIndex + 1}']`);
    if (!target) {
      event.stopPropagation();
      return;
    }

    const sheet = event.currentTarget.closest('.window-content')
    this._swapAbilities(sheet, source, target);

    event.stopPropagation();
  }

  _onAbilityEdit(event) {
    event.preventDefault();
    
    const abilitySheet = event.currentTarget.closest('.ability-sheet');
    const item = this.actor.items.get(abilitySheet.dataset.itemId);
    item.sheet.render(true, {fromActorSheet: true});

    event.stopPropagation();
  }

  _onAbilityDelete(event) {
    event.preventDefault();

    const abilitySheet = event.currentTarget.closest('.ability-sheet');
    const item = this.actor.items.get(abilitySheet.dataset.itemId);
    Dialog.confirm({
      title: `Delete ${item.name}`,
      content: `<h4>Are you sure?</h4>`,
      yes: () => {
        this.actor.deleteEmbeddedDocuments('Item', [item._id]);
      },
      options: {}
    });

    event.stopPropagation();
  }

  _disableAbilityArrows(sheet) {
    sheet.querySelectorAll('.ability-list').forEach((list) => {
      const abilities = list.querySelector('.ability-collapsible-wrapper').children;
      if (abilities.length == 0) return;

      // Remove all gray arrows before adding the ones we need
      list.querySelectorAll('.gray-out').forEach((arrow) => {
        arrow.classList.remove('gray-out');
      });

      abilities[0].querySelector('.ability-up').classList.add('gray-out');
      abilities[abilities.length - 1].querySelector('.ability-down').classList.add('gray-out');
    });
  }

  _applyAbilityFilters(sheet) {
    if (!this.abilityFilters) this.abilityFilters = [];

    sheet.querySelectorAll('.ability-filter').forEach((filter) => {
      if (this.abilityFilters.indexOf(filter.dataset.filter) > -1) {
        filter.classList.remove('inactive');
      }
      else {
        filter.classList.add('inactive');
      }
    });

    sheet.querySelectorAll('.ability-sheet').forEach((abilitySheet) => {
      const ability = this.actor.items.get(abilitySheet.dataset.itemId);
      let actionType = ability.system.actionType;
      if (actionType.startsWith('free'))
        actionType = 'free';
      abilitySheet.dataset.filterHidden = (this.abilityFilters.indexOf(actionType) == -1) && (this.abilityFilters.length > 0);
      abilitySheet.hidden =  (abilitySheet.dataset.filterHidden == 'true' || abilitySheet.dataset.searchHidden == 'true');
    });
  }

  _applyAbilityExpand(sheet) {
    if (!this.expandedAbilities) this.expandedAbilities = [];

    sheet.querySelectorAll('.ability-sheet').forEach((abilitySheet) => {
      const abilityBody = abilitySheet.querySelector('.ability-hidden-toggle');
      abilityBody.hidden = (this.expandedAbilities.indexOf(abilitySheet.dataset.itemId) == -1);
    });
  }

  _updateAbilitySearch(sheet) {
    if (!this.abilitySearchString) this.abilitySearchString = '';

    sheet.querySelectorAll('.ability-sheet').forEach((abilitySheet) => {
      const ability = this.actor.items.get(abilitySheet.dataset.itemId);
      abilitySheet.dataset.searchHidden = !ability.name.toLowerCase().includes(this.abilitySearchString.toLowerCase());
      abilitySheet.hidden =  (abilitySheet.dataset.filterHidden == 'true' || abilitySheet.dataset.searchHidden == 'true');
    });
  }

  /** @override */
  async _render(force=false, options={}) {
    if (this.skipRender) {
      this.skipRender = false;
      return;
    }
    await super._render(force, options);
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

  /** @override */
  async _onChangeInput(event) {
    if (event.currentTarget.matches('.search-bar')) {
      return;
    }

    return super._onChangeInput(event);
  }
}
