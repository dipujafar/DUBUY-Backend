export const statusEnum = [
  'request',
  'pending',
  'accepted',
  'rejected',
  'delivered',
];
export const DISPLAY_STATUS = [
  'Requested',
  'Received Quotation',
  'On Progress',
  'In Transit',
  'In Warehouse',
  'Ready To Collect',
  'Completed',
];

export const SHIPPING_STEPS = [
  'pending',
  'payment_receive',
  'purchased_in_UAE',
  'in_warehouse',
  'shipped_to_libya',
  'arrived_item_image',
  'ready_to_collect',
  'completed',
] as const;
