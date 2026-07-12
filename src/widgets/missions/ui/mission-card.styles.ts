export type MissionSelectionVariant =
  | 'default'
  | 'selected'
  | 'specialSelected';

export const getMissionSelectionVariant = (
  selected: boolean,
  isSpecial: boolean,
): MissionSelectionVariant => {
  if (!selected) return 'default';
  return isSpecial ? 'specialSelected' : 'selected';
};

export const categoryBadgeStyles: Record<MissionSelectionVariant, string> = {
  default: 'bg-gray-100 text-gray-600',
  selected: 'bg-green-500 text-white',
  specialSelected: 'bg-special-text text-white',
};

export const titleStyles: Record<MissionSelectionVariant, string> = {
  default: 'text-gray-800',
  selected: 'text-green-500',
  specialSelected: 'text-special-text-color',
};
