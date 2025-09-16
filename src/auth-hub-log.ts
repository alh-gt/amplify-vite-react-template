// src/auth-hub-log.ts
import { Hub } from 'aws-amplify/utils';

export function mountAuthHubLogger() {
  Hub.listen('auth', ({ payload }) => {
    // 失敗時は payload.event === 'signIn_failure' など
    // payload.data?.message / name / code などをコンソールで確認
    console.log('[auth event]', payload.event, payload.message);
  });
}
