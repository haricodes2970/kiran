export enum WhatsAppEventType {
  NEW_ORDER_REQUEST = 'NEW_ORDER_REQUEST',
  ORDER_STATUS_CHANGE = 'ORDER_STATUS_CHANGE',
  REPAIR_BOOKING_CONFIRMATION = 'REPAIR_BOOKING_CONFIRMATION',
  REPAIR_STATUS_CHANGE = 'REPAIR_STATUS_CHANGE',
  QUOTATION_AVAILABLE = 'QUOTATION_AVAILABLE',
  QUOTATION_APPROVED = 'QUOTATION_APPROVED',
  BUYBACK_EVALUATION_UPDATE = 'BUYBACK_EVALUATION_UPDATE',
  ADMIN_NEW_ENQUIRY = 'ADMIN_NEW_ENQUIRY',
}

export interface WhatsAppTemplatePayload {
  toPhone: string;
  templateName: string;
  languageCode?: string;
  parameters: string[];
}

export interface WhatsAppSendResult {
  success: boolean;
  provider: string;
  messageId?: string;
  sandboxed: boolean;
  skippedReason?: string;
  error?: string;
}

export interface WhatsAppProvider {
  readonly name: string;
  sendTemplate(payload: WhatsAppTemplatePayload): Promise<WhatsAppSendResult>;
}
