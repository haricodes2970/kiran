export function sanitizePublicProduct<T extends Record<string, any>>(product: T) {
  if (!product) return product;
  const { costPrice, ...safe } = product;
  const availableQuantity = product.inventory
    ? Math.max(0, product.inventory.quantity - product.inventory.reservedQuantity)
    : 0;
  return {
    ...safe,
    sellingPrice: Number(product.sellingPrice),
    mrpPrice: product.mrpPrice !== null && product.mrpPrice !== undefined ? Number(product.mrpPrice) : null,
    inStock: availableQuantity > 0,
    availableQuantity,
    inventory: product.inventory
      ? {
          availableQuantity,
          inStock: availableQuantity > 0,
          lowStock:
            availableQuantity > 0 &&
            availableQuantity <= product.inventory.lowStockThreshold,
        }
      : undefined,
  };
}

export function sanitizeAdminProduct<T extends Record<string, any>>(product: T) {
  if (!product) return product;
  const availableQuantity = product.inventory
    ? Math.max(0, product.inventory.quantity - product.inventory.reservedQuantity)
    : 0;
  return {
    ...product,
    costPrice: Number(product.costPrice),
    sellingPrice: Number(product.sellingPrice),
    mrpPrice: product.mrpPrice !== null && product.mrpPrice !== undefined ? Number(product.mrpPrice) : null,
    availableQuantity,
    inStock: availableQuantity > 0,
  };
}

export function sanitizePublicRefurbished<T extends Record<string, any>>(device: T) {
  if (!device) return device;
  const { acquisitionCost, refurbishmentCost, acquisitionSource, ...safe } = device;
  return {
    ...safe,
    sellingPrice: Number(device.sellingPrice),
    available: device.status === 'PUBLISHED',
  };
}

export function sanitizeAdminRefurbished<T extends Record<string, any>>(device: T) {
  if (!device) return device;
  return {
    ...device,
    acquisitionCost: Number(device.acquisitionCost),
    refurbishmentCost: Number(device.refurbishmentCost),
    sellingPrice: Number(device.sellingPrice),
    estimatedMargin:
      Number(device.sellingPrice) -
      (Number(device.acquisitionCost) + Number(device.refurbishmentCost)),
    available: device.status === 'PUBLISHED',
  };
}

export function sanitizeCustomerRepairBooking<T extends Record<string, any>>(booking: T) {
  if (!booking) return booking;
  const { internalNotes, ...safe } = booking;
  return {
    ...safe,
    updates: Array.isArray(booking.updates)
      ? booking.updates.map(({ internalNote, ...u }: Record<string, any>) => u)
      : undefined,
    quotations: Array.isArray(booking.quotations)
      ? booking.quotations.map((q: Record<string, any>) => ({
          ...q,
          partsCost: Number(q.partsCost),
          labourCost: Number(q.labourCost),
          taxAmount: Number(q.taxAmount),
          totalAmount: Number(q.totalAmount),
        }))
      : undefined,
  };
}

export function sanitizeUser<T extends Record<string, any>>(user: T) {
  if (!user) return user;
  const { passwordHash, userRoles, ...safe } = user;
  const roles = Array.isArray(userRoles)
    ? userRoles.map((ur: any) => ur.role?.name ?? ur.roleName).filter(Boolean)
    : user.roles || [];
  return {
    ...safe,
    roles,
  };
}
