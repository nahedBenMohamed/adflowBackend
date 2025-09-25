import { SetMetadata } from '@nestjs/common';

export const AUTOMATION_JOB_HANDLER = 'AUTOMATION_JOB_HANDLER';

export const OnAutomationJob = (type: string) => SetMetadata(AUTOMATION_JOB_HANDLER, type);
