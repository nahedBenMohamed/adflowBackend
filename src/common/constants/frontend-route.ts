export const FrontendRoute = {
  signup: '/signup',

  entity: {
    card: ({ entityTypeId, entityId }: { entityTypeId: number; entityId: number }) =>
      `/et/${entityTypeId}/card/${entityId}/overview`,
  } as const,

  settings: {
    base: '/settings',
    mailing: () => `${FrontendRoute.settings.base}/mailing`,
    stripe: () => `${FrontendRoute.settings.base}/billing/stripe`,
    integration: () => `${FrontendRoute.settings.base}/integrations`,
    salesforce: () => FrontendRoute.settings.integration(),
    facebook: {
      deleteVerify: () => `/facebook/auth/delete-verify`,
      messenger: () => FrontendRoute.settings.integration(),
    } as const,
    google: {
      calendar: () => `${FrontendRoute.settings.integration()}/google-calendar`,
    } as const,
  } as const,
} as const;
