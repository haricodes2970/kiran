export enum EmailEventType {
  CUSTOMER_REGISTRATION_VERIFICATION = 'CUSTOMER_REGISTRATION_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  ORDER_REQUEST_CONFIRMATION = 'ORDER_REQUEST_CONFIRMATION',
  ORDER_STATUS_UPDATE = 'ORDER_STATUS_UPDATE',
  REPAIR_BOOKING_CONFIRMATION = 'REPAIR_BOOKING_CONFIRMATION',
  REPAIR_STATUS_UPDATE = 'REPAIR_STATUS_UPDATE',
  QUOTATION_NOTIFICATION = 'QUOTATION_NOTIFICATION',
  QUOTATION_APPROVAL_CONFIRMATION = 'QUOTATION_APPROVAL_CONFIRMATION',
  ADMIN_ENQUIRY_NOTIFICATION = 'ADMIN_ENQUIRY_NOTIFICATION',
}

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey?: string;
}

export interface EmailSendResult {
  success: boolean;
  provider: string;
  messageId?: string;
  sandboxed: boolean;
  error?: string;
}

export interface EmailProvider {
  readonly name: string;
  send(message: EmailMessage): Promise<EmailSendResult>;
}
