export function riskRoll({actorData = null, attribute = null, bonus = 0, skillId = null} = {}) {
  let messageData = {
    speaker: ChatMessage.getSpeaker(),
  }
  if (attribute) {
    messageData.flavor = `${game.i18n.localize(`WW.Actor.Stats.${attribute}`)} ${game.i18n.localize('WW.Terms.risk')}`;
  }
  else {
    messageData.flavor = game.i18n.localize('WW.Terms.riskRoll');
  }

  let rollFormula = '1d20';
  if (skillId) {
    const skill = actorData.parent.items.get(skillId);
    if (skill.system.useCustom) {
      rollFormula += ` + ${skill.system.customFormula}`;
    }
    else {
      rollFormula += ' + 1d6';
    }
    messageData.flavor += ` — ${skill.name}`;
  }
  if (attribute) {
    rollFormula += ` + @${attribute}`;
  }
  else {
    rollFormula += ` + ${bonus}`;
  }

  let rollData = {
    ...actorData
  }

  new Roll(rollFormula, rollData).toMessage(messageData);
}