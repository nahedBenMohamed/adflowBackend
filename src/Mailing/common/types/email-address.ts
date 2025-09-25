export interface EmailAddressValue {
  address?: string;
  name?: string;
}

export interface EmailAddress {
  text: string;
  values: EmailAddressValue[];
}
