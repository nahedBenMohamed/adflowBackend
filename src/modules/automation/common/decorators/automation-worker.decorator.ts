import { SetMetadata } from '@nestjs/common';

export const AUTOMATION_WORKER = 'AUTOMATION_WORKER';

export const AutomationWorker = (type: string) => SetMetadata(AUTOMATION_WORKER, type);
