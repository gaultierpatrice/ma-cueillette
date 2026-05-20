export type PickingLabelValue =
  | 'ORGANIC'
  | 'LOCAL'
  | 'FAIR_TRADE'
  | 'BIO'
  | 'ZERO_PESTICIDE';

export const PICKING_LABEL_VALUES: PickingLabelValue[] = [
  'ORGANIC',
  'LOCAL',
  'FAIR_TRADE',
  'BIO',
  'ZERO_PESTICIDE',
];

const LABEL_DISPLAY: Record<PickingLabelValue, string> = {
  ORGANIC: 'Bio (agriculture biologique)',
  LOCAL: 'Local',
  FAIR_TRADE: 'Commerce équitable',
  BIO: 'Bio',
  ZERO_PESTICIDE: 'Zéro pesticide',
};

export const LABEL_OPTIONS = PICKING_LABEL_VALUES.map((value) => ({
  value,
  label: LABEL_DISPLAY[value],
}));

export function translatePickingLabel(label: string): string {
  return LABEL_DISPLAY[label as PickingLabelValue] ?? label;
}
