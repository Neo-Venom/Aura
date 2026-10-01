export const env = {
  useMocks: process.env.REACT_APP_USE_MOCKS === 'true',
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL ?? '',
  enableGoogleLogin: process.env.REACT_APP_ENABLE_GOOGLE_LOGIN === 'true',
  sttMode: (process.env.REACT_APP_STT_MODE === 'server' ? 'server' : 'browser') as 'browser' | 'server',
  supabaseUrl: process.env.REACT_APP_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.REACT_APP_SUPABASE_ANON_KEY ?? '',
};
