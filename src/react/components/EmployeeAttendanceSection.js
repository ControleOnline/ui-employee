/* eslint-disable no-unused-vars */
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useStore} from '@store';
import {useMessage} from '@controleonline/ui-common/src/react/components/MessageService';
import DefaultExternalFilters from '@controleonline/ui-default/src/react/components/filters/DefaultExternalFilters';
import DefaultTable from '@controleonline/ui-default/src/react/components/table/DefaultTable';
import {getDateRange} from '@controleonline/ui-common/src/react/utils/dateRangeFilter';
import {resolveDefaultFileSource} from '@controleonline/ui-common/src/react/utils/fileUrl';
import DefaultUpload from '@controleonline/ui-default/src/react/components/upload/DefaultUpload';
import {
  extractFileId,
  uploadFileToApi,
  toFileIri,
} from '@controleonline/ui-default/src/react/components/upload/fileUpload';
import {buildEmploymentScopeRequestParams} from '@controleonline/ui-employee/src/shared/employeeNavigation';
import {
  DEFAULT_EMPLOYEE_CONTEXT,
  formatContextLabel,
  normalizeDateRange,
  resolvePeopleIri,
} from '@controleonline/ui-employee/src/shared/employeeFormats';

const normalizeText = value => String(value ?? '').trim();

const createDefaultDraft = (employeeId = null, companyId = null, context = DEFAULT_EMPLOYEE_CONTEXT) => ({
  id: '',
  company: companyId ? String(companyId) : '',
  people: employeeId ? String(employeeId) : '',
  context,
  absenceDate: '',
  reason: '',
  justificationFile: '',
  justificationFileLabel: '',
  fileObject: null,
});

const EmployeeAttendanceSection = ({employeeId, currentCompany, context = DEFAULT_EMPLOYEE_CONTEXT, styles}) => {
  const {showError, showSuccess} = useMessage() || {};
  const peopleStore = useStore('people');
  const themeStore = useStore('theme');
  const attendanceStore = useStore('attendance_reports');
  const absenceStore = useStore('people_absences');

  const {currentCompany: resolvedCurrentCompany} = peopleStore.getters || {};
  const {colors: themeColors} = themeStore.getters || {};
  const attendanceActions = attendanceStore.actions;
  const absenceActions = absenceStore.actions;
  const {items: attendanceRows = [], isLoading: attendanceLoading, summary: attendanceSummary} =
    attendanceStore.getters || {};
  const {items: absences = [], isLoading: absencesLoading} = absenceStore.getters || {};

  const [attendancePeriod, setAttendancePeriod] = useState({
    customRange: {from: '', to: ''},
    shortcut: '30d',
  });
  const attendancePeriodFilters = useMemo(
    () => ({date: attendancePeriod}),
    [attendancePeriod],
  );
  const handleAttendancePeriodFiltersChange = useCallback(
    nextFilters => {
      setAttendancePeriod(
        nextFilters?.date || {
          customRange: {from: '', to: ''},
          shortcut: 'all',
        },
      );
    },
    [],
  );
  const [absenceModalVisible, setAbsenceModalVisible] = useState(false);
  const [absenceDraft, setAbsenceDraft] = useState(() =>
    createDefaultDraft(employeeId, currentCompany?.id || resolvedCurrentCompany?.id, context),
  );
  const [absenceSaving, setAbsenceSaving] = useState(false);
  const [selectedAbsenceRow, setSelectedAbsenceRow] = useState(null);

  const attendanceDateRange = useMemo(
    () =>
      getDateRange(attendancePeriod.shortcut, attendancePeriod.customRange, {
        relativeMode: 'rolling',
        useCurrentMoment: true,
      }),
    [attendancePeriod.customRange, attendancePeriod.shortcut],
  );

  const attendanceRequestParams = useMemo(
    () =>
      buildEmploymentScopeRequestParams(currentCompany || resolvedCurrentCompany, {
        context,
        people: employeeId,
        periodStart: attendanceDateRange.after,
        periodEnd: attendanceDateRange.before,
      }),
    [
      attendanceDateRange.after,
      attendanceDateRange.before,
      context,
      currentCompany,
      employeeId,
      resolvedCurrentCompany,
    ],
  );

  const absenceRequestParams = useMemo(
    () =>
      buildEmploymentScopeRequestParams(currentCompany || resolvedCurrentCompany, {
        context,
        people: employeeId,
        'order[absenceDate]': 'desc',
        itemsPerPage: 50,
      }),
    [context, currentCompany, employeeId, resolvedCurrentCompany],
  );

  const loadAttendance = useCallback(async () => {
    const resolvedCompany = currentCompany || resolvedCurrentCompany;
    if (!employeeId || !resolvedCompany?.id) {
      return;
    }

    try {
      await attendanceActions.getItems(attendanceRequestParams);
    } catch (error) {
      showError?.(error?.message || 'Nao foi possivel carregar o ponto do funcionario.');
    }
  }, [attendanceActions, attendanceRequestParams, currentCompany, employeeId, resolvedCurrentCompany, showError]);

  const loadAbsences = useCallback(async () => {
    const resolvedCompany = currentCompany || resolvedCurrentCompany;
    if (!employeeId || !resolvedCompany?.id) {
      return;
    }

    try {
      await absenceActions.getItems(absenceRequestParams);
    } catch (error) {
      showError?.(error?.message || 'Nao foi possivel carregar as faltas.');
    }
  }, [absenceActions, absenceRequestParams, currentCompany, employeeId, resolvedCurrentCompany, showError]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  useEffect(() => {
    loadAbsences();
  }, [loadAbsences]);

  useEffect(() => {
    setAbsenceDraft(currentDraft =>
      currentDraft?.people && String(currentDraft.people) === String(employeeId)
        ? {
            ...currentDraft,
            company: String(currentCompany?.id || resolvedCurrentCompany?.id || currentDraft.company || ''),
            context,
          }
        : createDefaultDraft(employeeId, currentCompany?.id || resolvedCurrentCompany?.id, context),
    );
  }, [context, currentCompany?.id, employeeId, resolvedCurrentCompany?.id]);

  const openAbsenceModal = useCallback((row = null) => {
    if (row) {
      setAbsenceDraft({
        id: row?.id ? String(row.id) : '',
        company: String(row?.companyId || currentCompany?.id || resolvedCurrentCompany?.id || ''),
        people: String(row?.peopleId || employeeId || ''),
        context: String(row?.context || context || DEFAULT_EMPLOYEE_CONTEXT),
        absenceDate: String(row?.absenceDate || row?.date || '').slice(0, 10),
        reason: normalizeText(row?.reason || ''),
        justificationFile: row?.justificationFileId ? `/files/${row.justificationFileId}` : '',
        justificationFileLabel: normalizeText(row?.justificationFileLabel || ''),
        fileObject: null,
      });
    } else {
      setAbsenceDraft(createDefaultDraft(employeeId, currentCompany?.id || resolvedCurrentCompany?.id, context));
    }

    setSelectedAbsenceRow(row || null);
    setAbsenceModalVisible(true);
  }, [context, currentCompany?.id, employeeId, resolvedCurrentCompany?.id]);

  const attachAbsenceFile = useCallback(async file => {
    const fileIri = toFileIri(file);
    if (!fileIri) {
      throw new Error('Arquivo sem identificador.');
    }

    setAbsenceDraft(currentDraft => ({
      ...currentDraft,
      fileObject: null,
      justificationFile: fileIri,
      justificationFileLabel: file?.name || file?.fileName || currentDraft.justificationFileLabel || '',
    }));

    return {file};
  }, []);

  const uploadAbsenceFile = useCallback(async ({file}) => {
    const uploadedFile = await uploadFileToApi({
      file,
      context: 'people_absences',
      peopleId: currentCompany?.id || resolvedCurrentCompany?.id,
    });
    const fileIri = toFileIri(uploadedFile);

    if (!fileIri) {
      throw new Error('Arquivo enviado sem identificador.');
    }

    setAbsenceDraft(currentDraft => ({
      ...currentDraft,
      fileObject: null,
      justificationFile: fileIri,
      justificationFileLabel: uploadedFile?.fileName || uploadedFile?.name || file?.name || currentDraft.justificationFileLabel || '',
    }));

    return uploadedFile;
  }, [currentCompany?.id, resolvedCurrentCompany?.id]);

  const handleSaveAbsence = useCallback(async () => {
    const resolvedCompanyId = currentCompany?.id || resolvedCurrentCompany?.id;

    if (!resolvedCompanyId || !employeeId) {
      showError?.('Funcionario ou empresa nao identificados.');
      return;
    }

    if (!normalizeText(absenceDraft.absenceDate)) {
      showError?.('Informe a data da falta.');
      return;
    }

    try {
      setAbsenceSaving(true);

      const justificationFileIri = normalizeText(absenceDraft.justificationFile);

      await absenceActions.save({
        ...(absenceDraft.id ? {id: absenceDraft.id} : {}),
        context,
        company: resolvePeopleIri(resolvedCompanyId),
        people: resolvePeopleIri(employeeId),
        absenceDate: absenceDraft.absenceDate,
        reason: normalizeText(absenceDraft.reason),
        ...(justificationFileIri ? {justificationFile: justificationFileIri} : {}),
        active: true,
        payload: {
          source: 'rh',
        },
      });

      showSuccess?.('Falta registrada.');
      setAbsenceModalVisible(false);
      setSelectedAbsenceRow(null);
      setAbsenceDraft(createDefaultDraft(employeeId, currentCompany?.id, context));
      await loadAbsences();
      await loadAttendance();
    } catch (error) {
      showError?.(error?.message || 'Nao foi possivel salvar a falta.');
    } finally {
      setAbsenceSaving(false);
    }
  }, [
    absenceActions,
    absenceDraft.absenceDate,
    absenceDraft.id,
    absenceDraft.justificationFile,
    absenceDraft.reason,
    context,
    currentCompany?.id,
    employeeId,
    loadAbsences,
    loadAttendance,
    resolvedCurrentCompany?.id,
    showError,
    showSuccess,
  ]);

  const handleCloseAbsenceModal = useCallback(() => {
    setAbsenceModalVisible(false);
    setSelectedAbsenceRow(null);
    setAbsenceDraft(createDefaultDraft(employeeId, currentCompany?.id || resolvedCurrentCompany?.id, context));
  }, [context, currentCompany?.id, employeeId, resolvedCurrentCompany?.id]);

  const handleOpenAbsenceFile = useCallback(
    async row => {
      const source = resolveDefaultFileSource(row?.justificationFileId || row?.justificationFile, {
        company: currentCompany || resolvedCurrentCompany,
      });

      if (!source?.uri) {
        openAbsenceModal(row);
        return;
      }

      try {
        await Linking.openURL(source.uri);
      } catch (error) {
        showError?.(error?.message || 'Nao foi possivel abrir o arquivo.');
      }
    },
    [currentCompany, openAbsenceModal, resolvedCurrentCompany, showError],
  );

  const attendanceRowStyle = useCallback(row => {
    const tone = String(row?.tone || '').trim().toLowerCase();
    const toneStyles = {
      danger: {
        backgroundColor: '#FEE2E2',
        borderLeftColor: '#DC2626',
      },
      info: {
        backgroundColor: '#DBEAFE',
        borderLeftColor: '#2563EB',
      },
      success: {
        backgroundColor: '#DCFCE7',
        borderLeftColor: '#16A34A',
      },
      warning: {
        backgroundColor: '#FEF3C7',
        borderLeftColor: '#F59E0B',
      },
      muted: {
        backgroundColor: '#E2E8F0',
        borderLeftColor: '#94A3B8',
      },
    };

    return {
      borderLeftWidth: 4,
      ...(toneStyles[tone] || toneStyles.muted),
    };
  }, []);

  const attendanceSummaryText = useMemo(() => {
    const totals = attendanceSummary?.totals || attendanceSummary || {};
    return {
      late: Number(totals.late || 0),
      absences: Number(totals.absences || 0),
      overtime: Number(totals.overtime || 0),
    };
  }, [attendanceSummary]);

  if (!currentCompany?.id || !employeeId) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateTitle}>Funcionario nao identificado</Text>
        <Text style={styles.emptyStateText}>
          Selecione uma empresa e um funcionario validos para ver o ponto.
        </Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Ponto</Text>
        <Text style={styles.sectionText}>
          Horarios de entrada e saida com destaque para atrasos, faltas e horas extras.
        </Text>

        <DefaultExternalFilters
          accentColor={themeColors?.primary}
          filters={attendancePeriodFilters}
          onChangeFilters={handleAttendancePeriodFiltersChange}
          storeName="attendance_reports"
        />

        <View style={styles.sectionChipRow}>
          <View style={styles.sectionChip}>
            <Text style={styles.sectionChipText}>{`Atrasos: ${attendanceSummaryText.late}`}</Text>
          </View>
          <View style={styles.sectionChip}>
            <Text style={styles.sectionChipText}>{`Faltas: ${attendanceSummaryText.absences}`}</Text>
          </View>
          <View style={styles.sectionChip}>
            <Text style={styles.sectionChipText}>{`Hora extra: ${attendanceSummaryText.overtime}`}</Text>
          </View>
        </View>

        <View style={styles.tableWrap}>
          <DefaultTable
            accentColor="#2563EB"
            add={false}
            columns={attendanceStore.getters.columns}
            data={attendanceRows}
            initialViewMode="table"
            isLoading={attendanceLoading}
            requestParams={attendanceRequestParams}
            rowStyle={attendanceRowStyle}
            showColumnFiltersButton={false}
            showRowActions={false}
            storeName="attendance_reports"
            totalItems={attendanceRows.length}
            totalItemsLabel="registros"
          />
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.controlsRow}>
          <View>
            <Text style={styles.sectionTitle}>Faltas e justificativas</Text>
            <Text style={styles.sectionText}>
              Registre faltas e anexe o atestado ou justificativa quando houver.
            </Text>
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Registrar falta"
            activeOpacity={0.9}
            style={styles.primaryButton}
            onPress={() => openAbsenceModal()}
          >
            <Text style={styles.primaryButtonText}>Registrar falta</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tableWrap}>
          <DefaultTable
            accentColor="#2563EB"
            add={false}
            columns={absenceStore.getters.columns}
            data={absences}
            initialViewMode="table"
            isLoading={absencesLoading}
            onRowPress={handleOpenAbsenceFile}
            requestParams={absenceRequestParams}
            showColumnFiltersButton={false}
            showRowActions={false}
            storeName="people_absences"
            totalItems={absences.length}
            totalItemsLabel="faltas"
          />
        </View>
      </View>

      <Modal visible={absenceModalVisible} transparent animationType="fade" onRequestClose={handleCloseAbsenceModal}>
        <View style={[styles.modalOverlay, {backgroundColor: 'rgba(15, 23, 42, 0.6)'}]}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedAbsenceRow ? 'Editar falta' : 'Registrar falta'}
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Fechar"
                activeOpacity={0.82}
                style={styles.modalCloseButton}
                onPress={handleCloseAbsenceModal}
              >
                <Text style={styles.secondaryButtonText}>X</Text>
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{paddingBottom: 12}}>
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Data</Text>
                <TextInput
                  value={absenceDraft.absenceDate}
                  onChangeText={value =>
                    setAbsenceDraft(current => ({
                      ...current,
                      absenceDate: value,
                    }))
                  }
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94A3B8"
                  style={styles.input}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Motivo</Text>
                <TextInput
                  value={absenceDraft.reason}
                  onChangeText={value =>
                    setAbsenceDraft(current => ({
                      ...current,
                      reason: value,
                    }))
                  }
                  placeholder="Falta, consulta, exame..."
                  placeholderTextColor="#94A3B8"
                  style={[styles.input, styles.textArea]}
                  multiline
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Atestado ou justificativa</Text>
                <DefaultUpload
                  relationStoreName="attendance_reports"
                  relationField="peopleAbsence"
                  relationResource="people_absences"
                  entityId={absenceDraft.id || 'absence'}
                  companyId={currentCompany?.id || resolvedCurrentCompany?.id}
                  context="people_absences"
                  libraryContexts={['people_absences']}
                  attachments={absenceDraft.justificationFile ? [{
                    id: extractFileId(absenceDraft.justificationFile),
                    file: {
                      id: extractFileId(absenceDraft.justificationFile),
                      fileName: absenceDraft.justificationFileLabel || 'Justificativa',
                    },
                  }] : []}
                  acceptedTypes="*/*"
                  fileType=""
                  fileTypeLabel="arquivo"
                  title="Atestado ou justificativa"
                  triggerLabel={absenceDraft.justificationFile ? 'Trocar arquivo' : 'Selecionar arquivo'}
                  managerTitle="Gerenciador de justificativas"
                  searchPlaceholder="Buscar arquivo"
                  uploadButtonLabel="Enviar novo"
                  emptyAttachmentLabel="Nenhum arquivo selecionado."
                  emptyLibraryLabel="Nenhum arquivo encontrado."
                  showInlineContent={false}
                  uploadResultAlreadyAttached
                  requireEntity={false}
                  onAttachFile={attachAbsenceFile}
                  onUploadFile={uploadAbsenceFile}
                  onRemoveAttachment={async () => {
                    setAbsenceDraft(currentDraft => ({
                      ...currentDraft,
                      justificationFile: '',
                      justificationFileLabel: '',
                      fileObject: null,
                    }));
                  }}
                  renderTrigger={({openManager, uploading}) => (
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel="Selecionar arquivo"
                      activeOpacity={0.88}
                      style={styles.secondaryButton}
                      onPress={openManager}
                      disabled={uploading}
                    >
                      <Text style={styles.secondaryButtonText}>
                        {uploading ? 'Enviando...' : absenceDraft.justificationFile ? 'Trocar arquivo' : 'Selecionar arquivo'}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
                <Text style={styles.sectionText}>
                  {absenceDraft.justificationFileLabel || 'Nenhum arquivo selecionado.'}
                </Text>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Cancelar"
                  activeOpacity={0.88}
                  style={styles.secondaryButton}
                  onPress={handleCloseAbsenceModal}
                >
                  <Text style={styles.secondaryButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={absenceSaving ? 'Salvando' : 'Salvar falta'}
                  activeOpacity={0.88}
                  style={styles.primaryButton}
                  disabled={absenceSaving}
                  onPress={handleSaveAbsence}
                >
                  <Text style={styles.primaryButtonText}>
                    {absenceSaving ? 'Salvando...' : 'Salvar falta'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EmployeeAttendanceSection;
