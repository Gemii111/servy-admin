import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SearchIcon from '@mui/icons-material/Search';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DataTable from '../../components/tables/DataTable';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { useSnackbar } from '../../hooks/useSnackbar';
import {
  getLoyaltyAccounts,
  getLoyaltyStats,
  adjustLoyaltyPoints,
  LoyaltyAccount,
} from '../../services/api/loyalty';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const LoyaltyAccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<LoyaltyAccount | null>(null);
  const [adjustPoints, setAdjustPoints] = useState<number>(0);
  const [adjustDescription, setAdjustDescription] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['loyalty', 'accounts', searchQuery, page],
    queryFn: () =>
      getLoyaltyAccounts({
        search: searchQuery || undefined,
        page,
        limit,
      }),
  });

  const { data: stats } = useQuery({
    queryKey: ['loyalty', 'stats'],
    queryFn: getLoyaltyStats,
  });

  const adjustMutation = useMutation({
    mutationFn: () =>
      adjustLoyaltyPoints({
        user_id: selectedAccount!.userId,
        points: adjustPoints,
        description: adjustDescription || 'تعديل يدوي',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty'] });
      showSnackbar('تم تعديل النقاط بنجاح', 'success');
      setAdjustDialogOpen(false);
      setSelectedAccount(null);
      setAdjustPoints(0);
      setAdjustDescription('');
    },
    onError: (err: Error) => showSnackbar(err.message || 'فشل التعديل', 'error'),
  });

  const openAdjustDialog = (account: LoyaltyAccount) => {
    setSelectedAccount(account);
    setAdjustPoints(0);
    setAdjustDescription('');
    setAdjustDialogOpen(true);
  };

  const columns = useMemo<ColumnDef<LoyaltyAccount>[]>(
    () => [
      {
        accessorKey: 'userName',
        header: 'الاسم',
        cell: (info) => (
          <Typography sx={{ color: '#1A2E1A', fontWeight: 600, fontSize: 14 }}>
            {String(info.getValue() || '')}
          </Typography>
        ),
      },
      {
        accessorKey: 'email',
        header: 'البريد',
        cell: (info) => (
          <Typography sx={{ color: '#5A6A5A', fontSize: 13 }}>
            {String(info.getValue() || '')}
          </Typography>
        ),
      },
      {
        accessorKey: 'currentBalance',
        header: 'الرصيد الحالي',
        cell: (info) => (
          <Typography sx={{ color: '#86B573', fontWeight: 600, fontSize: 14 }}>
            {Number(info.getValue())} نقطة
          </Typography>
        ),
      },
      {
        accessorKey: 'lifetimeEarned',
        header: 'إجمالي المكتسب',
        cell: (info) => (
          <Typography sx={{ color: '#5A6A5A', fontSize: 13 }}>
            {Number(info.getValue())} نقطة
          </Typography>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'تاريخ الإنشاء',
        cell: (info) => (
          <Typography sx={{ color: '#5A6A5A', fontSize: 13 }}>
            {format(new Date(String(info.getValue())), 'dd MMM yyyy', { locale: ar })}
          </Typography>
        ),
      },
      {
        id: 'actions',
        header: 'الإجراءات',
        cell: ({ row }) => (
          <Box onClick={(e) => e.stopPropagation()}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => openAdjustDialog(row.original)}
              sx={{
                borderColor: '#86B573',
                color: '#86B573',
                '&:hover': { borderColor: '#6B9B5E', bgcolor: 'rgba(134,181,115,0.08)' },
              }}
            >
              تعديل نقاط
            </Button>
          </Box>
        ),
      },
    ],
    []
  );

  if (isLoading && !stats) {
    return <SkeletonLoader variant="cards" count={3} />;
  }

  const accounts = data?.accounts ?? [];

  return (
    <Box sx={{ color: '#1A2E1A' }}>
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} mb={0.5} sx={{ fontSize: { xs: 20, sm: 24 } }}>
            نقاط الولاء
          </Typography>
          <Typography variant="body2" sx={{ color: '#5A6A5A', fontSize: { xs: 12, sm: 14 } }}>
            إدارة حسابات الولاء والنقاط
          </Typography>
        </Box>

        <TextField
          placeholder="بحث بالاسم أو البريد..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#5A6A5A' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: 250,
            '& .MuiOutlinedInput-root': {
              bgcolor: '#FFFFFF',
              '& fieldset': { borderColor: '#B1C0B1' },
            },
          }}
        />
      </Box>

      {stats && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
          <Card sx={{ border: '1px solid #B1C0B1', bgcolor: '#FFFFFF' }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: '#5A6A5A', mb: 0.5 }}>
                إجمالي الحسابات
              </Typography>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#1A2E1A' }}>
                {stats.totalAccounts}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ border: '1px solid #B1C0B1', bgcolor: '#FFFFFF' }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: '#5A6A5A', mb: 0.5 }}>
                إجمالي النقاط
              </Typography>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#86B573' }}>
                {stats.totalPointsBalance.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ border: '1px solid #B1C0B1', bgcolor: '#FFFFFF' }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: '#5A6A5A', mb: 0.5 }}>
                إجمالي المكتسب
              </Typography>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#1A2E1A' }}>
                {stats.totalLifetimeEarned.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ border: '1px solid #B1C0B1', bgcolor: '#FFFFFF' }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: '#5A6A5A', mb: 0.5 }}>
                إجمالي المستهلك
              </Typography>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#1A2E1A' }}>
                {stats.totalPointsRedeemed.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {accounts.length === 0 ? (
        <EmptyState
          title="لا توجد حسابات ولاء"
          description="لم يتم العثور على حسابات مطابقة للبحث."
        />
      ) : (
        <DataTable
          data={accounts}
          columns={columns}
          searchable={false}
          isLoading={isLoading}
          onRowClick={(row) => navigate(`/loyalty/${row.userId}`)}
        />
      )}

      <Dialog
        open={adjustDialogOpen}
        onClose={() => setAdjustDialogOpen(false)}
        PaperProps={{ sx: { bgcolor: '#FFFFFF', border: '1px solid #B1C0B1' } }}
      >
        <DialogTitle sx={{ color: '#1A2E1A' }}>
          تعديل نقاط الولاء {selectedAccount?.userName && `- ${selectedAccount.userName}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 320 }}>
            <Typography variant="body2" sx={{ color: '#5A6A5A' }}>
              استخدم رقم موجب للإضافة ورقم سالب للخصم (مثال: -50)
            </Typography>
            <TextField
              label="عدد النقاط"
              type="number"
              value={adjustPoints || ''}
              onChange={(e) => setAdjustPoints(Number(e.target.value) || 0)}
              fullWidth
            />
            <TextField
              label="الوصف (اختياري)"
              value={adjustDescription}
              onChange={(e) => setAdjustDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdjustDialogOpen(false)}>إلغاء</Button>
          <Button
            variant="contained"
            onClick={() => adjustMutation.mutate()}
            disabled={adjustMutation.isPending || adjustPoints === 0}
            sx={{ bgcolor: '#86B573', '&:hover': { bgcolor: '#6B9B5E' } }}
          >
            تأكيد التعديل
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoyaltyAccountsPage;
