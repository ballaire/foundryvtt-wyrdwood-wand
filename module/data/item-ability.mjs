import WyrdwoodWandItemBase from "./base-item.mjs";

export default class WyrdwoodWandAbility extends WyrdwoodWandItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      ...super.defineSchema(),

      aetherCost: new fields.BooleanField({required: true, initial: false}),
      flavorDescription: new fields.StringField(),
      abilityType: new fields.StringField({required: true, initial: 'basic'}),
      actionType: new fields.StringField({required: true, initial: 'quick'}),

      target: new fields.StringField(),
      range: new fields.StringField(),
      attackVs: new fields.StringField({required: true, initial: 'none'}),

      sections: new fields.ArrayField(
        new fields.SchemaField({
          editContent: new fields.StringField({required: true, nullable: true, initial: null}),
          displayContent: new fields.StringField({required: true, nullable: true, initial: null}),
          background: new fields.StringField({required: true, initial: 'blank'}),
        })
      ),

      footerLeftText: new fields.StringField({required: true}),
      footerRightText: new fields.StringField({required: true}),
    };
  }
}