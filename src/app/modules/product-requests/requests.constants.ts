export const statusEnum = [
  'request',
  'pending',
  'accepted',
  'rejected',
  'delivered',
];

export const SHIPPING_STEPS = [
  'request',
  'pending',
  'payment_receive',
  'purchased_in_UAE',
  'in_warehouse',
  'shipped_to_libya',
  'arrived_item_image',
  'ready_to_collect',
  'completed',
] as const;
