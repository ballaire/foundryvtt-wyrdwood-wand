export const WYRDWOOD_WAND = {};


WYRDWOOD_WAND.weaponTypes = {
  unarmed: 'WW.Item.Weapon.WeaponTypes.unarmed',
  meleeImprovised: 'WW.Item.Weapon.WeaponTypes.meleeImprovised',
  meleeBalanced: 'WW.Item.Weapon.WeaponTypes.meleeBalanced',
  meleeHeavy: 'WW.Item.Weapon.WeaponTypes.meleeHeavy',
  meleeLight: 'WW.Item.Weapon.WeaponTypes.meleeLight',
  rangedSmall: 'WW.Item.Weapon.WeaponTypes.rangedSmall',
  rangedLarge: 'WW.Item.Weapon.WeaponTypes.rangedLarge',
}

WYRDWOOD_WAND.actionTypes = {
  quick: 'WW.Item.Ability.ActionType.quick.long',
  slow: 'WW.Item.Ability.ActionType.slow.long',
  freeAction: 'WW.Item.Ability.ActionType.freeAction.long',
  freeInterrupt: 'WW.Item.Ability.ActionType.freeInterrupt.long',
  ritual: 'WW.Item.Ability.ActionType.ritual.long',
}

WYRDWOOD_WAND.abilityTypes = {
  basic: 'TYPES.Item.basicAction',
  technique: 'TYPES.Item.technique',
  rite: 'TYPES.Item.rite',
}

WYRDWOOD_WAND.attackVersus = {
  none: '',
  evasion: 'WW.Actor.AttackVS.evasion',
  resolve: 'WW.Actor.AttackVS.resolve',
  tenacity: 'WW.Actor.AttackVS.tenacity',
}
