import { ActivityCardDto } from '../../activity-card';
import { TaskBoardCardDto } from '../../task-board';

export type TaskOrActivityCard = TaskBoardCardDto | ActivityCardDto;
