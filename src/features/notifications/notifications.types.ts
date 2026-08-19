export type NotificationTemplateKey =
  | 'order_confirmed'
  | 'production_started'
  | 'stage_halfway'
  | 'qc_passed'
  | 'ready_for_collection'
  | 'fabric_safety_seal'
  | 'activation_reminder'
  | 'countdown_daily'
  | 'urgent_message'
  | 'device_alert'
  | 'account_suspended'
  | 'account_reinstated'
  | 'role_changed';

export interface TemplateMeta {
  title: string;
  body: (payload: Record<string, string>) => string;
}

export const TEMPLATE_META: Record<NotificationTemplateKey, TemplateMeta> = {
  order_confirmed: {
    title: 'Order Confirmed',
    body: (p) => `Order for ${p.customerName ?? 'a customer'} has been confirmed.`,
  },
  production_started: {
    title: 'Production Started',
    body: (p) => `${p.garmentName ?? 'A garment'} is now in production.`,
  },
  stage_halfway: {
    title: 'Halfway There',
    body: (p) => `${p.garmentName ?? 'A garment'} is halfway through production.`,
  },
  qc_passed: {
    title: 'QC Passed',
    body: (p) => `Quality check passed for ${p.garmentName ?? 'a garment'}.`,
  },
  ready_for_collection: {
    title: 'Ready for Collection',
    body: (p) => `${p.garmentName ?? 'An order'} is ready for collection.`,
  },
  fabric_safety_seal: {
    title: 'Fabric Safety Seal',
    body: (p) => `Fabric seal code ${p.sealCode ?? ''} has been issued.`,
  },
  activation_reminder: {
    title: 'Activation Required',
    body: (p) => `${p.customerName ?? 'A customer'} needs to confirm their fabric/design.`,
  },
  countdown_daily: {
    title: 'Countdown Update',
    body: (p) => `${p.daysLeft ?? '?'} day(s) remaining until ${p.customerName ?? 'customer'}'s event.`,
  },
  urgent_message: {
    title: 'Urgent Message',
    body: (p) => p.messageBody ?? 'You have a new urgent message.',
  },
  device_alert: {
    title: 'New Device Login Detected',
    body: (p) => `A new device login was detected${p.detectedAt ? ` at ${new Date(p.detectedAt).toLocaleString()}` : ''}.`,
  },
  account_suspended: {
    title: 'Account Suspended',
    body: () => 'Your account has been suspended. Contact your account owner.',
  },
  account_reinstated: {
    title: 'Account Reinstated',
    body: () => 'Your account has been reinstated. You can log in again.',
  },
  role_changed: {
    title: 'Role Updated',
    body: (p) => `Your role has been updated to ${p.newRole ?? 'a new role'}.`,
  },
};
