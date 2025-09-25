/**
 * Enum representing the different types of messages that can be handled in the Wazzup system.
 * Each member specifies the format or nature of the message content.
 */
export enum WazzupMessageType {
  /** Text message. */
  Text = 'text',

  /** Image file. */
  Image = 'image',

  /** Audio file. */
  Audio = 'audio',

  /** Video file. */
  Video = 'video',

  /** Document file. */
  Document = 'document',

  /** Contact card (vCard format). */
  Vcard = 'vcard',

  /** Geolocation data. */
  Geo = 'geo',

  /** WhatsApp Business API template message. */
  WapiTemplate = 'wapi_template',

  /** Unsupported message type. */
  Unsupported = 'unsupported',

  /** Notification for a missed call. */
  MissingCall = 'missing_call',

  /** Message type that is not recognized or is erroneous. */
  Unknown = 'unknown',
}
