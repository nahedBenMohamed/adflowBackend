export enum EntityTypeActionType {
  /**
   * @deprecated use new @see TaskCreate instead
   */
  CreateTask = 'create_task',
  /**
   * @deprecated use new @see ActivityCreate instead
   */
  CreateActivity = 'create_activity',
  /**
   * @deprecated use new @see EntityStageChange instead
   */
  ChangeStage = 'change_stage',
  /**
   * @deprecated use new @see EmailSend instead
   */
  SendEmail = 'send_email',

  EntityCreate = 'entity_create',
  EntityStageChange = 'entity_stage_change',
  EntityResponsibleChange = 'entity_responsible_change',
  EntityLinkedStageChange = 'entity_linked_stage_change',

  ActivityCreate = 'activity_create',
  TaskCreate = 'task_create',

  EmailSend = 'email_send',

  ChatSendExternal = 'chat_send_external',
  ChatSendAmwork = 'chat_send_amwork',

  HttpCall = 'http_call',
}
