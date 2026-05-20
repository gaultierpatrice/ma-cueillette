import { matchesProductTypeFilter, pickingHasFruits, pickingHasVegetables } from './product-type';
import { Picking } from '../services/picking.types';

describe('product-type', () => {
  const basePicking: Picking = {
    id: 1,
    name: 'Farm',
    address: '1 rue',
    lat: 0,
    lng: 0,
  };

  it('detects fruits from hasFruits flag', () => {
    expect(pickingHasFruits({ ...basePicking, hasFruits: true })).toBe(true);
  });

  it('detects fruits from product type', () => {
    const picking = {
      ...basePicking,
      products: [{ id: 1, name: 'Apple', type: 'fruit' }],
    };
    expect(pickingHasFruits(picking)).toBe(true);
    expect(matchesProductTypeFilter(picking, 'fruit')).toBe(true);
  });

  it('detects vegetables from product type', () => {
    const picking = {
      ...basePicking,
      products: [{ id: 1, name: 'Carrot', type: 'vegetable' }],
    };
    expect(pickingHasVegetables(picking)).toBe(true);
    expect(matchesProductTypeFilter(picking, 'vegetable')).toBe(true);
    expect(matchesProductTypeFilter(picking, 'fruit')).toBe(false);
  });

  it('returns all pickings when filter is all', () => {
    expect(matchesProductTypeFilter(basePicking, 'all')).toBe(true);
  });
});
