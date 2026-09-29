// NOTE: CRA exposes env vars with the REACT_APP_ prefix (spec's VITE_* equivalents).
export const env = {
  useMocks: process.env.REACT_APP_USE_MOCKS === 'true',
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL ?? '',
  enableGoogleLogin: process.env.REACT_APP_ENABLE_GOOGLE_LOGIN === 'true',
  sttMode: (process.env.REACT_APP_STT_MODE === 'server' ? 'server' : 'browser') as 'browser' | 'server',
};
