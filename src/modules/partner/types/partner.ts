export class Partner {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  password: string;
  ref: string | null;
  commission: number;

  constructor(
    id: number,
    name: string,
    email: string,
    phone: string | null,
    password: string,
    ref: string,
    commission: number,
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.password = password;
    this.ref = ref;
    this.commission = commission;
  }
}
