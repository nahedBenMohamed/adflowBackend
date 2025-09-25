export class DepartmentDeletedEvent {
  accountId: number;
  departmentId: number;
  newDepartmentId?: number | null;

  constructor({ accountId, departmentId, newDepartmentId }: DepartmentDeletedEvent) {
    this.accountId = accountId;
    this.departmentId = departmentId;
    this.newDepartmentId = newDepartmentId;
  }
}
