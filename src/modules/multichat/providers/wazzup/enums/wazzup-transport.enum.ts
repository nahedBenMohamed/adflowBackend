/**
 * Enum for specifying the transport type for messages in the Wazzup system.
 * Each member of the enum represents a different platform through which
 * messages can be sent or received.
 */
export enum WazzupTransport {
  /** WhatsApp channel */
  Whatsapp = 'whatsapp',
  /** Instagram channel */
  Instagram = 'instagram',
  /** Telegram channel */
  Tgapi = 'tgapi',
  /** WABA channel */
  Wapi = 'wapi',
  /** Telegram Bot channel */
  Telegram = 'telegram',
  /** VK channel */
  Vk = 'vk',
  /** Avito channel */
  Avito = 'avito',
}
