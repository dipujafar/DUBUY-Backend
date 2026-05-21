export const status = {
  request: 'request',
  quotation: 'quotation',
  accepted: 'accepted',
  rejected: 'rejected',
} as const;

export const statusEnum = [
  status.request,
  status.quotation,
  status.accepted,
  status.rejected,
] as const;

export const displayStatus = {
  requested: 'Under Review',
  received_quotation: 'Received Quotation',
  rejected_quotation: 'Rejected Quotation',
  payment_request: 'Payment Request',
  reject_payment_request: 'Reject Payment Request',
  on_progress: 'On Progress',
  completed: 'Completed',
} as const;

export const DISPLAY_STATUS = [
  displayStatus.requested,
  displayStatus.received_quotation,
  displayStatus.rejected_quotation,
  displayStatus.payment_request,
  displayStatus.reject_payment_request,
  displayStatus.on_progress,
  displayStatus.completed,
] as const;
