/**
 * Enum representing different types of chat channels supported in the Wazzup system.
 * Each member specifies a unique platform and type of chat interaction.
 */
export enum WazzupChatType {
  /** WhatsApp individual chat. */
  Whatsapp = 'whatsapp',
  /** WhatsApp group chat. */
  Whatsgroup = 'whatsgroup',
  /** Instagram direct messages. */
  Instagram = 'instagram',
  /** Telegram individual chat. */
  Telegram = 'telegram',
  /** Telegram group chat. */
  Telegroup = 'telegroup',
  /** Vkontakte (VK) messaging. */
  Vk = 'vk',
  /** Avito messaging system. */
  Avito = 'avito',
}
