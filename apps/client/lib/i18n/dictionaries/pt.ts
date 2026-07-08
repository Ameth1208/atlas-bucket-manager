import type { Dictionary } from '../types';

export const pt: Dictionary = {
  // Card chrome
  cardTitle: 'Configurar Atlas',
  cardSubtitle: 'Passo {step} de 3',

  // Progress
  stepWelcome: 'Boas-vindas',
  stepAccount: 'Conta',
  stepDone: 'Pronto',

  // Welcome step
  welcomeTitle: 'Bem-vindo ao Atlas',
  welcomeSubtitle: 'Gerenciador de armazenamento multi-nuvem',
  welcomeDescription:
    'Configure sua instância em 3 passos curtos. Você criará a conta de administrador e depois poderá conectar seu primeiro provedor na nuvem.',
  featBuckets: 'Gerencie múltiplos buckets S3 e MinIO em um só lugar',
  featProviders: 'Conecte AWS, Cloudflare R2, DigitalOcean e mais',
  featApiKeys: 'Gere API keys para acesso programático',
  featUsers: 'Convide sua equipe com permissões por papel',
  welcomeCta: 'Começar',
  welcomeSkip: 'Já tenho uma conta',

  // Account step
  accountTitle: 'Crie sua conta de administrador',
  accountSubtitle: 'Esta será a conta proprietária desta instância do Atlas.',
  fieldName: 'Nome completo',
  fieldNamePh: 'Seu nome',
  fieldEmail: 'Endereço de e-mail',
  fieldEmailPh: 'voce@empresa.com',
  fieldPassword: 'Senha',
  fieldPasswordPh: 'Mínimo 8 caracteres',
  fieldConfirm: 'Confirmar senha',
  fieldConfirmPh: 'Repita sua senha',
  passwordWeak: 'Fraca',
  passwordOk: 'Aceitável',
  passwordStrong: 'Forte',
  passwordHint: 'Use 8+ caracteres com letras, números e símbolos.',
  back: 'Voltar',
  create: 'Criar conta',
  creating: 'Criando...',
  required: 'Obrigatório',
  invalidEmail: 'E-mail inválido',
  passwordTooShort: 'Mínimo 8 caracteres',
  passwordMismatch: 'As senhas não coincidem',

  // Done step
  doneTitle: 'Atlas está pronto!',
  doneDescription:
    'Sua conta foi criada com sucesso. O próximo passo é conectar um provedor na nuvem para começar a gerenciar buckets.',
  tipTitle: 'Dica',
  tipDescription:
    'Vá em Configurações → Provedores para adicionar seu MinIO, AWS S3, Cloudflare R2 ou qualquer endpoint S3-compatível.',
  goDashboard: 'Ir para o dashboard',

  // Language switcher
  languageLabel: 'Idioma',
};
