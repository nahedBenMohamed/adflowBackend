export interface VoximplantSIPRegistration {
  /**
   * The SIP registration ID
   */
  sipRegistrationId: number;
  /**
   * The user name from sip proxy
   */
  sipUsername: string;
  /**
   * The sip proxy
   */
  proxy: string;
  /**
   * The last time updated
   */
  lastUpdated: number;
  /**
   * The SIP authentications user
   */
  authUser?: string;
  /**
   * The outbound proxy
   */
  outboundProxy?: string;
  /**
   * The successful SIP registration
   */
  successful?: boolean;
  /**
   * The status code from a SIP registration
   */
  statusCode?: number;
  /**
   * The error message from a SIP registration
   */
  errorMessage?: string;
  /**
   * The subscription deactivation flag. The SIP registration is frozen if true
   */
  deactivated: boolean;
  /**
   * The next subscription renewal date in format: YYYY-MM-DD
   */
  nextSubscriptionRenewal: Date;
  /**
   * The purchase date in 24-h format: YYYY-MM-DD HH:mm:ss
   */
  purchaseDate: Date;
  /**
   * The subscription monthly charge
   */
  subscriptionPrice: string;
  /**
   * SIP registration is persistent. Set false to activate it only on the user login
   */
  isPersistent: boolean;
  /**
   * The id of the bound user
   */
  userId?: number;
  /**
   * The name of the bound user
   */
  userName?: string;
  /**
   * The id of the bound application
   */
  applicationId?: number;
  /**
   * The name of the bound application
   */
  applicationName?: string;
  /**
   * The id of the bound rule
   */
  ruleId?: number;
  /**
   * The name of the bound rule
   */
  ruleName?: string;
}
