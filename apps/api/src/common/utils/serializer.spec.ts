import {
  sanitizePublicProduct,
  sanitizePublicRefurbished,
  sanitizeCustomerRepairBooking,
  sanitizeUser,
} from './serializer.util';

describe('Serializer Security & Privacy Invariants', () => {
  it('strips costPrice from public product payloads and computes stock availability', () => {
    const rawProduct = {
      id: 'prod-1',
      sku: 'KI-LAP-001',
      name: 'Dell Latitude 3440',
      costPrice: 52500,
      sellingPrice: 61900,
      mrpPrice: 68990,
      inventory: {
        quantity: 5,
        reservedQuantity: 2,
        lowStockThreshold: 3,
      },
    };

    const result = sanitizePublicProduct(rawProduct) as Record<string, any>;
    expect(result.costPrice).toBeUndefined();
    expect(result.sellingPrice).toBe(61900);
    expect(result.availableQuantity).toBe(3);
    expect(result.inStock).toBe(true);
    expect(result.inventory.lowStock).toBe(true);
  });

  it('strips acquisitionCost, refurbishmentCost, and acquisitionSource from public refurbished devices', () => {
    const rawDevice = {
      id: 'ref-1',
      deviceCode: 'REF-2026-001',
      title: 'ThinkPad T490',
      acquisitionCost: 19500,
      refurbishmentCost: 3200,
      acquisitionSource: 'Corporate Lease',
      sellingPrice: 28900,
      status: 'PUBLISHED',
    };

    const result = sanitizePublicRefurbished(rawDevice) as Record<string, any>;
    expect(result.acquisitionCost).toBeUndefined();
    expect(result.refurbishmentCost).toBeUndefined();
    expect(result.acquisitionSource).toBeUndefined();
    expect(result.sellingPrice).toBe(28900);
    expect(result.available).toBe(true);
  });

  it('strips internalNotes and per-update internalNote from customer repair bookings', () => {
    const rawBooking = {
      id: 'rep-1',
      reference: 'REP-20261117-A101',
      internalNotes: 'Private bench technician note',
      updates: [
        {
          id: 'u-1',
          status: 'DIAGNOSING',
          customerVisibleMessage: 'Inspecting motherboard',
          internalNote: 'Replace PQ301 capacitor',
        },
      ],
      quotations: [],
    };

    const result = sanitizeCustomerRepairBooking(rawBooking) as Record<string, any>;
    expect(result.internalNotes).toBeUndefined();
    expect(result.updates[0].customerVisibleMessage).toBe('Inspecting motherboard');
    expect(result.updates[0].internalNote).toBeUndefined();
  });

  it('strips passwordHash and flattens role names on user serialization', () => {
    const rawUser = {
      id: 'u-1',
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      passwordHash: '$2a$12$secretHash',
      userRoles: [{ role: { name: 'CUSTOMER' } }],
    };

    const result = sanitizeUser(rawUser) as Record<string, any>;
    expect(result.passwordHash).toBeUndefined();
    expect(result.roles).toEqual(['CUSTOMER']);
  });
});
