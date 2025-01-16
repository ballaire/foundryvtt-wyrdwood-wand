import WyrdwoodWandActorBase from "./base-actor.mjs";

export default class WyrdwoodWandCharacter extends WyrdwoodWandActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.role = new fields.StringField({ required: true });
    schema.background1 = new fields.StringField({ required: true });
    schema.background2 = new fields.StringField({ required: true });

    return schema;
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