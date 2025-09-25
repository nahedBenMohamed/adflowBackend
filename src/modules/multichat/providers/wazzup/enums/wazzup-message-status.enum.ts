/**
 * Enum representing the status of messages as reported by webhooks in the Wazzup system.
 * Each status correlates to a specific state in the message delivery process.
 */
export enum WazzupMessageStatus {
  /** Message has been sent (indicated by one grey check mark). */
  Sent = 'sent',

  /** Message has been delivered to the recipient's device (indicated by two grey check marks). */
  Delivered = 'delivered',

  /** Message has been read by the recipient (indicated by two blue check marks). */
  Read = 'read',

  /** There was an error in sending the message. */
  Error = 'error',

  /** Incoming message from another user. */
  Inbound = 'inbound',
}
