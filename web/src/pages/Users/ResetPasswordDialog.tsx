import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { resetUserPassword } from '../../services/api/users';

interface Props {
  open: boolean;
  userId: string;
  userName: string;
  onClose: () => void;
}

const ResetPasswordDialog: React.FC<Props> = ({ open, userId, userName, onClose }) => {
  const [mode, setMode] = useState<'generate' | 'explicit'>('generate');
  const [password, setPassword] = useState('');
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setTempPassword(null);
    setPassword('');
    setError('');
    setMode('generate');
    onClose();
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await resetUserPassword(
        userId,
        mode === 'explicit' ? password : undefined
      );
      if (result.temporary_password) {
        setTempPassword(result.temporary_password);
      } else {
        handleClose();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل إعادة التعيين');
    } finally {
      setLoading(false);
    }
  };

  const copyTemp = () => {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>إعادة تعيين كلمة المرور — {userName}</DialogTitle>
      <DialogContent>
        {tempPassword ? (
          <Box>
            <Alert severity="warning" sx={{ mb: 2 }}>
              كلمة المرور المؤقتة تُعرض مرة واحدة فقط. انسخها وشاركها مع المستخدم بأمان.
            </Alert>
            <Typography variant="body2" sx={{ mb: 1 }}>
              كلمة المرور المؤقتة:
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: '#F5F9F3',
                borderRadius: 2,
                fontFamily: 'monospace',
                fontSize: 18,
                textAlign: 'center',
                letterSpacing: 2,
              }}
            >
              {tempPassword}
            </Box>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button
                variant={mode === 'generate' ? 'contained' : 'outlined'}
                onClick={() => setMode('generate')}
                size="small"
              >
                توليد تلقائي
              </Button>
              <Button
                variant={mode === 'explicit' ? 'contained' : 'outlined'}
                onClick={() => setMode('explicit')}
                size="small"
              >
                تعيين يدوي
              </Button>
            </Box>
            {mode === 'explicit' && (
              <TextField
                label="كلمة المرور الجديدة"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                helperText="8 أحرف على الأقل"
              />
            )}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        {tempPassword ? (
          <>
            <Button startIcon={<ContentCopyIcon />} onClick={copyTemp}>
              نسخ
            </Button>
            <Button variant="contained" onClick={handleClose}>
              تم
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleClose}>إلغاء</Button>
            <Button
              variant="contained"
              disabled={loading || (mode === 'explicit' && password.length < 8)}
              onClick={handleSubmit}
            >
              تأكيد
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ResetPasswordDialog;
