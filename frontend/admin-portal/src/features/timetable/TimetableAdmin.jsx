import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  Truck,
  Droplets,
  Plus,
  Pencil,
  Trash2,
  Save,
  RotateCcw,
  AlertCircle,
  Clock,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { controlClass } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { Chip } from '@/components/ui/chip';
import { QueryError } from '@/components/QueryError';
import {
  TableShell,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  TableMessageRow,
} from '@/components/ui/table';
import { useAdminTimetable, useTimetableMutations } from './hooks';

export function TimetableAdmin() {
  const { t, i18n } = useTranslation();
  const isMr = (i18n.language || '').toLowerCase().startsWith('mr');

  const { data, isLoading, isError, refetch } = useAdminTimetable();
  const { update, reset } = useTimetableMutations();

  const [activeTab, setActiveTab] = useState('ghantagadi'); // 'ghantagadi' | 'water'
  const [ghantagadiList, setGhantagadiList] = useState([]);
  const [waterList, setWaterList] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Edit / Add Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null if adding new
  const [modalType, setModalType] = useState('ghantagadi'); // 'ghantagadi' | 'water'

  // Form values
  const [formData, setFormData] = useState({});

  // Reset confirmation modal
  const [resetModalOpen, setResetModalOpen] = useState(false);

  // Sync server data into local editable state on initial load or query refresh
  useEffect(() => {
    if (data) {
      setGhantagadiList(data.ghantagadi || []);
      setWaterList(data.water || []);
      setHasChanges(false);
    }
  }, [data]);

  const openAddModal = (type) => {
    setModalType(type);
    setEditingItem(null);
    if (type === 'ghantagadi') {
      setFormData({
        id: `g_${Date.now()}`,
        ward_en: '',
        ward_mr: '',
        timingMorning_en: '07:00 AM – 09:00 AM',
        timingMorning_mr: 'सकाळी ०७:०० – ०९:००',
        timingEvening_en: '04:00 PM – 05:30 PM',
        timingEvening_mr: 'संध्याकाळी ०४:०० – ०५:३०',
        days_en: 'Daily (Mon – Sat)',
        days_mr: 'दररोज (सोम – शनि)',
        driverName_en: '',
        driverName_mr: '',
        driverMobile: '',
        vehicleNo: '',
        status_en: 'Active',
        status_mr: 'सुरू',
      });
    } else {
      setFormData({
        id: `w_${Date.now()}`,
        zone_en: '',
        zone_mr: '',
        timing_en: '06:00 AM – 07:30 AM',
        timing_mr: 'सकाळी ०६:०० – ०७:३०',
        frequency_en: 'Daily Morning',
        frequency_mr: 'दररोज सकाळी',
        operatorName_en: '',
        operatorName_mr: '',
        operatorMobile: '',
        source_en: '',
        source_mr: '',
        status_en: 'Active Now',
        status_mr: 'सध्या सुरू',
      });
    }
    setEditModalOpen(true);
  };

  const openEditModal = (item, type) => {
    setModalType(type);
    setEditingItem(item);
    setFormData({ ...item });
    setEditModalOpen(true);
  };

  const handleFormField = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (modalType === 'ghantagadi') {
      if (editingItem) {
        setGhantagadiList((prev) =>
          prev.map((item) => (item.id === editingItem.id ? { ...formData } : item)),
        );
      } else {
        setGhantagadiList((prev) => [...prev, { ...formData }]);
      }
    } else {
      if (editingItem) {
        setWaterList((prev) =>
          prev.map((item) => (item.id === editingItem.id ? { ...formData } : item)),
        );
      } else {
        setWaterList((prev) => [...prev, { ...formData }]);
      }
    }
    setHasChanges(true);
    setEditModalOpen(false);
  };

  const handleDelete = (id, type) => {
    if (
      window.confirm(t('timetable.deleteConfirm', 'Are you sure you want to delete this schedule?'))
    ) {
      if (type === 'ghantagadi') {
        setGhantagadiList((prev) => prev.filter((item) => item.id !== id));
      } else {
        setWaterList((prev) => prev.filter((item) => item.id !== id));
      }
      setHasChanges(true);
    }
  };

  const handleSaveAll = () => {
    update.mutate(
      { ghantagadi: ghantagadiList, water: waterList },
      {
        onSuccess: () => {
          toast.success(t('timetable.saveSuccess', 'Timetable updated successfully'));
          setHasChanges(false);
        },
        onError: () => {
          toast.error(t('timetable.saveError', 'Failed to save timetable'));
        },
      },
    );
  };

  const handleConfirmReset = () => {
    reset.mutate(undefined, {
      onSuccess: () => {
        toast.success(t('timetable.resetSuccess', 'Timetable reset to system defaults'));
        setResetModalOpen(false);
        setHasChanges(false);
      },
      onError: () => {
        toast.error(t('timetable.resetError', 'Failed to reset timetable'));
      },
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-title text-foreground font-extrabold tracking-tight">
            {t('timetable.title', 'Timetable Management')}
          </h1>
          <p className="mt-0.5 text-caption text-muted-foreground">
            {t(
              'timetable.subtitle',
              'Modify schedules for Ghantagadi waste collection and Water Supply distribution',
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setResetModalOpen(true)}
            disabled={reset.isPending || update.isPending}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4 mr-1.5" />
            {t('timetable.resetDefaults', 'Reset Defaults')}
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleSaveAll}
            disabled={!hasChanges || update.isPending}
            className={
              hasChanges
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-500/30'
                : ''
            }
          >
            <Save className="h-4 w-4 mr-1.5" />
            {t('timetable.saveChanges', 'Save All Changes')}
          </Button>

          <Button
            size="sm"
            onClick={() => openAddModal(activeTab)}
            className="bg-[#4169E1] hover:bg-[#3154b3] text-white shadow-xs"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            {activeTab === 'ghantagadi'
              ? t('timetable.addGhantagadi', 'Add Ghantagadi Route')
              : t('timetable.addWater', 'Add Water Supply Route')}
          </Button>
        </div>
      </div>

      {/* Unsaved changes alert */}
      {hasChanges && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300 shadow-xs">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="flex-1 font-medium">
            {t(
              'timetable.unsavedNotice',
              'You have unsaved changes in the timetable. Please click "Save All Changes" to publish them to villagers.',
            )}
          </div>
          <Button
            size="sm"
            onClick={handleSaveAll}
            disabled={update.isPending}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8 px-3"
          >
            <Save className="h-3.5 w-3.5 mr-1" />
            {t('timetable.save', 'Save')}
          </Button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border/80 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('ghantagadi')}
          className={`flex items-center gap-2.5 px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'ghantagadi'
              ? 'border-[#4169E1] text-[#1E3A8A] dark:border-blue-400 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-950/20 rounded-t-lg'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Truck className="h-4 w-4" />
          <span>{t('timetable.ghantagadiTab', 'Ghantagadi Schedule')}</span>
          <span className="rounded-full bg-slate-200/80 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold tabular-nums text-foreground">
            {ghantagadiList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('water')}
          className={`flex items-center gap-2.5 px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'water'
              ? 'border-[#4169E1] text-[#1E3A8A] dark:border-blue-400 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-950/20 rounded-t-lg'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Droplets className="h-4 w-4" />
          <span>{t('timetable.waterTab', 'Water Supply Schedule')}</span>
          <span className="rounded-full bg-slate-200/80 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold tabular-nums text-foreground">
            {waterList.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Ghantagadi Table */}
      {activeTab === 'ghantagadi' && (
        <TableShell>
          <Table>
            <THead>
              <TR>
                <TH>{t('timetable.ward', 'Ward / Area')}</TH>
                <TH>{t('timetable.morningTiming', 'Morning Timing')}</TH>
                <TH>{t('timetable.eveningTiming', 'Evening Timing')}</TH>
                <TH>{t('timetable.operatingDays', 'Days')}</TH>
                <TH>{t('timetable.driverStaff', 'Driver & Contact')}</TH>
                <TH>{t('timetable.vehicle', 'Vehicle No.')}</TH>
                <TH>{t('timetable.status', 'Status')}</TH>
                <TH className="text-right">{t('timetable.actions', 'Actions')}</TH>
              </TR>
            </THead>
            <TBody>
              {isLoading ? (
                <TableMessageRow colSpan={8}>{t('common.loading', 'Loading…')}</TableMessageRow>
              ) : isError ? (
                <TableMessageRow colSpan={8}>
                  <QueryError
                    message={t('timetable.loadError', 'Could not load timetable')}
                    onRetry={refetch}
                  />
                </TableMessageRow>
              ) : ghantagadiList.length ? (
                ghantagadiList.map((item) => (
                  <TR key={item.id}>
                    <TD className="font-semibold text-foreground">
                      <div>{item.ward_en}</div>
                      <div className="text-caption text-muted-foreground font-normal">
                        {item.ward_mr}
                      </div>
                    </TD>
                    <TD className="text-sm">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span>{item.timingMorning_en}</span>
                      </div>
                      <div className="text-caption text-muted-foreground">
                        {item.timingMorning_mr}
                      </div>
                    </TD>
                    <TD className="text-sm">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Clock className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                        <span>{item.timingEvening_en}</span>
                      </div>
                      <div className="text-caption text-muted-foreground">
                        {item.timingEvening_mr}
                      </div>
                    </TD>
                    <TD className="text-xs">
                      <div>{item.days_en}</div>
                      <div className="text-muted-foreground">{item.days_mr}</div>
                    </TD>
                    <TD className="text-sm">
                      <div className="font-medium text-foreground">{item.driverName_en}</div>
                      {item.driverMobile && (
                        <div className="flex items-center gap-1 text-caption text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span className="tabular-nums">{item.driverMobile}</span>
                        </div>
                      )}
                    </TD>
                    <TD className="text-xs font-mono font-medium">{item.vehicleNo}</TD>
                    <TD>
                      <Chip color="blue">
                        {isMr ? item.status_mr || item.status_en : item.status_en}
                      </Chip>
                    </TD>
                    <TD className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                          onClick={() => openEditModal(item, 'ghantagadi')}
                          aria-label={t('timetable.edit', 'Edit')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          onClick={() => handleDelete(item.id, 'ghantagadi')}
                          aria-label={t('timetable.delete', 'Delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TD>
                  </TR>
                ))
              ) : (
                <TableMessageRow colSpan={8}>
                  {t(
                    'timetable.emptyGhantagadi',
                    "No Ghantagadi routes found. Click 'Add Ghantagadi Route' to create one.",
                  )}
                </TableMessageRow>
              )}
            </TBody>
          </Table>
        </TableShell>
      )}

      {/* Tab 2: Water Supply Table */}
      {activeTab === 'water' && (
        <TableShell>
          <Table>
            <THead>
              <TR>
                <TH>{t('timetable.zone', 'Zone / Ward')}</TH>
                <TH>{t('timetable.waterTiming', 'Supply Timing')}</TH>
                <TH>{t('timetable.frequency', 'Frequency')}</TH>
                <TH>{t('timetable.operator', 'Operator & Mobile')}</TH>
                <TH>{t('timetable.source', 'Source / Reservoir')}</TH>
                <TH>{t('timetable.status', 'Status')}</TH>
                <TH className="text-right">{t('timetable.actions', 'Actions')}</TH>
              </TR>
            </THead>
            <TBody>
              {isLoading ? (
                <TableMessageRow colSpan={7}>{t('common.loading', 'Loading…')}</TableMessageRow>
              ) : isError ? (
                <TableMessageRow colSpan={7}>
                  <QueryError
                    message={t('timetable.loadError', 'Could not load timetable')}
                    onRetry={refetch}
                  />
                </TableMessageRow>
              ) : waterList.length ? (
                waterList.map((item) => (
                  <TR key={item.id}>
                    <TD className="font-semibold text-foreground">
                      <div>{item.zone_en}</div>
                      <div className="text-caption text-muted-foreground font-normal">
                        {item.zone_mr}
                      </div>
                    </TD>
                    <TD className="text-sm">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Clock className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        <span>{item.timing_en}</span>
                      </div>
                      <div className="text-caption text-muted-foreground">{item.timing_mr}</div>
                    </TD>
                    <TD className="text-xs">
                      <div>{item.frequency_en}</div>
                      <div className="text-muted-foreground">{item.frequency_mr}</div>
                    </TD>
                    <TD className="text-sm">
                      <div className="font-medium text-foreground">{item.operatorName_en}</div>
                      {item.operatorMobile && (
                        <div className="flex items-center gap-1 text-caption text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span className="tabular-nums">{item.operatorMobile}</span>
                        </div>
                      )}
                    </TD>
                    <TD className="text-xs">
                      <div className="font-medium">{item.source_en}</div>
                      <div className="text-muted-foreground">{item.source_mr}</div>
                    </TD>
                    <TD>
                      <Chip color="green">
                        {isMr ? item.status_mr || item.status_en : item.status_en}
                      </Chip>
                    </TD>
                    <TD className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                          onClick={() => openEditModal(item, 'water')}
                          aria-label={t('timetable.edit', 'Edit')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          onClick={() => handleDelete(item.id, 'water')}
                          aria-label={t('timetable.delete', 'Delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TD>
                  </TR>
                ))
              ) : (
                <TableMessageRow colSpan={7}>
                  {t(
                    'timetable.emptyWater',
                    "No Water Supply routes found. Click 'Add Water Supply Route' to create one.",
                  )}
                </TableMessageRow>
              )}
            </TBody>
          </Table>
        </TableShell>
      )}

      {/* Edit / Add Route Dialog */}
      <Dialog
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={
          editingItem
            ? t('timetable.editRoute', 'Edit Schedule')
            : t('timetable.newRoute', 'Add Schedule')
        }
        className="max-w-2xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              {t('timetable.cancel', 'Cancel')}
            </Button>
            <Button form="timetable-form" type="submit">
              {t('timetable.save', 'Save')}
            </Button>
          </>
        }
      >
        <form id="timetable-form" onSubmit={handleModalSubmit} className="space-y-4">
          {modalType === 'ghantagadi' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label={t('timetable.wardEn', 'Ward (English)')}>
                  {({ id }) => (
                    <input
                      id={id}
                      required
                      placeholder="e.g. Ward 1 & 2"
                      className={controlClass}
                      value={formData.ward_en || ''}
                      onChange={handleFormField('ward_en')}
                    />
                  )}
                </Field>
                <Field label={t('timetable.wardMr', 'Ward (Marathi)')}>
                  {({ id }) => (
                    <input
                      id={id}
                      required
                      placeholder="उदा. प्रभाग १ व २"
                      className={controlClass}
                      value={formData.ward_mr || ''}
                      onChange={handleFormField('ward_mr')}
                    />
                  )}
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label={t('timetable.timingMorningEn', 'Morning Timing (English)')}>
                  {({ id }) => (
                    <input
                      id={id}
                      required
                      placeholder="07:00 AM – 09:00 AM"
                      className={controlClass}
                      value={formData.timingMorning_en || ''}
                      onChange={handleFormField('timingMorning_en')}
                    />
                  )}
                </Field>
                <Field label={t('timetable.timingMorningMr', 'Morning Timing (Marathi)')}>
                  {({ id }) => (
                    <input
                      id={id}
                      required
                      placeholder="सकाळी ०७:०० – ०९:००"
                      className={controlClass}
                      value={formData.timingMorning_mr || ''}
                      onChange={handleFormField('timingMorning_mr')}
                    />
                  )}
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label={t('timetable.timingEveningEn', 'Evening Timing (English)')}>
                  {({ id }) => (
                    <input
                      id={id}
                      required
                      placeholder="04:00 PM – 05:30 PM"
                      className={controlClass}
                      value={formData.timingEvening_en || ''}
                      onChange={handleFormField('timingEvening_en')}
                    />
                  )}
                </Field>
                <Field label={t('timetable.timingEveningMr', 'Evening Timing (Marathi)')}>
                  {({ id }) => (
                    <input
                      id={id}
                      required
                      placeholder="संध्याकाळी ०४:०० – ०५:३०"
                      className={controlClass}
                      value={formData.timingEvening_mr || ''}
                      onChange={handleFormField('timingEvening_mr')}
                    />
                  )}
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label={t('timetable.daysEn', 'Operational Days (English)')}>
                  {({ id }) => (
                    <input
                      id={id}
                      required
                      placeholder="Daily (Mon – Sat)"
                      className={controlClass}
                      value={formData.days_en || ''}
                      onChange={handleFormField('days_en')}
                    />
                  )}
                </Field>
                <Field label={t('timetable.daysMr', 'Operational Days (Marathi)')}>
                  {({ id }) => (
                    <input
                      id={id}
                      required
                      placeholder="दररोज (सोम – शनि)"
                      className={controlClass}
                      value={formData.days_mr || ''}
                      onChange={handleFormField('days_mr')}
                    />
                  )}
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label={t('timetable.driverNameEn', 'Driver Name (English)')}>
                  {({ id }) => (
                    <input
                      id={id}
                      required
                      placeholder="e.g. Ramesh Patil"
                      className={controlClass}
                      value={formData.driverName_en || ''}
                      onChange={handleFormField('driverName_en')}
                    />
                  )}
                </Field>
                <Field label={t('timetable.driverNameMr', 'Driver Name (Marathi)')}>
                  {({ id }) => (
                    <input
                      id={id}
                      required
                      placeholder="उदा. रमेश पाटील"
                      className={controlClass}
                      value={formData.driverName_mr || ''}
                      onChange={handleFormField('driverName_mr')}
                    />
                  )}
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label={t('timetable.driverMobile', 'Contact Mobile')}>
                  {({ id }) => (
                    <input
                      id={id}
                      type="tel"
                      placeholder="9823012345"
                      className={controlClass}
                      value={formData.driverMobile || ''}
                      onChange={handleFormField('driverMobile')}
                    />
                  )}
                </Field>
                <Field label={t('timetable.vehicleNo', 'Vehicle Number')}>
                  {({ id }) => (
                    <input
                      id={id}
                      placeholder="MH-10-GP-1001"
                      className={controlClass}
                      value={formData.vehicleNo || ''}
                      onChange={handleFormField('vehicleNo')}
                    />
                  )}
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label={t('timetable.statusEn', 'Status (English)')}>
                  {({ id }) => (
                    <input
                      id={id}
                      placeholder="Active Morning / Scheduled"
                      className={controlClass}
                      value={formData.status_en || ''}
                      onChange={handleFormField('status_en')}
                    />
                  )}
                </Field>
                <Field label={t('timetable.statusMr', 'Status (Marathi)')}>
                  {({ id }) => (
                    <input
                      id={id}
                      placeholder="सकाळची फेरी सुरू / नियोजित"
                      className={controlClass}
                      value={formData.status_mr || ''}
                      onChange={handleFormField('status_mr')}
                    />
                  )}
                </Field>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label={t('timetable.zoneEn', 'Zone / Ward (English)')}>
                  {({ id }) => (
                    <input
                      id={id}
                      required
                      placeholder="e.g. Ward 1 & 2"
                      className={controlClass}
                      value={formData.zone_en || ''}
                      onChange={handleFormField('zone_en')}
                    />
                  )}
                </Field>
                <Field label={t('timetable.zoneMr', 'Zone / Ward (Marathi)')}>
                  {({ id }) => (
                    <input
                      id={id}
                      required
                      placeholder="उदा. प्रभाग १ व २"
                      className={controlClass}
                      value={formData.zone_mr || ''}
                      onChange={handleFormField('zone_mr')}
                    />
                  )}
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label={t('timetable.timingEn', 'Supply Timing (English)')}>
                  {({ id }) => (
                    <input
                      id={id}
                      required
                      placeholder="06:00 AM – 07:30 AM"
                      className={controlClass}
                      value={formData.timing_en || ''}
                      onChange={handleFormField('timing_en')}
                    />
                  )}
                </Field>
                <Field label={t('timetable.timingMr', 'Supply Timing (Marathi)')}>
                  {({ id }) => (
                    <input
                      id={id}
                      required
                      placeholder="सकाळी ०६:०० – ०७:३०"
                      className={controlClass}
                      value={formData.timing_mr || ''}
                      onChange={handleFormField('timing_mr')}
                    />
                  )}
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label={t('timetable.frequencyEn', 'Frequency (English)')}>
                  {({ id }) => (
                    <input
                      id={id}
                      required
                      placeholder="Daily Morning"
                      className={controlClass}
                      value={formData.frequency_en || ''}
                      onChange={handleFormField('frequency_en')}
                    />
                  )}
                </Field>
                <Field label={t('timetable.frequencyMr', 'Frequency (Marathi)')}>
                  {({ id }) => (
                    <input
                      id={id}
                      required
                      placeholder="दररोज सकाळी"
                      className={controlClass}
                      value={formData.frequency_mr || ''}
                      onChange={handleFormField('frequency_mr')}
                    />
                  )}
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label={t('timetable.operatorNameEn', 'Operator Name (English)')}>
                  {({ id }) => (
                    <input
                      id={id}
                      required
                      placeholder="e.g. Suresh More"
                      className={controlClass}
                      value={formData.operatorName_en || ''}
                      onChange={handleFormField('operatorName_en')}
                    />
                  )}
                </Field>
                <Field label={t('timetable.operatorNameMr', 'Operator Name (Marathi)')}>
                  {({ id }) => (
                    <input
                      id={id}
                      required
                      placeholder="उदा. सुरेश मोरे"
                      className={controlClass}
                      value={formData.operatorName_mr || ''}
                      onChange={handleFormField('operatorName_mr')}
                    />
                  )}
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label={t('timetable.operatorMobile', 'Operator Mobile')}>
                  {({ id }) => (
                    <input
                      id={id}
                      type="tel"
                      placeholder="9890123456"
                      className={controlClass}
                      value={formData.operatorMobile || ''}
                      onChange={handleFormField('operatorMobile')}
                    />
                  )}
                </Field>
                <Field label={t('timetable.statusEn', 'Status (English)')}>
                  {({ id }) => (
                    <input
                      id={id}
                      placeholder="Active Now / Upcoming"
                      className={controlClass}
                      value={formData.status_en || ''}
                      onChange={handleFormField('status_en')}
                    />
                  )}
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label={t('timetable.sourceEn', 'Water Source / Tank (English)')}>
                  {({ id }) => (
                    <input
                      id={id}
                      placeholder="Main Elevated Reservoir A"
                      className={controlClass}
                      value={formData.source_en || ''}
                      onChange={handleFormField('source_en')}
                    />
                  )}
                </Field>
                <Field label={t('timetable.sourceMr', 'Water Source / Tank (Marathi)')}>
                  {({ id }) => (
                    <input
                      id={id}
                      placeholder="मुख्य जलकुंभ अ"
                      className={controlClass}
                      value={formData.source_mr || ''}
                      onChange={handleFormField('source_mr')}
                    />
                  )}
                </Field>
              </div>
            </>
          )}
        </form>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog
        open={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title={t('timetable.resetDefaults', 'Reset to Default Schedule')}
        footer={
          <>
            <Button variant="outline" onClick={() => setResetModalOpen(false)}>
              {t('timetable.cancel', 'Cancel')}
            </Button>
            <Button variant="destructive" onClick={handleConfirmReset} disabled={reset.isPending}>
              {t('timetable.resetDefaults', 'Reset Defaults')}
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          {t(
            'timetable.confirmReset',
            'Are you sure you want to reset all schedules to system defaults? Any unsaved edits will be lost.',
          )}
        </p>
      </Dialog>
    </div>
  );
}
