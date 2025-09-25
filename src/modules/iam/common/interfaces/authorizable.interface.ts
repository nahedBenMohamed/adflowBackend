import { type AuthorizableObject } from '../types/authorizable-object';

export interface Authorizable {
  getAuthorizableObject(): AuthorizableObject;
}
