import { registerAs } from '@nestjs/config';

export interface TutorialConfig {
  language: string;
}

export default registerAs(
  'tutorial',
  (): TutorialConfig => ({
    language: process.env.TUTORIAL_LANGUAGE,
  }),
);
