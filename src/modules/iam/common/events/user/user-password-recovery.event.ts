export class UserPasswordRecoveryEvent {
  userEmail: string;
  userFullName: string;
  recoveryToken: string;

  constructor(data?: UserPasswordRecoveryEvent) {
    this.userEmail = data?.userEmail;
    this.userFullName = data?.userFullName;
    this.recoveryToken = data?.recoveryToken;
  }
}
