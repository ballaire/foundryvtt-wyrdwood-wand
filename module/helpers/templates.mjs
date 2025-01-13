/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    'systems/wyrdwood-wand/templates/actor/parts/actor-stats.hbs',
    'systems/wyrdwood-wand/templates/actor/parts/actor-actions.hbs',
    'systems/wyrdwood-wand/templates/actor/parts/actor-equipment.hbs',
    'systems/wyrdwood-wand/templates/actor/parts/actor-effects.hbs',
    'systems/wyrdwood-wand/templates/actor/parts/actor-biography.hbs',
    'systems/wyrdwood-wand/templates/actor/parts/actor-feature.hbs',
    // Item partials
    'systems/wyrdwood-wand/templates/item/parts/item-effects.hbs',
  ]);
};
