import type { Dictionary } from '../types';

export const en: Dictionary = {
  // Card chrome
  cardTitle: 'Set up Atlas',
  cardSubtitle: 'Step {step} of 3',

  // Progress
  stepWelcome: 'Welcome',
  stepAccount: 'Account',
  stepDone: 'Done',

  // Welcome step
  welcomeTitle: 'Welcome to Atlas',
  welcomeSubtitle: 'Multi-cloud storage manager',
  welcomeDescription:
    'Configure your instance in 3 short steps. You will create the admin account, then connect your first cloud provider.',
  featBuckets: 'Manage multiple S3 and MinIO buckets from one place',
  featProviders: 'Connect AWS, Cloudflare R2, DigitalOcean, and more',
  featApiKeys: 'Generate API keys for programmatic access',
  featUsers: 'Invite your team with role-based permissions',
  welcomeCta: 'Get started',
  welcomeSkip: 'I already have an account',

  // Account step
  accountTitle: 'Create your admin account',
  accountSubtitle: 'This will be the owner of this Atlas instance.',
  fieldName: 'Full name',
  fieldNamePh: 'Your name',
  fieldEmail: 'Email address',
  fieldEmailPh: 'you@company.com',
  fieldPassword: 'Password',
  fieldPasswordPh: 'At least 8 characters',
  fieldConfirm: 'Confirm password',
  fieldConfirmPh: 'Repeat your password',
  passwordWeak: 'Weak',
  passwordOk: 'Good',
  passwordStrong: 'Strong',
  passwordHint: 'Use 8+ characters with letters, numbers and symbols.',
  back: 'Back',
  create: 'Create account',
  creating: 'Creating...',
  required: 'Required',
  invalidEmail: 'Invalid email',
  passwordTooShort: 'At least 8 characters',
  passwordMismatch: 'Passwords do not match',

  // Done step
  doneTitle: 'Atlas is ready!',
  doneDescription:
    'Your account was created successfully. The next step is to connect a cloud provider to start managing buckets.',
  tipTitle: 'Tip',
  tipDescription:
    'Go to Settings → Providers to add your MinIO, AWS S3, Cloudflare R2 or any S3-compatible endpoint.',
  goDashboard: 'Go to dashboard',

  // Language switcher
  languageLabel: 'Language',
};
