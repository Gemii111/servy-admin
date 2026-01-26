import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  CircularProgress,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { useSnackbar } from '../../hooks/useSnackbar';
import {
  mockSendNotification,
  NotificationType,
  NotificationPriority,
  TargetAudience,
} from '../../services/api/notifications';
import { mockGetUsers, User } from '../../services/api/users';

const SendNotificationPage: React.FC = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  // Check if template was passed from templates page
  const templateData = location.state?.template;

  const [title, setTitle] = useState(templateData?.title || '');
  const [message, setMessage] = useState(templateData?.message || '');
  const [notificationType, setNotificationType] = useState<NotificationType>(
    templateData?.notificationType || 'info'
  );
  const [priority, setPriority] = useState<NotificationPriority>('medium');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>(
    templateData?.targetAudience || 'all'
  );
  const [sendMode, setSendMode] = useState<'now' | 'schedule'>('now');
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [userSelectorOpen, setUserSelectorOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');

  // Fetch users for selector
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users', 'selector', userTypeFilter, userSearchQuery],
    queryFn: () =>
      mockGetUsers({
        userType: userTypeFilter !== 'all' ? userTypeFilter : undefined,
        search: userSearchQuery || undefined,
        limit: 100,
      }),
    enabled: userSelectorOpen,
  });

  const sendMutation = useMutation({
    mutationFn: mockSendNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      showSnackbar('تم إرسال الإشعار بنجاح', 'success');
      // Reset form
      setTitle('');
      setMessage('');
      setNotificationType('info');
      setPriority('medium');
      setTargetAudience('all');
      setSendMode('now');
      setScheduledAt(null);
      setSelectedUsers([]);
    },
    onError: () => {
      showSnackbar('حدث خطأ أثناء إرسال الإشعار', 'error');
    },
  });

  const handleSubmit = () => {
    if (!title.trim() || !message.trim()) {
      showSnackbar('الرجاء إدخال العنوان والرسالة', 'warning');
      return;
    }

    if (targetAudience === 'specific' && selectedUsers.length === 0) {
      showSnackbar('الرجاء اختيار مستخدم واحد على الأقل', 'warning');
      return;
    }

    if (sendMode === 'schedule' && !scheduledAt) {
      showSnackbar('الرجاء اختيار تاريخ ووقت الجدولة', 'warning');
      return;
    }

    sendMutation.mutate({
      title,
      message,
      notificationType,
      priority,
      targetAudience,
      userIds: targetAudience === 'specific' ? selectedUsers : undefined,
      scheduledAt: sendMode === 'schedule' ? scheduledAt!.toISOString() : undefined,
      sendNow: sendMode === 'now',
    });
  };

  const handleToggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (usersData?.users) {
      if (selectedUsers.length === usersData.users.length) {
        setSelectedUsers([]);
      } else {
        setSelectedUsers(usersData.users.map((u) => u.id));
      }
    }
  };

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
            إرسال إشعار
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: '#9CA3AF', fontSize: { xs: 12, sm: 14 } }}
          >
            أرسل إشعارات للمستخدمين (عملاء، سائقين، مطاعم)
          </Typography>
        </Box>
      </Box>

      <Paper
        sx={{
          bgcolor: '#111827',
          borderRadius: 2,
          border: '1px solid #1F2937',
          p: { xs: 2, sm: 3 },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="عنوان الإشعار"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#020617',
                '& fieldset': { borderColor: '#1F2937' },
                '&:hover fieldset': { borderColor: '#374151' },
              },
              input: { color: '#E5E7EB' },
              '& .MuiInputLabel-root': { color: '#9CA3AF' },
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
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#020617',
                '& fieldset': { borderColor: '#1F2937' },
                '&:hover fieldset': { borderColor: '#374151' },
              },
              textarea: { color: '#E5E7EB' },
              '& .MuiInputLabel-root': { color: '#9CA3AF' },
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
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#374151' },
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
            <InputLabel sx={{ color: '#9CA3AF' }}>الأولوية</InputLabel>
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value as NotificationPriority)}
              sx={{
                bgcolor: '#020617',
                color: '#E5E7EB',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1F2937' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#374151' },
              }}
            >
              <MenuItem value="low">منخفضة</MenuItem>
              <MenuItem value="medium">متوسطة</MenuItem>
              <MenuItem value="high">عالية</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <FormLabel sx={{ color: '#9CA3AF', mb: 1 }}>الجمهور المستهدف</FormLabel>
            <RadioGroup
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value as TargetAudience)}
              sx={{ color: '#E5E7EB' }}
            >
              <FormControlLabel value="all" control={<Radio />} label="جميع المستخدمين" />
              <FormControlLabel value="customers" control={<Radio />} label="العملاء فقط" />
              <FormControlLabel value="drivers" control={<Radio />} label="السائقون فقط" />
              <FormControlLabel
                value="restaurants"
                control={<Radio />}
                label="المطاعم فقط"
              />
              <FormControlLabel
                value="specific"
                control={<Radio />}
                label="مستخدمون محددون"
              />
            </RadioGroup>
          </FormControl>

          {targetAudience === 'specific' && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setUserSelectorOpen(true)}
                  sx={{
                    borderColor: '#2563EB',
                    color: '#2563EB',
                    '&:hover': {
                      borderColor: '#3B82F6',
                      bgcolor: '#2563EB10',
                    },
                  }}
                >
                  {selectedUsers.length > 0
                    ? `تم اختيار ${selectedUsers.length} مستخدم`
                    : 'اختر المستخدمين'}
                </Button>
                {selectedUsers.length > 0 && (
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => setSelectedUsers([])}
                    sx={{ color: '#EF4444' }}
                  >
                    مسح الكل
                  </Button>
                )}
              </Box>
              {selectedUsers.length > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                    p: 1.5,
                    bgcolor: '#020617',
                    borderRadius: 1,
                    border: '1px solid #1F2937',
                    maxHeight: 150,
                    overflowY: 'auto',
                  }}
                >
                  {usersData?.users
                    .filter((u) => selectedUsers.includes(u.id))
                    .map((user) => (
                      <Chip
                        key={user.id}
                        label={`${user.name} (${user.userType === 'customer' ? 'عميل' : user.userType === 'driver' ? 'سائق' : 'مطعم'})`}
                        onDelete={() => handleToggleUser(user.id)}
                        size="small"
                        sx={{
                          bgcolor: '#2563EB20',
                          color: '#2563EB',
                          '& .MuiChip-deleteIcon': {
                            color: '#2563EB',
                          },
                        }}
                      />
                    ))}
                </Box>
              )}
            </Box>
          )}

          <FormControl fullWidth>
            <FormLabel sx={{ color: '#9CA3AF', mb: 1 }}>وضع الإرسال</FormLabel>
            <RadioGroup
              value={sendMode}
              onChange={(e) => setSendMode(e.target.value as 'now' | 'schedule')}
              sx={{ color: '#E5E7EB' }}
            >
              <FormControlLabel value="now" control={<Radio />} label="إرسال فوري" />
              <FormControlLabel
                value="schedule"
                control={<Radio />}
                label="جدولة للإرسال لاحقاً"
              />
            </RadioGroup>
          </FormControl>

          {sendMode === 'schedule' && (
            <TextField
              label="تاريخ ووقت الإرسال"
              type="datetime-local"
              value={
                scheduledAt
                  ? new Date(scheduledAt.getTime() - scheduledAt.getTimezoneOffset() * 60000)
                      .toISOString()
                      .slice(0, 16)
                  : ''
              }
              onChange={(e) => {
                if (e.target.value) {
                  setScheduledAt(new Date(e.target.value));
                } else {
                  setScheduledAt(null);
                }
              }}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#020617',
                  '& fieldset': { borderColor: '#1F2937' },
                  '&:hover fieldset': { borderColor: '#374151' },
                },
                input: { color: '#E5E7EB' },
                '& .MuiInputLabel-root': { color: '#9CA3AF' },
              }}
            />
          )}

          <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={sendMutation.isPending}
              sx={{ flex: 1 }}
            >
              {sendMode === 'now' ? 'إرسال الآن' : 'جدولة الإرسال'}
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => {
                setTitle('');
                setMessage('');
                setNotificationType('info');
                setPriority('medium');
                setTargetAudience('all');
                setSendMode('now');
                setScheduledAt(null);
                setSelectedUsers([]);
              }}
            >
              إعادة تعيين
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* User Selector Dialog */}
      <Dialog
        open={userSelectorOpen}
        onClose={() => setUserSelectorOpen(false)}
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
        <DialogTitle sx={{ color: '#E5E7EB' }}>اختر المستخدمين</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <TextField
                placeholder="ابحث عن مستخدم..."
                size="small"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#020617',
                    '& fieldset': { borderColor: '#1F2937' },
                    '&:hover fieldset': { borderColor: '#374151' },
                  },
                  input: { color: '#E5E7EB' },
                }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel sx={{ color: '#9CA3AF' }}>النوع</InputLabel>
                <Select
                  value={userTypeFilter}
                  onChange={(e) => setUserTypeFilter(e.target.value)}
                  sx={{
                    bgcolor: '#020617',
                    color: '#E5E7EB',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1F2937' },
                  }}
                  label="النوع"
                >
                  <MenuItem value="all">الكل</MenuItem>
                  <MenuItem value="customer">عملاء</MenuItem>
                  <MenuItem value="driver">سائقون</MenuItem>
                  <MenuItem value="restaurant">مطاعم</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pb: 1,
                borderBottom: '1px solid #1F2937',
              }}
            >
              <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>
                تم اختيار {selectedUsers.length} مستخدم
              </Typography>
              <Button size="small" onClick={handleSelectAll}>
                {usersData?.users &&
                selectedUsers.length === usersData.users.length
                  ? 'إلغاء اختيار الكل'
                  : 'اختيار الكل'}
              </Button>
            </Box>

            {usersLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={32} />
              </Box>
            ) : (
              <List
                sx={{
                  maxHeight: 400,
                  overflowY: 'auto',
                  bgcolor: '#020617',
                  borderRadius: 1,
                  border: '1px solid #1F2937',
                }}
              >
                {usersData?.users && usersData.users.length > 0 ? (
                  usersData.users.map((user) => (
                    <ListItem key={user.id} disablePadding>
                      <ListItemButton
                        onClick={() => handleToggleUser(user.id)}
                        sx={{
                          '&:hover': {
                            bgcolor: 'rgba(37,99,235,0.1)',
                          },
                        }}
                      >
                        <ListItemIcon>
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            edge="start"
                            sx={{
                              color: '#2563EB',
                              '&.Mui-checked': {
                                color: '#2563EB',
                              },
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography sx={{ color: '#E5E7EB', fontSize: 14 }}>
                              {user.name}
                            </Typography>
                          }
                          secondary={
                            <Typography sx={{ color: '#9CA3AF', fontSize: 12 }}>
                              {user.email} •{' '}
                              {user.userType === 'customer'
                                ? 'عميل'
                                : user.userType === 'driver'
                                ? 'سائق'
                                : 'مطعم'}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography sx={{ color: '#9CA3AF' }}>لا توجد نتائج</Typography>
                  </Box>
                )}
              </List>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserSelectorOpen(false)}>إغلاق</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setUserSelectorOpen(false)}
          >
            تأكيد ({selectedUsers.length})
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SendNotificationPage;

