import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  formatUserFieldValue,
  labelForUserField,
} from '../../utils/userFieldLabels';
import { formatApiDateTime, parseApiDate } from '../../utils/apiDates';

interface Props {
  title?: string;
  fields: Record<string, unknown>;
  /** Keys already shown above — hide from this grid */
  hideKeys?: Set<string>;
}

const DEFAULT_HIDE = new Set([
  'password',
  'password_hash',
  'Password',
  'PasswordHash',
  '_originalEnvelope',
]);

function formatValue(key: string, value: unknown): string {
  if (value == null || value === '') return '—';
  if (typeof value === 'string' && parseApiDate(value)) {
    return formatApiDateTime(value);
  }
  if (key.toLowerCase().includes('password')) return '••••••••';
  return formatUserFieldValue(value);
}

const UserApiFieldsGrid: React.FC<Props> = ({
  title = 'كل الحقول من السيرفر',
  fields,
  hideKeys,
}) => {
  const hidden = hideKeys ?? DEFAULT_HIDE;
  const entries = Object.entries(fields).filter(([k]) => !hidden.has(k));

  if (entries.length === 0) return null;

  return (
    <Box>
      <Typography variant="h6" sx={{ color: '#1A2E1A', mb: 2, fontWeight: 600 }}>
        {title}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, minmax(0, 1fr))',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(3, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        {entries.map(([key, value]) => (
          <Box
            key={key}
            sx={{
              p: 1.5,
              borderRadius: 1,
              border: '1px solid #E5E7EB',
              bgcolor: '#FAFAFA',
            }}
          >
            <Typography variant="caption" sx={{ color: '#5A6A5A', display: 'block' }}>
              {labelForUserField(key)}
              <Typography component="span" sx={{ color: '#9CA3AF', fontSize: 10, ml: 0.5 }}>
                ({key})
              </Typography>
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#1A2E1A',
                fontWeight: 500,
                wordBreak: 'break-word',
                mt: 0.25,
              }}
            >
              {formatValue(key, value)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default UserApiFieldsGrid;
