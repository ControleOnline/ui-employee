/* eslint-disable no-unused-vars */
import React, {useCallback, useMemo, useState} from 'react';
import {Linking, Text, View} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {useStore} from '@store';
import {useMessage} from '@controleonline/ui-common/src/react/components/MessageService';
import DefaultExternalFilters from '@controleonline/ui-default/src/react/components/filters/DefaultExternalFilters';
import {getDateRange} from '@controleonline/ui-common/src/react/utils/dateRangeFilter';
import {resolveDefaultFileSource} from '@controleonline/ui-common/src/react/utils/fileUrl';
import {resolveThemePalette} from '@controleonline/../../src/styles/branding';
import {colors} from '@controleonline/../../src/styles/colors';
import {
  buildEmploymentExportRequestParams,
} from '@controleonline/ui-employee/src/shared/employeeNavigation';
import {
  DEFAULT_EMPLOYEE_CONTEXT,
  DEFAULT_EMPLOYEE_EXPORT_KIND,
  formatContextLabel,
  normalizeDateRange,
} from '@controleonline/ui-employee/src/shared/employeeFormats';
import RhTablePage from '@controleonline/ui-employee/src/react/pages/RhTablePage';
import {createStyles} from './RhWorkspace.styles';

const RhExportJobsPage = () => {
  const route = useRoute();
  const {showError, showSuccess} = useMessage() || {};
  const peopleStore = useStore('people');
  const themeStore = useStore('theme');
  const exportJobsStore = useStore('people_export_jobs');
  const exportJobsActions = exportJobsStore.actions;
  const {currentCompany} = peopleStore.getters || {};
  const {colors: themeColors} = themeStore.getters || {};
  const context = useMemo(
    () => String(route?.params?.context || DEFAULT_EMPLOYEE_CONTEXT).trim().toLowerCase(),
    [route?.params?.context],
  );
  const kind = useMemo(
    () => String(route?.params?.kind || DEFAULT_EMPLOYEE_EXPORT_KIND).trim().toLowerCase(),
    [route?.params?.kind],
  );

  const palette = useMemo(
    () =>
      resolveThemePalette(
        {...themeColors, ...(currentCompany?.theme?.colors || {})},
        colors,
      ),
    [currentCompany?.id, currentCompany?.theme?.colors, themeColors],
  );
  const styles = useMemo(() => createStyles(palette), [palette]);
  const requestParams = useMemo(
    () => buildEmploymentExportRequestParams(currentCompany, {context, kind}),
    [context, currentCompany?.id, kind],
  );

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

  const exportDateRange = useMemo(
    () =>
      getDateRange(exportPeriod.shortcut, exportPeriod.customRange, {
        relativeMode: 'rolling',
        useCurrentMoment: true,
      }),
    [exportPeriod.customRange, exportPeriod.shortcut],
  );

  const handleGenerateExport = useCallback(async () => {
    if (!currentCompany?.id) {
      showError?.('Selecione uma empresa antes de gerar a folha.');
      return;
    }

    const payload = {
      context,
      kind,
      company: currentCompany.id,
      periodStart: exportDateRange.after,
      periodEnd: exportDateRange.before,
      filters: {
        period: normalizeDateRange(exportPeriod),
      },
    };

    try {
      await exportJobsActions.generateTimesheet(payload);
      showSuccess?.('Folha gerada.');
    } catch (error) {
      showError?.(error?.message || 'Nao foi possivel gerar a folha.');
    }
  }, [
    context,
    currentCompany?.id,
    exportDateRange.after,
    exportDateRange.before,
    exportJobsActions,
    exportPeriod,
    kind,
    showError,
    showSuccess,
  ]);

  const handleOpenFile = useCallback(
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

  const controls = (
    <View>
      <DefaultExternalFilters
        accentColor={palette.primary}
        filters={exportPeriodFilters}
        onChangeFilters={handleExportPeriodFiltersChange}
        storeName="people_export_jobs"
      />
      <Text style={styles.controlsText}>
        {`Recorte atual: ${formatContextLabel(context)}.`}
      </Text>
    </View>
  );

  return (
    <RhTablePage
      controls={controls}
      description="Gera a exportacao da folha e guarda o historico dos arquivos que vao para o contador."
      onRowPress={handleOpenFile}
      requestParams={requestParams}
      searchKey="status"
      searchPlaceholder="Buscar status"
      searchProps={{
        placeholder: 'Buscar status',
      }}
      showColumnFiltersButton={true}
      showRowActions={false}
      storeName="people_export_jobs"
      title="Folha de ponto"
      toolbarActions={[
        {
          key: 'generate-timesheet',
          icon: 'file-plus',
          label: 'Gerar folha',
          onPress: handleGenerateExport,
        },
      ]}
      totalItemsLabel="exportacoes"
      visibleColumnsPreferenceKey="people_export_jobs-rh"
    />
  );
};

export default RhExportJobsPage;
