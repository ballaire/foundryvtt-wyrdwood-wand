import WyrdwoodWandItemBase from "./base-item.mjs";

export default class WyrdwoodWandSkill extends WyrdwoodWandItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      ...super.defineSchema(),

      customFormula: new fields.StringField({required: true, initial: ''}),
      useCustom: new fields.BooleanField({required: true, initial: false}),
    };
  }
}