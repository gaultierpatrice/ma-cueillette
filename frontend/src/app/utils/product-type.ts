import { Picking } from '../services/picking.types';

export type ProductTypeFilter = 'all' | 'fruit' | 'vegetable';

export function isFruitType(type?: string): boolean {
  return type?.trim().toUpperCase() === 'FRUIT';
}

export function isVegetableType(type?: string): boolean {
  return type?.trim().toUpperCase() === 'VEGETABLE';
}

export function pickingHasFruits(picking: Picking): boolean {
  if (picking.hasFruits) {
    return true;
  }
  return picking.products?.some((p) => isFruitType(p.type)) ?? false;
}

export function pickingHasVegetables(picking: Picking): boolean {
  if (picking.hasVegetables) {
    return true;
  }
  return picking.products?.some((p) => isVegetableType(p.type)) ?? false;
}

export function matchesProductTypeFilter(
  picking: Picking,
  filter: ProductTypeFilter,
): boolean {
  if (filter === 'all') {
    return true;
  }
  if (filter === 'fruit') {
    return pickingHasFruits(picking);
  }
  return pickingHasVegetables(picking);
}
