import { ApiProperty } from '@nestjs/swagger';

import { FeedbackType } from '../enums';
import { TrialExpiredFeedback } from './trial-expired-feedback.dto';
import { UserLimitFeedback } from './user-limit-feedback.dto';
import { BecomePartnerFeedback } from './become-partner-feedback.dto';
import { ContactUsFeedback } from './contact-us-feedback.dto';

type FeedbackPayload = TrialExpiredFeedback | UserLimitFeedback | BecomePartnerFeedback | ContactUsFeedback;

export class SendFeedbackDto {
  @ApiProperty()
  type: FeedbackType;

  @ApiProperty()
  payload: FeedbackPayload;
}
