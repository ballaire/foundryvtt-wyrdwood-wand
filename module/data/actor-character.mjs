import WyrdwoodWandActorBase from "./base-actor.mjs";

export default class WyrdwoodWandCharacter extends WyrdwoodWandActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      ...super.defineSchema(),
      role: new fields.StringField({ required: true }),
      background1: new fields.StringField({ required: true }),
      background2: new fields.StringField({ required: true }),
    }
  }

  prepareDerivedData() {
    super.prepareDerivedData();

    this.prowess = Math.floor(this.level / 2);
  }

  getRollData() {
    const data = {};

    return data;
  }
}