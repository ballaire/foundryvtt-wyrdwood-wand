import WyrdwoodWandActorBase from "./base-actor.mjs";

export default class WyrdwoodWandNPC extends WyrdwoodWandActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.prowess = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.rank = new fields.StringField({ required: true, initial: 'minion' });
    schema.type = new fields.StringField({ required: true, initial: 'human' });
    schema.movementType = new fields.StringField({ required: true, initial: 'standard' });
    schema.visionType = new fields.StringField({ required: true, initial: 'standard' });
    
    return schema;
  }

  prepareDerivedData() {
  }

  getRollData() {
    const data = {};

    return data
  }
}