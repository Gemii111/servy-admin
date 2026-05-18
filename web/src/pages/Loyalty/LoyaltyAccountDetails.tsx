import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { useSnackbar } from '../../hooks/useSnackbar';
import {
  getLoyaltyAccountDetail,
  adjustLoyaltyPoints,
  LoyaltyTransaction,
} from '../../services/api/loyalty';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const TX_LABELS: Record<string, string> = {
  earned: 'مكتسب',
  redeemed: 'مستبدل',
  expired: 'منتهي',
  adjustment: 'تعديل',
};

const LoyaltyAccountDetailsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [points, setPoints] = useState(0);
  const [description, setDescription] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['loyalty', 'detail', userId],
    queryFn: () => getLoyaltyAccountDetail(userId!),
    enabled: !!userId,
  });

  const adjustMutation = useMutation({
    mutationFn: () =>
      adjustLoyaltyPoints({
        user_id: userId!,
        points,
        description: description || 'تعديل يدوي',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty'] });
      showSnackbar('تم تعديل النقاط', 'success');
      setAdjustOpen(false);
    },
    onError: (e: Error) => showSnackbar(e.message, 'error'),
  });

  if (isLoading) return <SkeletonLoader variant="cards" count={2} />;
  if (!data) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography>الحساب غير موجود</Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/loyalty')}>
          العودة
        </Button>
      </Box>
    );
  }

  const { account, transactions } = data;

  return (
    <Box sx={{ color: '#1A2E1A' }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/loyalty')}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700}>
            تفاصيل حساب الولاء
          </Typography>
          <Typography variant="body2" sx={{ color: '#5A6A5A' }}>
            المستخدم: {userId}
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => setAdjustOpen(true)}>
          تعديل النقاط
        </Button>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <Paper sx={{ p: 2, border: '1px solid #B1C0B1' }}>
          <Typography variant="body2" color="text.secondary">
            الرصيد الحالي
          </Typography>
          <Typography variant="h4" fontWeight={700} color="#86B573">
            {account.current_balance} نقطة
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, border: '1px solid #B1C0B1' }}>
          <Typography variant="body2" color="text.secondary">
            إجمالي المكتسب
          </Typography>
          <Typography variant="h5" fontWeight={600}>
            {account.lifetime_earned}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, border: '1px solid #B1C0B1' }}>
          <Typography variant="body2" color="text.secondary">
            قيمة قابلة للاستبدال
          </Typography>
          <Typography variant="h5" fontWeight={600}>
            {account.redeemable_value} ج.م
          </Typography>
        </Paper>
      </Box>

      <Paper sx={{ p: 2, border: '1px solid #B1C0B1' }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          سجل المعاملات
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>النوع</TableCell>
              <TableCell>النقاط</TableCell>
              <TableCell>بعد العملية</TableCell>
              <TableCell>الوصف</TableCell>
              <TableCell>التاريخ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((tx: LoyaltyTransaction) => (
              <TableRow key={tx.id}>
                <TableCell>{TX_LABELS[tx.tx_type] || tx.tx_type}</TableCell>
                <TableCell sx={{ color: tx.points >= 0 ? '#22C55E' : '#EF4444' }}>
                  {tx.points > 0 ? '+' : ''}
                  {tx.points}
                </TableCell>
                <TableCell>{tx.balance_after}</TableCell>
                <TableCell>{tx.description}</TableCell>
                <TableCell>
                  {format(new Date(tx.created_at), 'dd MMM yyyy HH:mm', { locale: ar })}
                </TableCell>
              </TableRow>
            ))}
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  لا توجد معاملات
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={adjustOpen} onClose={() => setAdjustOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>تعديل النقاط</DialogTitle>
        <DialogContent>
          <TextField
            label="النقاط (+ أو -)"
            type="number"
            fullWidth
            margin="normal"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
          />
          <TextField
            label="الوصف"
            fullWidth
            margin="normal"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdjustOpen(false)}>إلغاء</Button>
          <Button variant="contained" onClick={() => adjustMutation.mutate()}>
            حفظ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoyaltyAccountDetailsPage;
