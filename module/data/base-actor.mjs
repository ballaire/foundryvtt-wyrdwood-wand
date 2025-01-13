import WyrdwoodWandDataModel from "./base-model.mjs";

export default class WyrdwoodWandActorBase extends WyrdwoodWandDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    schema.name = new fields.StringField({ required: true });
    schema.description = new fields.StringField({ required: true });

    schema.health = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 10, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 10 })
    });
    schema.destiny = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 20, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 20 })
    });
    schema.aether = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 2, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 2 })
    });
    schema.recoveries = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 4, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 4 })
    });

    schema.level = new fields.NumberField({ ...requiredInteger, initial: 1 });

    schema.agility = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.focus = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.strength = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.evasionBonus = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.resolveBonus = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.tenacityBonus = new fields.NumberField({ ...requiredInteger, initial: 0 });

    return schema;
  }

  prepareDerivedData() {
    this.evasion = 10 + this.agility + this.evasionBonus;
    this.resolve = 10 + this.focus + this.resolveBonus;
    this.tenacity = 10 + this.strength + this.tenacityBonus;
  }
}