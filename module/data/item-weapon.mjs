import WyrdwoodWandItemBase from "./base-item.mjs";

export default class WyrdwoodWandWeapon extends WyrdwoodWandItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.weaponType = new fields.StringField({required: true, nullable: true, initial: null});

    schema.formula = new fields.StringField({ blank: true });

    return schema;
  }

  prepareDerivedData() {
    // Build the formula dynamically using string interpolation
  }
}