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
  uploadSelectAria: string;
  uploadFilesAria: string;
  uploadRemoveAria: string;
  uploadCancel: string;
  uploadSubmit: string;
  uploadSubmitWithCount: string;
  uploadSubmitting: string;
  uploadToastSuccess: string;

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
  providerEndpoint: string;
  providerPort: string;
  providerRegion: string;
  providerAccessKey: string;
  providerAccessKeyPh: string;
  providerSecretKey: string;
  providerUseSSL: string;
  providerUseSSLEnabled: string;
  providerUseSSLDisabled: string;
  providerSelectKind: string;
  providerKindPlaceholder: string;
  providerDeleted: string;
  providerEditTitle: string;
  providerNewTitle: string;

  // Sidebar
  sidebarProviders: string;
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
  sidebarUserMenu: string;
  sidebarUserAccount: string;
  sidebarUserProfile: string;
  sidebarUserTheme: string;
  sidebarUserLanguage: string;
  sidebarUserLogout: string;
  sidebarUserThemeLight: string;
  sidebarUserThemeDark: string;
  sidebarUserThemeSystem: string;

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
  sharePresignedLabel: string;
  sharePresignedPh: string;
  sharePresignedGenerate: string;

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

  // Activity
  activityTitle: string;
  activitySubtitle: string;
  activityFiltersHeading: string;
  activityFilterAction: string;
  activityFilterUser: string;
  activityFilterClear: string;
  activityFilterClearAll: string;
  activityApply: string;
  activityUserLabel: string;
  activityUserPh: string;
  activityNoMatches: string;
  activityResult: string;
  activityResults: string;
  activityEmpty: string;
  activityColWhen: string;
  activityColActor: string;
  activityColAction: string;
  activityColDetail: string;
  activityColBucket: string;
  activityTimeNow: string;
  activityTimeMin: string;
  activityTimeHour: string;
  activityTimeDay: string;
  activityLiveTag: string;

  // API keys
  apiKeysTitle: string;
  apiKeysSubtitle: string;
  apiKeysCreate: string;
  apiKeysPolicy: string;
  apiKeysStatActive: string;
  apiKeysStatRead: string;
  apiKeysStatWrite: string;
  apiKeysStatCalls30d: string;
  apiKeysSection: string;
  apiKeysSearch: string;
  apiKeysColName: string;
  apiKeysColToken: string;
  apiKeysColScopes: string;
  apiKeysColLastUsed: string;
  apiKeysColActions: string;
  apiKeysEmpty: string;
  apiKeysCreated: string;
  apiKeysRevoke: string;
  apiKeysQuickstart: string;
  apiKeysQuickstartCopy: string;
  apiKeysShowToken: string;
  apiKeysHideToken: string;
  apiKeysCopyPrefix: string;
  apiKeysRevoked: string;

  // Buckets index
  bucketsIndexTitle: string;
  bucketsIndexSubtitle: string;
  bucketsIndexEmpty: string;
  bucketsIndexLoading: string;
  bucketsIndexError: string;
  bucketsIndexSearchPh: string;
  bucketsIndexClear: string;
  bucketsIndexNew: string;
  bucketsIndexResult: string;
  bucketsIndexResults: string;

  // Dashboard
  dashboardTitle: string;
  dashboardSubtitle: string;
  dashboardConnectProvider: string;
  dashboardCreateBucket: string;
  dashboardStatBuckets: string;
  dashboardStatBucketsSub: string;
  dashboardStatStorage: string;
  dashboardStatStorageSub: string;
  dashboardStatPublic: string;
  dashboardStatPublicSub: string;
  dashboardStatActivity: string;
  dashboardStatActivitySub: string;
  dashboardRecentActivity: string;
  dashboardViewAll: string;
  dashboardNoRecentActivity: string;

  // Settings sections (descriptions)
  settingsSectionAccount: string;
  settingsSectionTeam: string;
  settingsSectionIntegrations: string;
  settingsSectionSecurity: string;

  // Team
  teamShareLink: string;
  teamEmailColumn: string;

  // Login (extra strings not in authLogin*)
  loginFirstTime: string;

  // Generic
  errorGeneric: string;

  // Clone dialog & progress dock
  cloneSelectProvider: string;
  cloneChooseDest: string;
  cloneSameSourceWarn: string;
  cloneOverwriteLabel: string;
  cloneOverwriteHelp: string;
  cloneStart: string;
  cloneCancelJob: string;
  cloneProgressTitle: string;
  cloneProgressEmpty: string;
  cloneProgressClear: string;
  cloneProgressCloning: string;
  cloneProgressCompleted: string;
  cloneProgressFailed: string;
  cloneProgressCancelled: string;
  cloneProgressFrom: string;
  cloneDialogSourceLabel: string;
  cloneDialogDestProviderLabel: string;
  cloneDialogDestProviderPh: string;
  cloneDialogDestBucketLabel: string;
  cloneDialogDestBucketPh: string;
  cloneDialogSameProviderHint: string;
  cloneDialogRemoteHint: string;
  cloneDialogStarting: string;
  cloneDialogSelectDestAria: string;
  cloneProgressObjects: string;
  cloneProgressBytes: string;
  cloneProgressInit: string;
  cloneProgressSelectAria: string;
  cloneProgressCollapse: string;
  cloneProgressExpand: string;
  cloneProgressClose: string;
  cloneProgressCancel: string;
  cloneProgressDelete: string;
  cloneProgressCancelledToast: string;
  cloneProgressDeletedToast: string;
  cloneProgressStatus: string;
  cloneProgressStatusCopying: string;
  cloneProgressErrorCount: string;

  // Create bucket dialog
  bucketCreateTitle: string;
  bucketCreateNameLabel: string;
  bucketCreateNamePh: string;
  bucketCreateProviderLabel: string;
  bucketCreateProviderEmpty: string;
  bucketCreateLimitLabel: string;
  bucketCreateLimitCurrent: string;
  bucketCreateLimitMb: string;
  bucketCreateLimitGb: string;
  bucketCreateSubmit: string;
  bucketCreateLimitNone: string;
  bucketCreateLimit100mb: string;
  bucketCreateLimit1gb: string;
  bucketCreateLimit10gb: string;
  bucketCreateLimit100gb: string;
  bucketCreateSuccess: string;

  // Create API key dialog
  apiKeyCreateTitle: string;
  apiKeyCreateNameLabel: string;
  apiKeyCreateNamePh: string;
  apiKeyCreateScopesLabel: string;
  apiKeyCreateSubmit: string;
  apiKeyCreatedHeading: string;
  apiKeyCreatedBody: string;
  apiKeyYourKey: string;
  apiKeyCopy: string;
  apiKeyCopied: string;
  apiKeyDone: string;

  // Provider form
  providerEditTitleNamed: string;
  providerChangeProvider: string;
  providerNameLabel: string;
  providerNamePh: string;
  providerEndpointLabel: string;
  providerEndpointPh: string;
  providerPortLabel: string;
  providerPortPh: string;
  providerRegionLabel: string;
  providerRegionPh: string;
  providerAccessKeepHint: string;
  providerAccessPh: string;
  providerSecretKeepHint: string;
  providerSecretPh: string;
  providerSslLabel: string;
  providerSslEnabled: string;
  providerSslDisabled: string;
  providerSubmitSave: string;
  providerSubmitConnect: string;
  providerConnected: string;
  providerUpdated: string;
  providerMinio: string;
  providerAws: string;
  providerR2: string;
  providerSpaces: string;
  providerWasabi: string;

  // Bucket toolbar / list / grid / object card
  bucketFilesCount: string;
  bucketSearchPh: string;
  bucketSearchClear: string;
  bucketLayoutGrid: string;
  bucketLayoutList: string;
  bucketDeleteSelected: string;
  bucketDeleteSelectedCount: string;
  bucketEmptyNoResults: string;
  bucketEmptyNoResultsHint: string;
  bucketEmptyFolder: string;
  bucketEmptyFolderHint: string;
  bucketEmptyBucket: string;
  bucketEmptyBucketHint: string;
  bucketEmptyUpload: string;
  bucketEmptyNewFolder: string;
  bucketListColName: string;
  bucketListColSize: string;
  bucketListColModified: string;
  bucketListColType: string;
  bucketListColActions: string;
  bucketListSelectAction: string;
  bucketListPreview: string;
  bucketListDownload: string;
  bucketListDelete: string;
  bucketListFolder: string;
  bucketThumbnailErrorTitle: string;
  bucketThumbnailErrorClose: string;
  bucketFileKindImage: string;
  bucketFileKindVideo: string;
  bucketFileKindAudio: string;
  bucketFileKindCode: string;
  bucketFileKindDoc: string;
  bucketFileKindArchive: string;
  bucketObjectOpenFolder: string;
  bucketObjectSelect: string;
  bucketObjectFolderLabel: string;

  // Toolbar
  toolbarConnectProviderTitle: string;
  toolbarNewBucketTitle: string;
  toolbarOpenSettingsAria: string;

  // Bucket switcher
  bucketSwitcherTitle: string;
  bucketSwitcherAll: string;
  bucketSwitcherSearchPh: string;
  bucketSwitcherCurrent: string;

  // Common chrome
  commonAtlas: string;
  commonLoading: string;
  bucketNotFound: string;

  // File preview
  filePreviewDownload: string;
  filePreviewClose: string;
  filePreviewCannotPreview: string;
  filePreviewType: string;
  filePreviewNotAvailable: string;
  filePreviewDownloadToView: string;

  // Sidebar
  sidebarGroupSources: string;
  sidebarGroupProviders: string;
  sidebarGroupTools: string;
  sidebarNoProviders: string;
  sidebarNoBuckets: string;
  sidebarErrorLogout: string;
  sidebarErrorDeleteProvider: string;
  sidebarProviderDeleted: string;
  sidebarInfoBuckets: string;
  sidebarInfoEndpoint: string;
  sidebarInfoAccessKey: string;
  sidebarInfoRegion: string;
  sidebarInfoSsl: string;
  sidebarInfoEdit: string;
  sidebarInfoDelete: string;
  sidebarInfoCopy: string;
  sidebarNavDashboard: string;
  sidebarNavFavorites: string;
  sidebarNavActivity: string;
  sidebarNavSettings: string;

  // UI primitives
  uiClose: string;
  uiToggleSidebar: string;
  uiShowPassword: string;
  uiHidePassword: string;
  uiLogoTagline: string;
  uiMobileSidebarTitle: string;
  uiMobileSidebarDescription: string;

  // Account / danger
  accountDeleteHint: string;
  accountDeleteConfirmTitle: string;
  accountDeleteConfirmDescription: string;
  accountDeleteConfirmInput: string;
  accountDeleted: string;
}
