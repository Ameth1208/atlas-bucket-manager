import type { Dictionary } from '../types';

export const es: Dictionary = {
  // Card chrome
  cardTitle: 'Configurar Atlas',
  cardSubtitle: 'Paso {step} de 3',

  // Progress
  stepWelcome: 'Bienvenida',
  stepAccount: 'Cuenta',
  stepDone: 'Listo',

  // Welcome step
  welcomeTitle: 'Bienvenido a Atlas',
  welcomeSubtitle: 'Gestor de almacenamiento multi-nube',
  welcomeDescription:
    'Configura tu instancia en 3 pasos cortos. Crearás la cuenta de administrador y luego podrás conectar tu primer proveedor en la nube.',
  featBuckets: 'Gestiona múltiples buckets S3 y MinIO desde un solo lugar',
  featProviders: 'Conecta AWS, Cloudflare R2, DigitalOcean y más',
  featApiKeys: 'Genera API keys para acceso programático',
  featUsers: 'Invita a tu equipo con permisos por rol',
  welcomeCta: 'Comenzar',
  welcomeSkip: 'Ya tengo una cuenta',

  // Account step
  accountTitle: 'Crea tu cuenta de administrador',
  accountSubtitle: 'Esta será la cuenta propietaria de esta instancia de Atlas.',
  fieldName: 'Nombre completo',
  fieldNamePh: 'Tu nombre',
  fieldEmail: 'Correo electrónico',
  fieldEmailPh: 'tu@empresa.com',
  fieldPassword: 'Contraseña',
  fieldPasswordPh: 'Mínimo 8 caracteres',
  fieldConfirm: 'Confirmar contraseña',
  fieldConfirmPh: 'Repite tu contraseña',
  passwordWeak: 'Débil',
  passwordOk: 'Aceptable',
  passwordStrong: 'Fuerte',
  passwordHint: 'Usa 8+ caracteres con letras, números y símbolos.',
  back: 'Atrás',
  create: 'Crear cuenta',
  creating: 'Creando...',
  required: 'Requerido',
  invalidEmail: 'Correo inválido',
  passwordTooShort: 'Mínimo 8 caracteres',
  passwordMismatch: 'Las contraseñas no coinciden',

  // Done step
  doneTitle: '¡Atlas está listo!',
  doneDescription:
    'Tu cuenta fue creada exitosamente. El siguiente paso es conectar un proveedor en la nube para empezar a gestionar buckets.',
  tipTitle: 'Consejo',
  tipDescription:
    'Ve a Configuración → Proveedores para añadir tu MinIO, AWS S3, Cloudflare R2 o cualquier endpoint S3-compatible.',
  goDashboard: 'Ir al dashboard',

  // Language switcher
  languageLabel: 'Idioma',
};
