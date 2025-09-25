import { BoardStageType } from './board-stage-type.enum';

export enum BoardStageCode {
  Win = 'win',
  Lost = 'lost',
  Hired = 'hired',
  Rejected = 'rejected',
  Fired = 'fired',
  Done = 'done',
  NotDone = 'not_done',
  Completed = 'completed',
  NotSatisfied = 'not_satisfied',
}

export const BoardStageCodes = {
  [BoardStageType.Won]: [BoardStageCode.Win, BoardStageCode.Hired, BoardStageCode.Done, BoardStageCode.Completed],
  [BoardStageType.Lost]: [
    BoardStageCode.Lost,
    BoardStageCode.Rejected,
    BoardStageCode.Fired,
    BoardStageCode.NotDone,
    BoardStageCode.NotSatisfied,
  ],
};
