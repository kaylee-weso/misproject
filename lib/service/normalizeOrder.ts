export function normalizeOrderApi(order: any) {
  return {
    orderId: order.order_id ?? null,
    createdDate: order.created_date ?? null,
    scheduledPickupDate: order.scheduled_pickup_date ?? null,
    actualPickupDate: order.actual_pickup_date ?? null,
    vendorOrderId: order.vendor_order_id ?? null,
    pickupContact: order.pickup_contact ?? null,
    completedDate: order.completed_date ?? null,
    company: order.company ?? null,
    address: order.address ?? null,
  };
}

// Also export the step function so it's centralized
export function getFirstIncompleteStep(order: any) {
  if (!order.company || !order.address || !order.scheduledPickupDate) return 1; // Schedule
  if (!order.actualPickupDate || !order.vendorOrderId || !order.pickupContact) return 2; // Confirm
  if (!order.completedDate) return 3; // Complete
  return 4; // All done
}