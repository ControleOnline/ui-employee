// fluxo: funcionario-cadastro | etapa: employee-details | wiki: https://github.com/ControleOnline/app-community/wiki/Venda-Producao
/* eslint-disable no-unused-vars */
import React, {useCallback, useEffect, useLayoutEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {app_type} from '@appType';
import {useMessage} from '@controleonline/ui-common/src/react/components/MessageService';
import {getPeopleDisplayName} from '@controleonline/ui-common/src/react/utils/peopleDisplay';
import {getDateRange} from '@controleonline/ui-common/src/react/utils/dateRangeFilter';
import {resolveDefaultFileSource} from '@controleonline/ui-common/src/react/utils/fileUrl';
import DefaultTable from '@controleonline/ui-default/src/react/components/table/DefaultTable';
import DefaultExternalFilters from '@controleonline/ui-default/src/react/components/filters/DefaultExternalFilters';
import {useStore} from '@store';
import CategoryPickerField from '@controleonline/ui-employee/src/react/components/CategoryPickerField';
import {resolveThemePalette} from '@controleonline/../../src/styles/branding';
import {colors} from '@controleonline/../../src/styles/colors';
import EmployeeAttendanceSection from '@controleonline/ui-employee/src/react/components/EmployeeAttendanceSection';
import {
  EMPLOYEE_CATEGORY_CONTEXTS,
  DEFAULT_EMPLOYEE_CONTEXT,
  DEFAULT_EMPLOYEE_EXPORT_KIND,
  formatContextLabel,
  formatDateValue,
  normalizeDateRange,
  normalizeDateString,
  normalizePeopleSnapshot,
  resolveEntityId,
  resolveCategoryIri,
  resolvePeopleLinkIri,
  resolvePeopleLabel,
} from '@controleonline/ui-employee/src/shared/employeeFormats';
import {createStyles} from './EmployeeDetailsPage.styles';

const resolvedAppType = String(app_type || '').trim().toUpperCase();
const canSeeAttendanceTab = resolvedAppType === 'ADMIN' || resolvedAppType === 'MANAGER';

const TAB_DEFINITIONS = [
  {key: 'data', label: 'Dados'},
  {key: 'profile', label: 'Cargo e funcao'},
  {key: 'contracts', label: 'Contrato'},
  {key: 'movements', label: 'Movimentos'},
  ...(canSeeAttendanceTab ? [{key: 'attendance', label: 'Ponto'}] : []),
  {key: 'schedules', label: 'Agendas'},
  {key: 'exports', label: 'Exportacao'},
];

const normalizeText = value => String(value ?? '').trim();

const resolveInitialTab = value => {
  const normalized = normalizeText(value).toLowerCase();
  const availableTabs = new Set(TAB_DEFINITIONS.map(tab => tab.key));

  return availableTabs.has(normalized) ? normalized : 'data';
};

const buildProfileDraft = (profile = null, employeeLink = null) => {
  const snapshot = normalizePeopleSnapshot(profile?.linkedinSnapshot);

  return {
    id: profile?.id ? String(profile.id) : '',
    peopleLink: employeeLink?.id ? resolvePeopleLinkIri(employeeLink) : '',
    jobTitle: resolveCategoryIri(profile?.jobTitle),
    jobTitleLabel: profile?.jobTitleLabel || profile?.jobTitle?.name || '',
    jobFunction: resolveCategoryIri(profile?.jobFunction),
    jobFunctionLabel: profile?.jobFunctionLabel || profile?.jobFunction?.name || '',
    department: resolveCategoryIri(profile?.department),
    departmentLabel: profile?.departmentLabel || profile?.department?.name || '',
    employmentType: resolveCategoryIri(profile?.employmentType),
    employmentTypeLabel: profile?.employmentTypeLabel || profile?.employmentType?.name || '',
    workloadHours:
      profile?.workloadHours !== null && profile?.workloadHours !== undefined
        ? String(profile.workloadHours)
        : '',
    admissionDate: normalizeDateString(profile?.admissionDate),
    terminationDate: normalizeDateString(profile?.terminationDate),
    linkedinUrl: profile?.linkedinUrl || '',
    linkedinHeadline: profile?.linkedinHeadline || '',
    linkedinSummary: profile?.linkedinSummary || '',
    linkedinSnapshotText:
      snapshot && typeof snapshot === 'object'
        ? JSON.stringify(snapshot, null, 2)
        : normalizeText(snapshot),
    notes: profile?.notes || '',
    active: profile?.active !== false,
  };
};

const parseSnapshotText = text => {
  const normalized = normalizeText(text);
  if (!normalized) {
    return [];
  }

  const parsed = JSON.parse(normalized);
  return parsed && typeof parsed === 'object' ? parsed : [];
};

const FieldValue = ({label, value, styles}) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{normalizeText(value) || '-'}</Text>
  </View>
);

const InputField = ({
  label,
  value,
  onChangeText,
  styles,
  placeholder = '',
  multiline = false,
  keyboardType = 'default',
}) => (
  <View style={styles.formRow}>
    <Text style={styles.formLabel}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      style={[styles.input, multiline ? styles.textArea : null]}
      multiline={multiline}
      keyboardType={keyboardType}
      autoCapitalize="none"
      autoCorrect={false}
    />
  </View>
);

const TabButton = ({active, label, onPress, styles}) => (
  <TouchableOpacity
    accessibilityRole="button"
    accessibilityLabel={label}
    activeOpacity={0.9}
    style={[styles.tabButton, active ? styles.tabButtonActive : null]}
    onPress={onPress}
  >
    <Text style={[styles.tabButtonText, active ? styles.tabButtonTextActive : null]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const SectionTitle = ({title, text, styles}) => (
  <View>
    <Text style={styles.sectionTitle}>{title}</Text>
    {text ? <Text style={styles.sectionText}>{text}</Text> : null}
  </View>
);

const EmployeeDetailsPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {showError, showSuccess} = useMessage() || {};

  const peopleStore = useStore('people');
  const peopleLinkStore = useStore('people_link');
  const contractStore = useStore('contract');
  const categoriesStore = useStore('categories');
  const employeeProfilesStore = useStore('employee_profiles');
  const accessEventsStore = useStore('people_access_events');
  const schedulesStore = useStore('people_schedules');
  const exportJobsStore = useStore('people_export_jobs');
  const themeStore = useStore('theme');

  const {colors: themeColors} = themeStore.getters || {};
  const {currentCompany, item: employee, isLoading: employeeLoading} = peopleStore.getters || {};
  const {isLoading: employeeLinkLoading} = peopleLinkStore.getters || {};
  const {items: contracts = [], isLoading: contractsLoading} = contractStore.getters || {};
  const {items: profiles = [], isLoading: profilesLoading} =
    employeeProfilesStore.getters || {};
  const {items: accessEvents = [], isLoading: accessEventsLoading} =
    accessEventsStore.getters || {};
  const {items: schedules = [], isLoading: schedulesLoading} =
    schedulesStore.getters || {};
  const {items: exportJobs = [], isLoading: exportJobsLoading} =
    exportJobsStore.getters || {};

  const peopleActions = peopleStore.actions;
  const peopleLinkActions = peopleLinkStore.actions;
  const contractActions = contractStore.actions;
  const categoriesActions = categoriesStore.actions;
  const employeeProfilesActions = employeeProfilesStore.actions;
  const accessEventsActions = accessEventsStore.actions;
  const schedulesActions = schedulesStore.actions;
  const exportJobsActions = exportJobsStore.actions;

  const employeeId = useMemo(
    () => resolveEntityId(route?.params?.id || route?.params?.peopleId || ''),
    [route?.params?.id, route?.params?.peopleId],
  );
  const activeContext = useMemo(
    () => normalizeText(route?.params?.context || DEFAULT_EMPLOYEE_CONTEXT).toLowerCase(),
    [route?.params?.context],
  );

  const brandColors = useMemo(
    () =>
      resolveThemePalette(
        { ...themeColors, ...(currentCompany?.theme?.colors || {}) },
        colors,
      ),
    [currentCompany?.id, themeColors],
  );
  const styles = useMemo(() => createStyles(brandColors), [brandColors]);

  const [activeTab, setActiveTab] = useState(() => resolveInitialTab(route?.params?.tab));
  const [employeeLink, setEmployeeLink] = useState(null);
  const [profileDraft, setProfileDraft] = useState(() => buildProfileDraft());
  const [jobTitleOptions, setJobTitleOptions] = useState([]);
  const [jobFunctionOptions, setJobFunctionOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [employmentTypeOptions, setEmploymentTypeOptions] = useState([]);
  const [categoriesReady, setCategoriesReady] = useState(false);
  const [exportPeriod, setExportPeriod] = useState({
    customRange: {from: '', to: ''},
    shortcut: '30d',
  });
  const exportPeriodFilters = useMemo(
    () => ({periodStart: exportPeriod}),
    [exportPeriod],
  );
  const handleExportPeriodFiltersChange = useCallback(
    nextFilters => {
      setExportPeriod(
        nextFilters?.periodStart || {
          customRange: {from: '', to: ''},
          shortcut: 'all',
        },
      );
    },
    [],
  );

  const employeeProfile = Array.isArray(profiles) ? profiles[0] || null : null;
  const bootstrapReady = Boolean(currentCompany?.id) && Boolean(themeColors);
  const isLoadingBase =
    Boolean(employeeLoading) ||
    Boolean(employeeLinkLoading) ||
    !categoriesReady ||
    !bootstrapReady;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
      showBottomToolBar: true,
    });
  }, [navigation]);

  const loadEmployeeBase = useCallback(async () => {
    if (!employeeId || !currentCompany?.id) {
      return;
    }

    try {
      await peopleActions.get(employeeId);
      const links = await peopleLinkActions.getItems({
        company: currentCompany.id,
        people: employeeId,
        linkType: 'employee',
      });

      setEmployeeLink(Array.isArray(links) ? links[0] || null : null);
    } catch (error) {
      showError?.(error?.message || 'Nao foi possivel carregar o funcionario.');
    }
  }, [currentCompany?.id, employeeId, peopleActions, peopleLinkActions, showError]);

  const loadEmployeeProfile = useCallback(async () => {
    if (!employeeLink?.id) {
      setProfileDraft(buildProfileDraft(null, employeeLink));
      return;
    }

    try {
      const response = await employeeProfilesActions.getItems({
        peopleLink: resolvePeopleLinkIri(employeeLink),
        itemsPerPage: 1,
        page: 1,
      });
      const profile = Array.isArray(response) ? response[0] || null : null;
      setProfileDraft(buildProfileDraft(profile, employeeLink));
    } catch (error) {
      showError?.(error?.message || 'Nao foi possivel carregar o perfil do funcionario.');
      setProfileDraft(buildProfileDraft(null, employeeLink));
    }
  }, [employeeLink, employeeProfilesActions, showError]);

  const loadEmployeeProfileOptions = useCallback(async () => {
    if (!currentCompany?.id) {
      setJobTitleOptions([]);
      setJobFunctionOptions([]);
      setDepartmentOptions([]);
      setEmploymentTypeOptions([]);
      return;
    }

    try {
      const [
        jobCategories,
        functionCategories,
        departmentCategories,
        employmentTypeCategories,
      ] = await Promise.all([
        categoriesActions.getItems({
          company: currentCompany.id,
          context: EMPLOYEE_CATEGORY_CONTEXTS.job,
          itemsPerPage: 200,
          page: 1,
          'order[name]': 'ASC',
        }),
        categoriesActions.getItems({
          company: currentCompany.id,
          context: EMPLOYEE_CATEGORY_CONTEXTS.function,
          itemsPerPage: 200,
          page: 1,
          'order[name]': 'ASC',
        }),
        categoriesActions.getItems({
          company: currentCompany.id,
          context: EMPLOYEE_CATEGORY_CONTEXTS.department,
          itemsPerPage: 200,
          page: 1,
          'order[name]': 'ASC',
        }),
        categoriesActions.getItems({
          company: currentCompany.id,
          context: EMPLOYEE_CATEGORY_CONTEXTS.employmentType,
          itemsPerPage: 200,
          page: 1,
          'order[name]': 'ASC',
        }),
      ]);

      setJobTitleOptions(Array.isArray(jobCategories) ? jobCategories : []);
      setJobFunctionOptions(Array.isArray(functionCategories) ? functionCategories : []);
      setDepartmentOptions(Array.isArray(departmentCategories) ? departmentCategories : []);
      setEmploymentTypeOptions(Array.isArray(employmentTypeCategories) ? employmentTypeCategories : []);
    } catch (error) {
      showError?.(error?.message || 'Nao foi possivel carregar as categorias do funcionario.');
      setJobTitleOptions([]);
      setJobFunctionOptions([]);
      setDepartmentOptions([]);
      setEmploymentTypeOptions([]);
    }
  }, [categoriesActions, currentCompany?.id, showError]);

  const loadContracts = useCallback(async () => {
    if (!employeeId || !currentCompany?.id) {
      return;
    }

    try {
      await contractActions.getItems({
        client: employeeId,
        provider: currentCompany.id,
        'contractModel.context': 'employment',
        itemsPerPage: 100,
        page: 1,
        'order[creationDate]': 'desc',
      });
    } catch (error) {
      showError?.(error?.message || 'Nao foi possivel carregar os contratos.');
    }
  }, [contractActions, currentCompany?.id, employeeId, showError]);

  const loadAccessEvents = useCallback(async () => {
    if (!employeeId || !currentCompany?.id) {
      return;
    }

    try {
      await accessEventsActions.getItems({
        context: activeContext || DEFAULT_EMPLOYEE_CONTEXT,
        company: currentCompany.id,
        people: employeeId,
        itemsPerPage: 100,
        page: 1,
        'order[eventAt]': 'desc',
      });
    } catch (error) {
      showError?.(error?.message || 'Nao foi possivel carregar os movimentos.');
    }
  }, [accessEventsActions, activeContext, currentCompany?.id, employeeId, showError]);

  const loadSchedules = useCallback(async () => {
    if (!employeeId || !currentCompany?.id) {
      return;
    }

    try {
      await schedulesActions.getItems({
        context: activeContext || DEFAULT_EMPLOYEE_CONTEXT,
        company: currentCompany.id,
        people: employeeId,
        itemsPerPage: 100,
        page: 1,
        'order[weekday]': 'asc',
        'order[startTime]': 'asc',
      });
    } catch (error) {
      showError?.(error?.message || 'Nao foi possivel carregar as escalas.');
    }
  }, [activeContext, currentCompany?.id, employeeId, schedulesActions, showError]);

  const loadExportJobs = useCallback(async () => {
    if (!employeeId || !currentCompany?.id) {
      return;
    }

    try {
      await exportJobsActions.getItems({
        context: activeContext || DEFAULT_EMPLOYEE_CONTEXT,
        kind: DEFAULT_EMPLOYEE_EXPORT_KIND,
        company: currentCompany.id,
        people: employeeId,
        itemsPerPage: 100,
        page: 1,
        'order[creationDate]': 'desc',
      });
    } catch (error) {
      showError?.(error?.message || 'Nao foi possivel carregar o historico de exportacao.');
    }
  }, [activeContext, currentCompany?.id, employeeId, exportJobsActions, showError]);

  useEffect(() => {
    loadEmployeeBase();
  }, [loadEmployeeBase]);

  useEffect(() => {
    setCategoriesReady(false);
    loadEmployeeProfileOptions().finally(() => {
      setCategoriesReady(true);
    });
  }, [loadEmployeeProfileOptions]);

  useEffect(() => {
    setActiveTab(resolveInitialTab(route?.params?.tab));
  }, [route?.params?.tab]);

  useEffect(() => {
    if (!employeeLink?.id) {
      setProfileDraft(buildProfileDraft(null, employeeLink));
      return;
    }

    loadEmployeeProfile();
  }, [employeeLink?.id, loadEmployeeProfile]);

  useEffect(() => {
    if (activeTab === 'contracts') {
      loadContracts();
      return;
    }

    if (activeTab === 'movements') {
      loadAccessEvents();
      return;
    }

    if (activeTab === 'schedules') {
      loadSchedules();
      return;
    }

    if (activeTab === 'exports') {
      loadExportJobs();
    }
  }, [
    activeTab,
    loadAccessEvents,
    loadContracts,
    loadExportJobs,
    loadSchedules,
  ]);

  useEffect(() => {
    setProfileDraft(currentDraft =>
      currentDraft?.id === String(employeeProfile?.id || '')
        ? buildProfileDraft(employeeProfile, employeeLink)
        : currentDraft,
    );
  }, [employeeLink, employeeProfile]);

  const employeeName = getPeopleDisplayName(employee) || resolvePeopleLabel(employee);
  const employeeCompanyLabel = resolvePeopleLabel(currentCompany);
  const employeeProfileSnapshot = normalizePeopleSnapshot(
    employeeProfile?.linkedinSnapshot || employee?.otherInformations,
  );
  const exportDateRange = useMemo(
    () =>
      getDateRange(exportPeriod.shortcut, exportPeriod.customRange, {
        relativeMode: 'rolling',
        useCurrentMoment: true,
      }),
    [exportPeriod.customRange, exportPeriod.shortcut],
  );

  const handleProfileChange = useCallback((field, value) => {
    setProfileDraft(currentDraft => ({
      ...currentDraft,
      [field]: value,
    }));
  }, []);

  const handleSelectionChange = useCallback((field, labelField, value, option) => {
    setProfileDraft(currentDraft => ({
      ...currentDraft,
      [field]: value,
      [labelField]: option?.label || '',
    }));
  }, []);

  const handleProfileSave = useCallback(async () => {
    if (!employeeLink?.id) {
      showError?.('Nao foi possivel identificar o vinculo do funcionario.');
      return;
    }

    let parsedSnapshot = [];
    try {
      parsedSnapshot = parseSnapshotText(profileDraft.linkedinSnapshotText);
    } catch (error) {
      showError?.('O snapshot do LinkedIn precisa ser um JSON valido.');
      return;
    }

    try {
      const payload = {
        id: profileDraft.id || undefined,
        peopleLink: profileDraft.peopleLink || resolvePeopleLinkIri(employeeLink),
        jobTitle: normalizeText(profileDraft.jobTitle) || null,
        jobFunction: normalizeText(profileDraft.jobFunction) || null,
        department: normalizeText(profileDraft.department) || null,
        employmentType: normalizeText(profileDraft.employmentType) || null,
        workloadHours: normalizeText(profileDraft.workloadHours)
          ? Number(profileDraft.workloadHours)
          : null,
        admissionDate: normalizeDateString(profileDraft.admissionDate) || null,
        terminationDate: normalizeDateString(profileDraft.terminationDate) || null,
        linkedinUrl: normalizeText(profileDraft.linkedinUrl),
        linkedinHeadline: normalizeText(profileDraft.linkedinHeadline),
        linkedinSummary: normalizeText(profileDraft.linkedinSummary),
        linkedinSnapshot: parsedSnapshot,
        notes: normalizeText(profileDraft.notes),
        active: Boolean(profileDraft.active),
      };

      await employeeProfilesActions.save(payload);
      showSuccess?.('Perfil do funcionario salvo.');
      await loadEmployeeProfile();
    } catch (error) {
      showError?.(error?.message || 'Nao foi possivel salvar o perfil do funcionario.');
    }
  }, [
    employeeLink,
    employeeProfilesActions,
    loadEmployeeProfile,
    profileDraft.active,
    profileDraft.admissionDate,
    profileDraft.department,
    profileDraft.employmentType,
    profileDraft.id,
    profileDraft.jobFunction,
    profileDraft.jobTitle,
    profileDraft.linkedinHeadline,
    profileDraft.linkedinSnapshotText,
    profileDraft.linkedinSummary,
    profileDraft.linkedinUrl,
    profileDraft.notes,
    profileDraft.peopleLink,
    profileDraft.terminationDate,
    profileDraft.workloadHours,
    showError,
    showSuccess,
  ]);

  const handleGenerateExport = useCallback(async () => {
    if (!employeeId || !currentCompany?.id) {
      showError?.('Funcionario ou empresa nao identificados.');
      return;
    }

    const payload = {
      context: activeContext || DEFAULT_EMPLOYEE_CONTEXT,
      kind: DEFAULT_EMPLOYEE_EXPORT_KIND,
      company: currentCompany.id,
      people: employeeId,
      periodStart: exportDateRange.after,
      periodEnd: exportDateRange.before,
      filters: {
        period: normalizeDateRange(exportPeriod),
      },
    };

    try {
      await exportJobsActions.generateTimesheet(payload);
      showSuccess?.('Exportacao gerada.');
      await loadExportJobs();
    } catch (error) {
      showError?.(error?.message || 'Nao foi possivel gerar a exportacao.');
    }
  }, [
    activeContext,
    currentCompany?.id,
    employeeId,
    exportDateRange.after,
    exportDateRange.before,
    exportJobsActions,
    exportPeriod,
    loadExportJobs,
    showError,
    showSuccess,
  ]);

  const handleOpenExportFile = useCallback(
    async row => {
      const source = resolveDefaultFileSource(row?.file || row?.fileId, {
        company: currentCompany,
      });

      if (!source?.uri) {
        showError?.('Arquivo de exportacao indisponivel.');
        return;
      }

      try {
        await Linking.openURL(source.uri);
      } catch (error) {
        showError?.(error?.message || 'Nao foi possivel abrir o arquivo.');
      }
    },
    [currentCompany, showError],
  );

  if (isLoadingBase) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={brandColors.primary || '#2563EB'} />
      </View>
    );
  }

  if (!employeeId) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.scrollContent}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Funcionario nao encontrado</Text>
            <Text style={styles.emptyStateText}>
              O detalhe precisa de um `id` valido na rota.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!employee) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={brandColors.primary || '#2563EB'} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.headerAvatar}>
              <Text style={styles.headerAvatarText}>
                {normalizeText(employeeName).charAt(0).toUpperCase() || 'F'}
              </Text>
            </View>

            <View style={{flex: 1}}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {employeeName || 'Funcionario'}
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={2}>
                {employeeCompanyLabel || 'Empresa atual'}
              </Text>
            </View>
          </View>

          <View style={styles.headerPillRow}>
            <View style={styles.headerPill}>
              <Text style={styles.headerPillText}>{formatContextLabel(activeContext)}</Text>
            </View>
            <View style={styles.headerPill}>
              <Text style={styles.headerPillText}>
                {employee?.peopleType === 'F' ? 'Pessoa fisica' : 'Pessoa juridica'}
              </Text>
            </View>
            <View style={styles.headerPill}>
              <Text style={styles.headerPillText}>ID #{employeeId}</Text>
            </View>
          </View>
        </View>

        <View style={styles.tabBar}>
          {TAB_DEFINITIONS.map(tab => (
            <TabButton
              key={tab.key}
              active={activeTab === tab.key}
              label={tab.label}
              styles={styles}
              onPress={() => setActiveTab(tab.key)}
            />
          ))}
        </View>

        {activeTab === 'data' ? (
          <View style={styles.sectionCard}>
            <SectionTitle
              styles={styles}
              title="Dados base"
              text="As informacoes do colaborador continuam vindo de people e do perfil de RH."
            />

            <View style={styles.infoGrid}>
              <FieldValue styles={styles} label="Nome" value={employeeName} />
              <FieldValue styles={styles} label="Empresa" value={employeeCompanyLabel} />
              <FieldValue
                styles={styles}
                label="Tipo"
                value={employee?.peopleType === 'F' ? 'Pessoa fisica' : 'Pessoa juridica'}
              />
              <FieldValue
                styles={styles}
                label="Admissao"
                value={formatDateValue(profileDraft.admissionDate || employeeProfile?.admissionDate)}
              />
              <FieldValue
                styles={styles}
                label="Demissao"
                value={formatDateValue(profileDraft.terminationDate || employeeProfile?.terminationDate)}
              />
              <FieldValue
                styles={styles}
                label="Cargo"
                value={employeeProfile?.jobTitleLabel || profileDraft.jobTitleLabel}
              />
              <FieldValue
                styles={styles}
                label="Funcao"
                value={employeeProfile?.jobFunctionLabel || profileDraft.jobFunctionLabel}
              />
              <FieldValue
                styles={styles}
                label="Departamento"
                value={employeeProfile?.departmentLabel || profileDraft.departmentLabel}
              />
              <FieldValue
                styles={styles}
                label="Vinculo"
                value={employeeProfile?.employmentTypeLabel || profileDraft.employmentTypeLabel}
              />
            </View>

            <View style={styles.snapshotBox}>
              <Text style={styles.formLabel}>Snapshot LinkedIn</Text>
              <Text style={styles.snapshotText}>
                {employeeProfileSnapshot
                  ? JSON.stringify(employeeProfileSnapshot, null, 2)
                  : 'Sem snapshot cadastrado.'}
              </Text>
            </View>
          </View>
        ) : null}

        {activeTab === 'profile' ? (
          <View style={styles.sectionCard}>
            <SectionTitle
              styles={styles}
              title="Perfil do funcionario"
              text="Aba especifica de RH com categorias de cargo, funcao, departamento, vinculo e snapshot local do LinkedIn."
            />

            <View style={styles.formGrid}>
              <View style={styles.formGridItem}>
                <CategoryPickerField
                  label="Cargo"
                  options={jobTitleOptions}
                  placeholder="Selecionar cargo"
                  value={profileDraft.jobTitle}
                  onChange={(value, option) =>
                    handleSelectionChange('jobTitle', 'jobTitleLabel', value, option)
                  }
                />
              </View>
              <View style={styles.formGridItem}>
                <CategoryPickerField
                  label="Funcao"
                  options={jobFunctionOptions}
                  placeholder="Selecionar funcao"
                  value={profileDraft.jobFunction}
                  onChange={(value, option) =>
                    handleSelectionChange('jobFunction', 'jobFunctionLabel', value, option)
                  }
                />
              </View>
              <View style={styles.formGridItem}>
                <CategoryPickerField
                  label="Departamento"
                  options={departmentOptions}
                  placeholder="Selecionar departamento"
                  value={profileDraft.department}
                  onChange={(value, option) =>
                    handleSelectionChange('department', 'departmentLabel', value, option)
                  }
                />
              </View>
              <View style={styles.formGridItem}>
                <CategoryPickerField
                  label="Vinculo"
                  options={employmentTypeOptions}
                  placeholder="Selecionar vinculo"
                  value={profileDraft.employmentType}
                  onChange={(value, option) =>
                    handleSelectionChange('employmentType', 'employmentTypeLabel', value, option)
                  }
                />
              </View>
              <View style={styles.formGridItem}>
                <InputField
                  styles={styles}
                  label="Horas"
                  value={profileDraft.workloadHours}
                  onChangeText={value => handleProfileChange('workloadHours', value)}
                  placeholder="44"
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.formGridItem}>
                <InputField
                  styles={styles}
                  label="Admissao"
                  value={profileDraft.admissionDate}
                  onChangeText={value => handleProfileChange('admissionDate', value)}
                  placeholder="YYYY-MM-DD"
                />
              </View>
              <View style={styles.formGridItem}>
                <InputField
                  styles={styles}
                  label="Demissao"
                  value={profileDraft.terminationDate}
                  onChangeText={value => handleProfileChange('terminationDate', value)}
                  placeholder="YYYY-MM-DD"
                />
              </View>
              <View style={styles.formGridItem}>
                <InputField
                  styles={styles}
                  label="LinkedIn"
                  value={profileDraft.linkedinUrl}
                  onChangeText={value => handleProfileChange('linkedinUrl', value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </View>
            </View>

            <InputField
              styles={styles}
              label="Headline"
              value={profileDraft.linkedinHeadline}
              onChangeText={value => handleProfileChange('linkedinHeadline', value)}
              placeholder="Headline do LinkedIn"
            />

            <InputField
              styles={styles}
              label="Resumo"
              value={profileDraft.linkedinSummary}
              onChangeText={value => handleProfileChange('linkedinSummary', value)}
              placeholder="Resumo profissional"
              multiline
            />

            <InputField
              styles={styles}
              label="Snapshot LinkedIn"
              value={profileDraft.linkedinSnapshotText}
              onChangeText={value => handleProfileChange('linkedinSnapshotText', value)}
              placeholder='{"headline":"..."}'
              multiline
            />

            <InputField
              styles={styles}
              label="Observacoes"
              value={profileDraft.notes}
              onChangeText={value => handleProfileChange('notes', value)}
              placeholder="Observacoes internas"
              multiline
            />

            <View style={styles.switchRow}>
              <View>
                <Text style={styles.formLabel}>Ativo</Text>
                <Text style={styles.infoValue}>
                  {profileDraft.active ? 'Funcionario ativo' : 'Funcionario inativo'}
                </Text>
              </View>
              <Switch
                value={profileDraft.active}
                onValueChange={value => handleProfileChange('active', value)}
              />
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Recarregar"
                activeOpacity={0.9}
                style={styles.secondaryButton}
                onPress={loadEmployeeProfile}
              >
                <Text style={styles.secondaryButtonText}>Recarregar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={profilesLoading ? 'Salvando perfil' : 'Salvar perfil'}
                activeOpacity={0.9}
                style={styles.primaryButton}
                onPress={handleProfileSave}
              >
                <Text style={styles.primaryButtonText}>
                  {profilesLoading ? 'Salvando...' : 'Salvar perfil'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {activeTab === 'contracts' ? (
          <View style={styles.sectionCard}>
            <SectionTitle
              styles={styles}
              title="Contratos de trabalho"
              text="Filtra somente contratos com contractModel.context = employment e client = funcionario."
            />

            <View style={styles.tableWrap}>
              <DefaultTable
                accentColor={brandColors.primary || '#2563EB'}
                add={false}
                columns={contractStore.getters.columns}
                data={contracts}
                initialViewMode="table"
                isLoading={contractsLoading}
                onRowPress={row => {
                  const contractId = resolveEntityId(row?.id || row?.['@id']);
                  if (!contractId) {
                    return;
                  }

                  navigation.navigate('ContractDetails', {contractId});
                }}
                showColumnFiltersButton={false}
                showRowActions={false}
                storeName="contract"
                totalItems={contracts.length}
                totalItemsLabel="contratos"
              />
            </View>
          </View>
        ) : null}

        {activeTab === 'movements' ? (
          <View style={styles.sectionCard}>
            <SectionTitle
              styles={styles}
              title="Movimentos"
              text="Entradas e saidas genéricas por contexto. O recorte atual usa employment."
            />

            <View style={styles.tableWrap}>
              <DefaultTable
                accentColor={brandColors.primary || '#2563EB'}
                add={false}
                columns={accessEventsStore.getters.columns}
                data={accessEvents}
                initialViewMode="table"
                isLoading={accessEventsLoading}
                showColumnFiltersButton={false}
                showRowActions={false}
                storeName="people_access_events"
                totalItems={accessEvents.length}
                totalItemsLabel="movimentos"
              />
            </View>
          </View>
        ) : null}

        {activeTab === 'attendance' ? (
          <EmployeeAttendanceSection
            currentCompany={currentCompany}
            employeeId={employeeId}
            context={activeContext}
            styles={styles}
          />
        ) : null}

        {activeTab === 'schedules' ? (
          <View style={styles.sectionCard}>
            <SectionTitle
              styles={styles}
              title="Agendas"
              text="Uma unica tabela para escalas recorrentes e compromissos datados."
            />

            <View style={styles.tableWrap}>
              <DefaultTable
                accentColor={brandColors.primary || '#2563EB'}
                add={false}
                columns={schedulesStore.getters.columns}
                data={schedules}
                initialViewMode="table"
                isLoading={schedulesLoading}
                showColumnFiltersButton={false}
                showRowActions={false}
                storeName="people_schedules"
                totalItems={schedules.length}
                totalItemsLabel="agendas"
              />
            </View>
          </View>
        ) : null}

        {activeTab === 'exports' ? (
          <View style={styles.sectionCard}>
            <SectionTitle
              styles={styles}
              title="Exportacao da folha"
              text="Gera historico com arquivo baixavel e salva o job no banco."
            />

            <DefaultExternalFilters
              accentColor={brandColors.primary}
              filters={exportPeriodFilters}
              onChangeFilters={handleExportPeriodFiltersChange}
              storeName="people_export_jobs"
            />

            <View style={styles.actionRow}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={exportJobsLoading ? 'Gerando folha' : 'Gerar folha'}
                activeOpacity={0.9}
                style={styles.primaryButton}
                disabled={exportJobsLoading}
                onPress={handleGenerateExport}
              >
                <Text style={styles.primaryButtonText}>
                  {exportJobsLoading ? 'Gerando...' : 'Gerar folha'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tableWrap}>
              <DefaultTable
                accentColor={brandColors.primary || '#2563EB'}
                add={false}
                columns={exportJobsStore.getters.columns}
                data={exportJobs}
                initialViewMode="table"
                isLoading={exportJobsLoading}
                onRowPress={handleOpenExportFile}
                showColumnFiltersButton={false}
                showRowActions={false}
                storeName="people_export_jobs"
                totalItems={exportJobs.length}
                totalItemsLabel="exportacoes"
              />
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

export default EmployeeDetailsPage;
