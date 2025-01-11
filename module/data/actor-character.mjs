import WyrdwoodWandActorBase from "./base-actor.mjs";

export default class WyrdwoodWandCharacter extends WyrdwoodWandActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.role = new fields.StringField({ required: true, nullable: false })

    return schema;
  }

  prepareDerivedData() {
    super.prepareDerivedData()
  }

  getRollData() {
    const data = {};

    return data
  }
}