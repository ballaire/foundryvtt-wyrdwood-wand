import WyrdwoodWandDataModel from "./base-model.mjs";

export default class WyrdwoodWandItemBase extends WyrdwoodWandDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      description: new fields.StringField({ required: true }),
    };
  }

}