/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class WyrdwoodWandItem extends Item {

  chatTemplates = {
    'ability': 'systems/wyrdwood-wand/templates/item/parts/ability-card.hbs',
  };

  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();
  }

  /**
   * Prepare a data object which defines the data schema used by dice roll commands against this Item
   * @override
   */
  getRollData() {
    const rollData = { ...this.system };

    if (this.actor) rollData.actor = this.actor.getRollData();

    return rollData;
  }

  /**
   * Convert the actor document to a plain object.
   *
   * The built in `toObject()` method will ignore derived data when using Data Models.
   * This additional method will instead use the spread operator to return a simplified
   * version of the data.
   *
   * @returns {object} Plain object either via deepClone or the spread operator.
   */
  toPlainObject() {
    const result = { ...this };

    // Simplify system data.
    result.system = this.system.toPlainObject();

    // Add effects.
    result.effects = this.effects?.size > 0 ? this.effects.contents : [];

    return result;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   */
  async roll() {
    let chatData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
    }

    let cardData = {
      ...this
    };

    chatData.content = await renderTemplate(this.chatTemplates[this.type], cardData);
    chatData.roll = true;

    return ChatMessage.create(chatData);
  }
}
