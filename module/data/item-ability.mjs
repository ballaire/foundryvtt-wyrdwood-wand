import WyrdwoodWandItemBase from "./base-item.mjs";

export default class WyrdwoodWandAbility extends WyrdwoodWandItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      ...super.defineSchema(),

      flavorDescription: new fields.StringField(),
      abilityType: new fields.StringField({required: true, initial: 'basic'}),
      actionType: new fields.StringField({required: true, initial: 'quick'}),

      target: new fields.StringField(),
      range: new fields.NumberField({initial: 0, min: 0}),
      attackVs: new fields.StringField({required: true, initial: 'none'}),

      sections: new fields.ArrayField(
        new fields.SchemaField({
          title: new fields.StringField({required: true, nullable: true, initial: null}),
          description: new fields.StringField({required: true, nullable: true, initial: null}),
          bullet: new fields.BooleanField({required: true, initial: false}),
          indent: new fields.NumberField({required: true, initial: 0, min: 0}),
          background: new fields.StringField({required: true, initial: 'blank'}),
        })
      ),

    };
  }
}