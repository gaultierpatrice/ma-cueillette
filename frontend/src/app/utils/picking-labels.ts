export type PickingLabelValue =
  | 'AB'
  | 'BIO_EUROPEEN'
  | 'DEMETER'
  | 'NATURE_ET_PROGRES'
  | 'BIO_COHERENCE'
  | 'HVE_NIVEAU_1'
  | 'HVE_NIVEAU_2'
  | 'HVE_NIVEAU_3'
  | 'BEE_FRIENDLY'
  | 'ZERO_RESIDU_PESTICIDES'
  | 'VERGERS_ECORESPONSABLES'
  | 'BIENVENUE_A_LA_FERME'
  | 'PRODUCTEURS_FERMIERS'
  | 'PRODUIT_EN_BRETAGNE'
  | 'AGRI_ETHIQUE'
  | 'FAIR_FOR_LIFE'
  | 'BIOPARTENAIRE'
  | 'GLOBAL_GAP'
  | 'RAINFOREST_ALLIANCE'
  | 'CONVERSION_BIO';

export const PICKING_LABEL_VALUES: PickingLabelValue[] = [
  'AB',
  'BIO_EUROPEEN',
  'DEMETER',
  'NATURE_ET_PROGRES',
  'BIO_COHERENCE',
  'HVE_NIVEAU_1',
  'HVE_NIVEAU_2',
  'HVE_NIVEAU_3',
  'BEE_FRIENDLY',
  'ZERO_RESIDU_PESTICIDES',
  'VERGERS_ECORESPONSABLES',
  'BIENVENUE_A_LA_FERME',
  'PRODUCTEURS_FERMIERS',
  'PRODUIT_EN_BRETAGNE',
  'AGRI_ETHIQUE',
  'FAIR_FOR_LIFE',
  'BIOPARTENAIRE',
  'GLOBAL_GAP',
  'RAINFOREST_ALLIANCE',
  'CONVERSION_BIO',
];

const LABEL_DISPLAY: Record<PickingLabelValue, string> = {
  AB: 'AB (Agriculture Biologique)',
  BIO_EUROPEEN: 'Bio européen (Eurofeuille)',
  DEMETER: 'Demeter, Agriculture biodynamique',
  NATURE_ET_PROGRES: 'Nature & Progrès',
  BIO_COHERENCE: 'Bio Cohérence',
  HVE_NIVEAU_1: 'Haute Valeur Environnementale niveau 1',
  HVE_NIVEAU_2: 'Haute Valeur Environnementale niveau 2',
  HVE_NIVEAU_3: 'Haute Valeur Environnementale niveau 3',
  BEE_FRIENDLY: 'Bee Friendly',
  ZERO_RESIDU_PESTICIDES: 'Zéro Résidu de Pesticides',
  VERGERS_ECORESPONSABLES: 'Vergers Écoresponsables',
  BIENVENUE_A_LA_FERME: 'Bienvenue à la ferme',
  PRODUCTEURS_FERMIERS: 'Producteurs fermiers',
  PRODUIT_EN_BRETAGNE: 'Produit en Bretagne',
  AGRI_ETHIQUE: 'Agri-Éthique',
  FAIR_FOR_LIFE: 'Fair for Life',
  BIOPARTENAIRE: 'Biopartenaire',
  GLOBAL_GAP: 'GlobalGAP',
  RAINFOREST_ALLIANCE: 'Rainforest Alliance',
  CONVERSION_BIO: 'Conversion bio',
};

export const LABEL_OPTIONS = PICKING_LABEL_VALUES.map((value) => ({
  value,
  label: LABEL_DISPLAY[value],
}));

export function translatePickingLabel(label: string): string {
  return LABEL_DISPLAY[label as PickingLabelValue] ?? label;
}
