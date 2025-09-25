import { ChatProviderStatus, ChatProviderTransport, ChatProviderType } from '../../common';

export const ChatProviderDefaults = {
  type: ChatProviderType.Amwork,
  transport: ChatProviderTransport.Amwork,
  status: ChatProviderStatus.Active,
  messagePerDay: 100,
};
