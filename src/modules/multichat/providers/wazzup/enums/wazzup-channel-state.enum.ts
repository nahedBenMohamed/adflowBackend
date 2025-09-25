/**
 * Enum for defining the states of a channel in the Wazzup system.
 * Each state describes the current operational status or issues affecting the channel.
 */
export enum WazzupChannelState {
  /** channel is active */
  active = 'active',
  /** channel is starting */
  init = 'init',
  /** the channel is turned off: it was removed from subscription or deleted with messages saved */
  disabled = 'disabled',
  /** no connection to the phone */
  phoneUnavailable = 'phoneUnavailable',
  /** QR code must be scanned */
  qridle = 'qridle',
  /** the channel is authorized in another Wazzup account */
  openelsewhere = 'openelsewhere',
  /** the channel is not pai */
  notEnoughMoney = 'notEnoughMoney',
  /** channel QR was scanned by another phone number */
  foreignphone = 'foreignphone',
  /** not authorized */
  unauthorized = 'unauthorized',
  /** channel is waiting for a password for two-factor authentication */
  waitForPassword = 'waitForPassword',
  /** the channel is blocked */
  blocked = 'blocked',
  /** the WABA channel is in moderation */
  onModeration = 'onModeration',
  /** the WABA channel is rejected */
  rejected = 'rejected',
}
