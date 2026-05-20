export const status = {
  on_progress: 'on_progress',
  completed: 'completed',
  canceled: 'canceled',
};

export const displayStatus = {
  on_progress: 'On Progress',
  in_transit: 'In Transit',
  in_warehouse: 'In Warehouse',
  ready_to_collect: 'Ready To Collect',
  completed: 'Completed',
} as const;

export const DISPLAY_STATUS = [
  displayStatus.on_progress,
  displayStatus.in_transit,
  displayStatus.in_warehouse,
  displayStatus.ready_to_collect,
  displayStatus.completed,
] as const;

export const shippingSteps = {
  payment_receive: 'payment_receive',
  purchased_in_UAE: 'purchased_in_UAE',
  in_warehouse: 'in_warehouse',
  shipped_to_libya: 'shipped_to_libya',
  arrived_item_image: 'arrived_item_image',
  ready_to_collect: 'ready_to_collect',
  completed: 'completed',
} as const;

export const SHIPPING_STEPS = [
  shippingSteps.payment_receive,
  shippingSteps.purchased_in_UAE,
  shippingSteps.in_warehouse,
  shippingSteps.shipped_to_libya,
  shippingSteps.arrived_item_image,
  shippingSteps.ready_to_collect,
  shippingSteps.completed,
] as const;
