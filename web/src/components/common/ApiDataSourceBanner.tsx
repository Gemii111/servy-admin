import React from 'react';
import { Alert } from '@mui/material';
import { getApiDataSource } from '../../services/api/base';

const ApiDataSourceBanner: React.FC = () => {
  const source = getApiDataSource();
  if (source === 'real') return null;

  return (
    <Alert severity="warning" sx={{ mb: 2 }}>
      أنت تشاهد بيانات <strong>تجريبية (Mock)</strong> وليست من قاعدة البيانات. لعرض بيانات
      حقيقية: أنشئ ملف <code>web/.env</code> وضع{' '}
      <code>REACT_APP_USE_MOCK_API=false</code> ثم أعد تشغيل <code>npm start</code>.
    </Alert>
  );
};

export default ApiDataSourceBanner;
