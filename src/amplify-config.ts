// src/amplify-config.ts
import type { ResourcesConfig } from 'aws-amplify';

const amplifyConfig: ResourcesConfig  = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COG_USER_POOL_ID!,
      userPoolClientId: import.meta.env.VITE_COG_USER_POOL_CLIENT_ID!,
      // 典型的なログイン（メール）を許可
      loginWith: { email: true, phone: false, username: false },
      // サインアップ確認方式（必要に応じて "link" などに）
      signUpVerificationMethod: 'code',
    },
  },
};
export default amplifyConfig;
