export interface AuthorizableObject {
  type: string;
  id: number | null;
  ownerId?: number;
  departmentId?: number;
  createdBy?: number;
  participantIds?: number[];
}
