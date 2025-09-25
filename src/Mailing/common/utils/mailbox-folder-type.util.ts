/* eslint-disable prettier/prettier */
import { MailboxFolderType } from '../enums';

const SpecialUseToFolderType: Record<string, MailboxFolderType> = {
  '\\Inbox': MailboxFolderType.Inbox,
  '\\Sent': MailboxFolderType.Sent,
  '\\Trash': MailboxFolderType.Trash,
  '\\Drafts': MailboxFolderType.Drafts,
  '\\Junk': MailboxFolderType.Junk,
  '\\Archive': MailboxFolderType.Archive,
  '\\All': MailboxFolderType.All,
  '\\Flagged': MailboxFolderType.Flagged,
};

const CommonNamesMap: Record<string, MailboxFolderType> = {
  // Inbox
  'inbox': MailboxFolderType.Inbox,
  'входящие': MailboxFolderType.Inbox,
  'boîte de réception': MailboxFolderType.Inbox,

  // Sent
  'sent': MailboxFolderType.Sent,
  'отправленные': MailboxFolderType.Sent,
  'envoyés': MailboxFolderType.Sent,

  // Trash
  'trash': MailboxFolderType.Trash,
  'корзина': MailboxFolderType.Trash,
  'corbeille': MailboxFolderType.Trash,

  // Drafts
  'draft': MailboxFolderType.Drafts,
  'drafts': MailboxFolderType.Drafts,
  'черновики': MailboxFolderType.Drafts,
  'brouillons': MailboxFolderType.Drafts,

  // Junk
  'junk': MailboxFolderType.Junk,
  'spam': MailboxFolderType.Junk,
  'спам': MailboxFolderType.Junk,
  'courrier indésirable': MailboxFolderType.Junk,

  // Archive
  'archive': MailboxFolderType.Archive,
  'архив': MailboxFolderType.Archive,
  'archives': MailboxFolderType.Archive,

  // All
  'all mail': MailboxFolderType.All,
  '[gmail]/all mail': MailboxFolderType.All,

  // Flagged
  'flagged': MailboxFolderType.Flagged,
  'important': MailboxFolderType.Flagged,
  'starred': MailboxFolderType.Flagged,
};

export const detectMailboxFolderType = ({
  specialUse,
  name,
}: {
  specialUse?: string | null;
  name?: string;
}): MailboxFolderType | null => {
  if (specialUse) {
    const normalizedSpecialUse = specialUse.trim();
    const mapped = SpecialUseToFolderType[normalizedSpecialUse];
    if (mapped) return mapped;
  }

  if (name) {
    const normalizedName = name.trim().toLowerCase();
    const mapped = CommonNamesMap[normalizedName];
    if (mapped) return mapped;
  }

  return undefined;
};
