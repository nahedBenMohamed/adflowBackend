import { type Authorizable } from '../interfaces/authorizable.interface';
import { type AuthorizableObject } from './authorizable-object';

export class SimpleAuthorizable implements Authorizable {
  constructor(private readonly _data: AuthorizableObject) {}

  getAuthorizableObject(): AuthorizableObject {
    return this._data;
  }
}
