import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DataTable from '../../components/tables/DataTable';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { useSnackbar } from '../../hooks/useSnackbar';
import {
  mockGetNotificationTemplates,
  mockCreateNotificationTemplate,
  mockUpdateNotificationTemplate,
  mockDeleteNotificationTemplate,
  NotificationTemplate,
  NotificationType,
  TargetAudience,
} from '../../services/api/notifications';
import { useNavigate } from 'react-router-dom';

const NotificationTemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [notificationType, setNotificationType] = useState<NotificationType>('info');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('all');
  const [variables, setVariables] = useState('');

  const { data: templates, isLoading } = useQuery({
    queryKey: ['notification-templates'],
    queryFn: () => mockGetNotificationTemplates(),
  });

  const createMutation = useMutation({
    mutationFn: mockCreateNotificationTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      showSnackbar('تم إنشاء القالب بنجاح', 'success');
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      showSnackbar('حدث خطأ أثناء إنشاء القالب', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NotificationTemplate> }) =>
      mockUpdateNotificationTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      showSnackbar('تم تحديث القالب بنجاح', 'success');
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      showSnackbar('حدث خطأ أثناء تحديث القالب', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: mockDeleteNotificationTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      showSnackbar('تم حذف القالب بنجاح', 'success');
    },
    onError: () => {
      showSnackbar('حدث خطأ أثناء حذف القالب', 'error');
    },
  });

  const resetForm = () => {
    setName('');
    setTitle('');
    setMessage('');
    setNotificationType('info');
    setTargetAudience('all');
    setVariables('');
    setEditingTemplate(null);
  };

  const handleEdit = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    setName(template.name);
    setTitle(template.title);
    setMessage(template.message);
    setNotificationType(template.notificationType);
    setTargetAudience(template.targetAudience);
    setVariables(template.variables?.join(', ') || '');
    setDialogOpen(true);
  };

  const handleDelete = (template: NotificationTemplate) => {
    if (window.confirm(`هل أنت متأكد من حذف القالب "${template.name}"؟`)) {
      deleteMutation.mutate(template.id);
    }
  };

  const handleUse = useCallback((template: NotificationTemplate) => {
    navigate('/notifications', {
      state: {
        template: {
          title: template.title,
          message: template.message,
          notificationType: template.notificationType,
          targetAudience: template.targetAudience,
        },
      },
    });
  }, [navigate]);

  const handleDialogSave = () => {
    if (!name.trim() || !title.trim() || !message.trim()) {
      showSnackbar('الرجاء إدخال اسم القالب والعنوان والرسالة', 'warning');
      return;
    }

    const data = {
      name,
      title,
      message,
      notificationType,
      targetAudience,
      variables: variables.trim() ? variables.split(',').map((v) => v.trim()) : undefined,
    };

    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getNotificationTypeLabel = (type: NotificationType) => {
    const labels: Record<NotificationType, string> = {
      info: 'معلومات',
      promotion: 'عرض ترويجي',
      success: 'نجاح',
      warning: 'تحذير',
      error: 'خطأ',
    };
    return labels[type] || type;
  };

  const getTargetLabel = (target: TargetAudience) => {
    switch (target) {
      case 'all':
        return 'جميع المستخدمين';
      case 'customers':
        return 'العملاء';
      case 'drivers':
        return 'السائقون';
      case 'restaurants':
        return 'المطاعم';
      case 'specific':
        return 'مستخدمون محددون';
      default:
        return target;
    }
  };

  const columns = useMemo<ColumnDef<NotificationTemplate>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'اسم القالب',
        cell: (info) => (
          <Typography sx={{ color: '#E5E7EB', fontWeight: 500, fontSize: 14 }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'title',
        header: 'العنوان',
        cell: (info) => (
          <Typography sx={{ color: '#E5E7EB', fontSize: 14 }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'notificationType',
        header: 'النوع',
        cell: (info) => (
          <Chip
            label={getNotificationTypeLabel(info.getValue() as NotificationType)}
            size="small"
            sx={{
              bgcolor: '#2563EB20',
              color: '#2563EB',
              fontWeight: 500,
              fontSize: 12,
            }}
          />
        ),
      },
      {
        accessorKey: 'targetAudience',
        header: 'الجمهور المستهدف',
        cell: (info) => (
          <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>
            {getTargetLabel(info.getValue() as TargetAudience)}
          </Typography>
        ),
      },
      {
        accessorKey: 'variables',
        header: 'المتغيرات',
        cell: (info) => {
          const vars = info.getValue() as string[] | undefined;
          return (
            <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>
              {vars && vars.length > 0 ? vars.join(', ') : '-'}
            </Typography>
          );
        },
      },
      {
        id: 'actions',
        header: 'الإجراءات',
        cell: (info) => {
          const template = info.row.original as NotificationTemplate;
          return (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleUse(template);
                }}
                sx={{
                  borderColor: '#22C55E',
                  color: '#22C55E',
                  fontSize: 12,
                  '&:hover': {
                    borderColor: '#16A34A',
                    bgcolor: '#22C55E10',
                  },
                }}
              >
                استخدام
              </Button>
            </Box>
          );
        },
      },
    ],
    [handleUse]
  );

  if (isLoading) {
    return <SkeletonLoader variant="table" />;
  }

  return (
    <Box sx={{ color: '#E5E7EB' }}>
      <Box
        sx={{
          mb: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: { xs: 1.5, sm: 2 },
        }}
      >
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            mb={0.5}
            sx={{ fontSize: { xs: 20, sm: 24 } }}
          >
            قوالب الإشعارات
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: '#9CA3AF', fontSize: { xs: 12, sm: 14 } }}
          >
            إنشاء وإدارة قوالب الإشعارات الجاهزة
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
          size="small"
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          إضافة قالب
        </Button>
      </Box>

      {templates && templates.length > 0 ? (
        <DataTable
          data={templates}
          columns={columns}
          isLoading={isLoading}
          searchable={false}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <EmptyState
          title="لا توجد قوالب"
          description="لم يتم العثور على أي قوالب إشعارات."
        />
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          resetForm();
        }}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            bgcolor: '#111827',
            border: '1px solid #1F2937',
            m: { xs: 1, sm: 2 },
          },
        }}
      >
        <DialogTitle sx={{ color: '#E5E7EB' }}>
          {editingTemplate ? 'تعديل القالب' : 'إضافة قالب جديد'}
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 0.5 }}>
            <TextField
              label="اسم القالب"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#020617',
                  '& fieldset': { borderColor: '#1F2937' },
                },
                input: { color: '#E5E7EB' },
                '& .MuiInputLabel-root': { color: '#9CA3AF' },
              }}
            />

            <TextField
              label="عنوان الإشعار"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
              helperText="يمكنك استخدام متغيرات مثل {{orderId}} أو {{status}}"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#020617',
                  '& fieldset': { borderColor: '#1F2937' },
                },
                input: { color: '#E5E7EB' },
                '& .MuiInputLabel-root': { color: '#9CA3AF' },
                '& .MuiFormHelperText-root': { color: '#6B7280' },
              }}
            />

            <TextField
              label="رسالة الإشعار"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              fullWidth
              multiline
              rows={4}
              required
              helperText="يمكنك استخدام متغيرات مثل {{orderId}} أو {{status}}"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#020617',
                  '& fieldset': { borderColor: '#1F2937' },
                },
                textarea: { color: '#E5E7EB' },
                '& .MuiInputLabel-root': { color: '#9CA3AF' },
                '& .MuiFormHelperText-root': { color: '#6B7280' },
              }}
            />

            <FormControl fullWidth>
              <InputLabel sx={{ color: '#9CA3AF' }}>نوع الإشعار</InputLabel>
              <Select
                value={notificationType}
                onChange={(e) => setNotificationType(e.target.value as NotificationType)}
                sx={{
                  bgcolor: '#020617',
                  color: '#E5E7EB',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1F2937' },
                }}
              >
                <MenuItem value="info">معلومات</MenuItem>
                <MenuItem value="promotion">عرض ترويجي</MenuItem>
                <MenuItem value="success">نجاح</MenuItem>
                <MenuItem value="warning">تحذير</MenuItem>
                <MenuItem value="error">خطأ</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel sx={{ color: '#9CA3AF' }}>الجمهور المستهدف</InputLabel>
              <Select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as TargetAudience)}
                sx={{
                  bgcolor: '#020617',
                  color: '#E5E7EB',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1F2937' },
                }}
              >
                <MenuItem value="all">جميع المستخدمين</MenuItem>
                <MenuItem value="customers">العملاء فقط</MenuItem>
                <MenuItem value="drivers">السائقون فقط</MenuItem>
                <MenuItem value="restaurants">المطاعم فقط</MenuItem>
                <MenuItem value="specific">مستخدمون محددون</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="المتغيرات (اختياري)"
              value={variables}
              onChange={(e) => setVariables(e.target.value)}
              fullWidth
              helperText="أدخل المتغيرات مفصولة بفواصل (مثال: orderId, status, userName)"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#020617',
                  '& fieldset': { borderColor: '#1F2937' },
                },
                input: { color: '#E5E7EB' },
                '& .MuiInputLabel-root': { color: '#9CA3AF' },
                '& .MuiFormHelperText-root': { color: '#6B7280' },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDialogOpen(false);
              resetForm();
            }}
          >
            إلغاء
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDialogSave}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {editingTemplate ? 'تحديث' : 'إنشاء'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationTemplatesPage;

