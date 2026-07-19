export type Locale = 'en' | 'es' | 'pt';
export const LOCALES: Locale[] = ['en', 'es', 'pt'];
export const DEFAULT_LOCALE: Locale = 'es';

export const LOCALE_META: Record<Locale, { label: string; flagCode: string; htmlLang: string }> = {
  en: { label: 'English', flagCode: 'US', htmlLang: 'en' },
  es: { label: 'Español', flagCode: 'ES', htmlLang: 'es' },
  pt: { label: 'Português', flagCode: 'BR', htmlLang: 'pt' },
};

export interface Dictionary {
  // Card chrome
  cardTitle: string;
  cardSubtitle: string;

  // Progress
  stepWelcome: string;
  stepAccount: string;
  stepDone: string;

  // Welcome step
  welcomeTitle: string;
  welcomeSubtitle: string;
  welcomeDescription: string;
  featBuckets: string;
  featProviders: string;
  featApiKeys: string;
  featUsers: string;
  welcomeCta: string;
  welcomeSkip: string;

  // Account step
  accountTitle: string;
  accountSubtitle: string;
  fieldName: string;
  fieldNamePh: string;
  fieldEmail: string;
  fieldEmailPh: string;
  fieldPassword: string;
  fieldPasswordPh: string;
  fieldConfirm: string;
  fieldConfirmPh: string;
  passwordWeak: string;
  passwordOk: string;
  passwordStrong: string;
  passwordHint: string;
  back: string;
  create: string;
  creating: string;
  required: string;
  invalidEmail: string;
  passwordTooShort: string;
  passwordMismatch: string;

  // Done step
  doneTitle: string;
  doneDescription: string;
  tipTitle: string;
  tipDescription: string;
  goDashboard: string;

  // Language switcher
  languageLabel: string;

  // Common
  cancel: string;
  confirm: string;
  delete: string;
  save: string;
  saving: string;
  edit: string;
  close: string;
  backCommon: string;

  // Confirm dialogs
  confirmDeleteFileTitle: string;
  confirmDeleteFileDescription: string;
  confirmDeleteFileConfirm: string;
  confirmDeleteBucketTitle: string;
  confirmDeleteBucketDescription: string;
  confirmDeleteBucketConfirm: string;
  confirmDeleteProviderTitle: string;
  confirmDeleteProviderDescription: string;
  confirmDeleteProviderConfirm: string;
  confirmDeleteType: string;
  confirmDemoteLastOwnerTitle: string;
  confirmDemoteLastOwnerDesc: string;

  // Bucket permissions popover
  bucketPermissionsTitle: string;
  bucketPermissionsDesc: string;
  bucketAccess: string;
  bucketAccessPublicHint: string;
  bucketAccessPrivateHint: string;
  bucketMakePublic: string;
  bucketMakePrivate: string;
  bucketLimit: string;
  bucketLimitNoLimit: string;
  permissionsUpdated: string;

  // New folder dialog
  folderNewTitle: string;
  folderNewDescription: string;
  folderNewDescriptionRoot: string;
  folderNewName: string;
  folderNewNamePh: string;
  folderNewInvalid: string;
  folderNewCreated: string;
  folderCreate: string;

  // Misc toasts
  cloneStarted: string;

  // File type chart
  fileTypeTitle: string;
  fileTypeSummary: string;
  fileTypeEmpty: string;
  fileTypeEmptyHint: string;
  fileTypeFileCount: string;
  fileTypeImage: string;
  fileTypeVideo: string;
  fileTypeAudio: string;
  fileTypeCode: string;
  fileTypeDoc: string;
  fileTypeArchive: string;
  fileTypeOther: string;

  // Upload dialog
  uploadDialogTitle: string;
  uploadDialogDescription: string;
  uploadDragHint: string;
  uploadClickHint: string;
  uploadError: string;

  // Buckets list empty / error states
  bucketEmptyNoBuckets: string;
  bucketEmptyCreateFirst: string;
  providerConnectFirst: string;
  providerErrorSingle: string;
  providerErrorPlural: string;
  providerErrorsTitle: string;
  providerErrorsHint: string;

  // Bucket
  bucketObjects: string;
  bucketUsedSpace: string;
  bucketUpdated: string;
  bucketQuota: string;
  bucketNoLimit: string;
  bucketUnlimited: string;
  bucketFiles: string;
  bucketEmptyTitle: string;
  bucketEmptyDescription: string;
  bucketEmptyUpload: string;
  bucketEmptyNewFolder: string;
  bucketEmptyNoResults: string;
  bucketEmptyTryOther: string;
  bucketPreview: string;
  bucketDownload: string;
  bucketDeleteSuccess: string;
  bucketDeleteError: string;
  bucketActionsUpload: string;
  bucketActionsNewFolder: string;
  bucketActionsClone: string;
  bucketActionsShare: string;
  bucketActionsPermissions: string;
  cloneDialogTitle: string;
  bucketSearch: string;

  // Provider
  providerConnect: string;
  providerName: string;
  providerNamePh: string;
  providerEndpoint: string;
  providerEndpointPh: string;
  providerPort: string;
  providerRegion: string;
  providerAccessKey: string;
  providerAccessKeyPh: string;
  providerSecretKey: string;
  providerUseSSL: string;
  providerUseSSLEnabled: string;
  providerUseSSLDisabled: string;
  providerSelectKind: string;
  providerChangeProvider: string;
  providerMinio: string;
  providerAws: string;
  providerR2: string;
  providerSpaces: string;
  providerWasabi: string;
  providerKindPlaceholder: string;
  providerConnected: string;
  providerUpdated: string;
  providerDeleted: string;
  providerEditTitle: string;
  providerNewTitle: string;

  // Sidebar
  sidebarProviders: string;
  sidebarNoProviders: string;
  sidebarConnectProvider: string;
  sidebarNewBucket: string;
  sidebarToggleTheme: string;
  sidebarLogout: string;
  sidebarAllBuckets: string;
  sidebarFavorites: string;
  sidebarActivity: string;
  sidebarApiKeys: string;
  sidebarSettings: string;
  sidebarTools: string;
  sidebarSources: string;
  sidebarInfo: string;
  sidebarProviderBuckets: string;
  sidebarProviderEndpoint: string;
  sidebarProviderSsl: string;
  sidebarProviderAccessKey: string;
  sidebarProviderRegion: string;
  sidebarProviderCopied: string;
  sidebarProviderCopy: string;
  sidebarProviderEdit: string;
  sidebarProviderDelete: string;
  sidebarNoBuckets: string;

  // Errors
  errorConnectionFailed: string;
  errorConnectionHint: string;

  // Filters
  filterAll: string;
  filterImages: string;
  filterVideos: string;
  filterAudio: string;
  filterCode: string;
  filterDocs: string;
  filterArchives: string;

  // Toast
  toastCopied: string;
  toastDeleteSuccess: string;
  toastDeleteError: string;

  // Settings
  settingsTitle: string;
  settingsProfile: string;
  settingsAppearance: string;
  settingsSecurity: string;
  settingsTeam: string;
  settingsAdvanced: string;
  settingsLanguage: string;
  settingsNotifications: string;
  settingsApiKeys: string;
  settingsIntegrations: string;
  settingsIntegrationsTitle: string;
  settingsIntegrationsDesc: string;
  settingsWebhooks: string;
  settingsWebhooksDesc: string;
  settingsAddWebhook: string;
  settingsNoIntegrations: string;
  settingsIntegrationsEmail: string;
  settingsIntegrationsEmailDesc: string;
  settingsIntegrationsBuckets: string;
  settingsIntegrationsFiles: string;
  settingsNotifyOnUpload: string;
  settingsNotifyOnDelete: string;

  settingsProfileName: string;
  settingsProfileEmail: string;
  settingsProfileAvatar: string;
  settingsProfileUpdate: string;
  settingsProfileUpdated: string;
  settingsProfileJoined: string;
  settingsProfileRole: string;
  settingsProfileLastLogin: string;

  settingsTheme: string;
  settingsThemeDesc: string;
  settingsThemeLight: string;
  settingsThemeDark: string;
  settingsThemeSystem: string;

  settingsLanguageDesc: string;
  settingsLanguageSelect: string;

  settingsPasswordCurrent: string;
  settingsPasswordNew: string;
  settingsPasswordConfirm: string;
  settingsPasswordChange: string;
  settingsPasswordHint: string;
  settingsPasswordChanged: string;
  settingsPasswordMismatch: string;
  settingsPasswordCurrentPlaceholder: string;
  settingsPasswordNewPlaceholder: string;
  settingsPasswordConfirmPlaceholder: string;
  settingsPasswordCurrentError: string;

  settingsTeamDesc: string;
  settingsTeamInvite: string;
  settingsTeamInviteDesc: string;
  settingsTeamRole: string;
  settingsTeamMember: string;
  settingsTeamMembers: string;
  settingsTeamNoMembers: string;
  settingsTeamDeleted: string;
  settingsTeamEditRole: string;
  settingsTeamRoleHint: string;
  settingsTeamOwner: string;
  settingsTeamOwnerDesc: string;
  settingsTeamTableUser: string;
  settingsTeamTableRole: string;
  settingsTeamTablePermissions: string;
  settingsTeamTableActions: string;
  settingsTeamTableNoUsers: string;

  settingsInviteLink: string;
  settingsInviteLinkDesc: string;
  settingsInviteGenerate: string;
  settingsInviteCopy: string;
  settingsInviteCopied: string;
  settingsInviteReset: string;
  settingsResetPassword: string;
  settingsResetPasswordDone: string;
  settingsResetPasswordCopied: string;

  settingsInviteRole: string;
  settingsInviteEmail: string;
  settingsInvitePending: string;
  settingsInviteExpires: string;
  settingsInviteCreated: string;
  settingsInviteRevoke: string;
  settingsInviteEmpty: string;
  settingsInviteTitle: string;

  settingsRoleOwner: string;
  settingsRoleAdmin: string;
  settingsRoleEditor: string;
  settingsRoleViewer: string;

  settingsPermissionsTitle: string;
  settingsPermissionRead: string;
  settingsPermissionWrite: string;
  settingsPermissionManageBuckets: string;
  settingsPermissionManageProviders: string;
  settingsPermissionManageUsers: string;
  settingsPermissionManageSettings: string;

  settingsNotificationsTitle: string;
  settingsNotificationsDesc: string;
  settingsNotificationsEmail: string;
  settingsNotificationsEmailDesc: string;
  settingsNotificationsActivity: string;
  settingsNotificationsActivityDesc: string;
  settingsNotificationsDigest: string;
  settingsNotificationsDigestDesc: string;

  settingsSmtpTitle: string;
  settingsSmtpDesc: string;
  settingsSmtpHost: string;
  settingsSmtpPort: string;
  settingsSmtpUser: string;
  settingsSmtpPass: string;
  settingsSmtpFrom: string;
  settingsSmtpSecure: string;
  settingsSmtpTest: string;
  settingsSmtpSave: string;

  settingsWebhookTitle: string;
  settingsWebhookDesc: string;
  settingsWebhookUrl: string;
  settingsWebhookEvents: string;
  settingsWebhookAdd: string;
  settingsWebhookEmpty: string;
  settingsWebhookDelete: string;
  settingsWebhookTest: string;

  settingsDangerTitle: string;
  settingsDangerDesc: string;
  settingsDangerDelete: string;
  settingsDangerDeleteHint: string;

  settingsSave: string;
  settingsSaving: string;
  settingsCancel: string;
  settingsLoading: string;
  settingsEmpty: string;

  // Auth (login + setup gate)
  authLoginTitle: string;
  authLoginDescription: string;
  authLoginEmail: string;
  authLoginPassword: string;
  authLoginSubmit: string;
  authLoginNoAccount: string;
  authLoginSetupCta: string;
  authLoginError: string;
  authLoginWelcome: string;
  authLoginWelcomeDesc: string;
  authSetupUnavailable: string;

  // Invite accept page
  inviteTitle: string;
  inviteValidating: string;
  inviteInvalid: string;
  inviteRole: string;
  inviteName: string;
  inviteNamePh: string;
  inviteEmail: string;
  inviteEmailPh: string;
  invitePassword: string;
  invitePasswordPh: string;
  inviteConfirm: string;
  inviteConfirmPh: string;
  inviteSubmit: string;
  inviteAccepted: string;
  inviteAlreadyUsed: string;
  invitePasswordMismatch: string;
  invitePasswordTooShort: string;

  // Reset password page
  resetTitle: string;
  resetDescription: string;
  resetNewPassword: string;
  resetConfirm: string;
  resetSubmit: string;
  resetDone: string;
  resetInvalidToken: string;

  // Favorites
  favoritesTitle: string;
  favoritesEmpty: string;
  favoritesSubtitle: string;
  favoritesAddHint: string;
  favoritesAdd: string;
  favoritesRemove: string;

  // Bucket card
  bucketBadgePublic: string;
  bucketBadgePrivate: string;
  bucketObjectsLabel: string;
  bucketPctUsed: string;

  // Dashboard buckets panel
  dashboardBucketsTitle: string;
  dashboardBucketsSubtitle: string;
  dashboardBucketsSearchPh: string;
  dashboardBucketsClear: string;
  dashboardBucketsEmpty: string;

  // Share dialog
  shareTitle: string;
  shareDescription: string;
  sharePublic: string;
  sharePublicHint: string;
  sharePrivate: string;
  sharePrivateHint: string;
  shareMakePublic: string;
  shareMakePrivate: string;
  shareLink: string;
  shareLinkPlaceholder: string;
  shareCopyLink: string;
  shareClose: string;

  // Team section
  teamTabMembers: string;
  teamTabInvitations: string;
  teamSearchPh: string;
  teamInviteButton: string;
  teamInviteMember: string;
  teamInviteDescription: string;
  teamInviteGenerate: string;
  teamAnyoneWithLink: string;
  teamToken: string;
  teamStatusActive: string;
  teamStatusColumn: string;
  teamJoinedColumn: string;
  teamNoMembers: string;
  teamRemoveConfirm: string;
  teamInvitePasswordRequired: string;
  teamActionLabel: string;

  // Webhooks
  webhookUrlPh: string;
  webhookEventsLabel: string;
  webhookEventUpload: string;
  webhookEventDelete: string;
  webhookEventBucketCreate: string;
  webhookEventBucketDelete: string;
  webhookEventClone: string;
  webhookSaved: string;
  webhookSave: string;
  webhookTestSent: string;
  webhookTestFailed: string;
  webhookTest: string;

  // Notification prefs
  notifyEmailLabel: string;
  notifyEmailDesc: string;
  notifyOnUploadLabel: string;
  notifyOnUploadDesc: string;
  notifyOnDeleteLabel: string;
  notifyOnDeleteDesc: string;
  notifySaved: string;

  // Account / danger
  accountDeleteHint: string;
  accountDeleteConfirmTitle: string;
  accountDeleteConfirmDescription: string;
  accountDeleteConfirmInput: string;
  accountDeleted: string;
}
