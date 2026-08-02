/* eslint-disable no-unused-vars */
import React, {useCallback, useMemo, useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Text, View} from 'react-native';
import {useStore} from '@store';
import DefaultExternalFilters from '@controleonline/ui-default/src/react/components/filters/DefaultExternalFilters';
import RhTablePage from '@controleonline/ui-employee/src/react/pages/RhTablePage';
import {
  buildEmployeeDetailRouteParams,
  buildEmploymentScopeRequestParams,
} from '@controleonline/ui-employee/src/shared/employeeNavigation';
import {
  DEFAULT_EMPLOYEE_CONTEXT,
  formatContextLabel,
  normalizeDateRange,
} from '@controleonline/ui-employee/src/shared/employeeFormats';
import {getDateRange} from '@controleonline/ui-common/src/react/utils/dateRangeFilter';
import {resolveThemePalette} from '@controleonline/../../src/styles/branding';
import {colors} from '@controleonline/../../src/styles/colors';
import {createStyles} from './RhWorkspace.styles';

const TONE_STYLES = {
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

const RhAttendancePage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const peopleStore = useStore('people');
  const themeStore = useStore('theme');
  const {currentCompany} = peopleStore.getters || {};
  const {colors: themeColors} = themeStore.getters || {};

  const context = useMemo(
    () => String(route?.params?.context || DEFAULT_EMPLOYEE_CONTEXT).trim().toLowerCase(),
    [route?.params?.context],
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

  const attendanceDateRange = useMemo(
    () =>
      getDateRange(attendancePeriod.shortcut, attendancePeriod.customRange, {
        relativeMode: 'rolling',
        useCurrentMoment: true,
      }),
    [attendancePeriod.customRange, attendancePeriod.shortcut],
  );

  const requestParams = useMemo(
    () =>
      buildEmploymentScopeRequestParams(currentCompany, {
        context,
        periodStart: attendanceDateRange.after,
        periodEnd: attendanceDateRange.before,
      }),
    [attendanceDateRange.after, attendanceDateRange.before, context, currentCompany?.id],
  );

  const handleRowPress = useCallback(
    row => {
      const employeeId = row?.peopleId || row?.people?.id || null;
      if (!employeeId) {
        return;
      }

      navigation.navigate(
        'EmployeeDetailsPage',
        buildEmployeeDetailRouteParams(employeeId, 'attendance', context),
      );
    },
    [context, navigation],
  );

  const controls = (
    <View>
      <DefaultExternalFilters
        accentColor={palette.primary}
        filters={attendancePeriodFilters}
        onChangeFilters={handleAttendancePeriodFiltersChange}
        storeName="attendance_reports"
      />
      <Text style={styles.controlsText}>
        {`Recorte atual: ${formatContextLabel(context)}.`}
      </Text>
    </View>
  );

  const rowStyle = useCallback(row => {
    const tone = String(row?.tone || '').trim().toLowerCase();
    return {
      borderLeftWidth: 4,
      ...(TONE_STYLES[tone] || TONE_STYLES.muted),
    };
  }, []);

  return (
    <RhTablePage
      controls={controls}
      description="Horas de entrada e saida por pessoa, com destaque para atrasos, faltas e horas extras."
      onRowPress={handleRowPress}
      requestParams={requestParams}
      rowStyle={rowStyle}
      searchKey="search"
      searchPlaceholder="Buscar funcionario, setor ou status"
      searchProps={{
        placeholder: 'Buscar funcionario, setor ou status',
      }}
      showColumnFiltersButton={true}
      showRowActions={false}
      storeName="attendance_reports"
      title="Ponto por setor"
      totalItemsLabel="registros"
      visibleColumnsPreferenceKey="attendance_reports-rh"
    />
  );
};

export default RhAttendancePage;
