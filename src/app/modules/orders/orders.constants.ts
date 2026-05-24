export const orderStatus = {
  on_progress: 'on_progress',
  completed: 'completed',
  canceled: 'canceled',
};

export const ORDER_STATUS = [
  orderStatus.on_progress,
  orderStatus.completed,
  orderStatus.canceled,
] as const;

export const orderDisplayStatus = {
  on_progress: 'On Progress',
  payment_request: 'Payment Request',
  reject_payment_request: 'Reject Payment Request',
  in_transit: 'In Transit',
  in_warehouse: 'In Warehouse',
  ready_to_collect: 'Ready To Collect',
  completed: 'Completed',
} as const;

export const ORDER_DISPLAY_STATUS = [
  orderDisplayStatus.on_progress,
  orderDisplayStatus.payment_request,
  orderDisplayStatus.reject_payment_request,
  orderDisplayStatus.in_transit,
  orderDisplayStatus.in_warehouse,
  orderDisplayStatus.ready_to_collect,
  orderDisplayStatus.completed,
] as const;

export const shippingSteps = {
  payment_receive: 'Payment Receive',
  purchased_in_UAE: 'Purchased in UAE',
  in_dubai_warehouse: 'In Warehouse',
  shipped_to_libya: 'Shipped to Libya',
  in_libya_warehouse: 'In Libya Warehouse',
  payment_75_received: 'Payment 75% Received',
  arrived_item_image: 'Arrived Item Image',
  ready_to_collect: 'Ready To Collect',
  completed: 'Completed',
} as const;

export const SHIPPING_STEPS = [
  shippingSteps.payment_receive,
  shippingSteps.purchased_in_UAE,
  shippingSteps.in_dubai_warehouse,
  shippingSteps.shipped_to_libya,
  shippingSteps.in_libya_warehouse,
  shippingSteps.payment_75_received,
  shippingSteps.arrived_item_image,
  shippingSteps.ready_to_collect,
  shippingSteps.completed,
] as const;
