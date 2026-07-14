/* eslint-disable no-unused-vars */
import React, {useCallback, useMemo} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useStore} from '@store';
import RhTablePage from '@controleonline/ui-employee/src/react/pages/RhTablePage';
import {
  buildEmployeeDetailRouteParams,
  buildEmploymentScopeRequestParams,
} from '@controleonline/ui-employee/src/shared/employeeNavigation';
import {DEFAULT_EMPLOYEE_CONTEXT, formatContextLabel} from '@controleonline/ui-employee/src/shared/employeeFormats';

const RhMovementsPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const peopleStore = useStore('people');
  const {currentCompany} = peopleStore.getters || {};
  const context = useMemo(
    () => String(route?.params?.context || DEFAULT_EMPLOYEE_CONTEXT).trim().toLowerCase(),
    [route?.params?.context],
  );

  const requestParams = useMemo(
    () => buildEmploymentScopeRequestParams(currentCompany, {context}),
    [context, currentCompany?.id],
  );

  const handleRowPress = useCallback(
    row => {
      const employee = row?.people || null;
      const employeeId = String(employee?.id || employee?.['@id'] || '').replace(/\D+/g, '');

      if (!employeeId) {
        return;
      }

      navigation.navigate(
        'EmployeeDetailsPage',
        buildEmployeeDetailRouteParams(employee, 'movements', context),
      );
    },
    [context, navigation],
  );

  return (
    <RhTablePage
      description={`Registros genéricos de entrada e saída. Recorte atual: ${formatContextLabel(context)}.`}
      onRowPress={handleRowPress}
      searchProps={{
        placeholder: 'Buscar origem',
      }}
      requestParams={requestParams}
      searchKey="source"
      searchPlaceholder="Buscar origem"
      storeName="people_access_events"
      title="Movimentos"
      totalItemsLabel="registros"
    />
  );
};

export default RhMovementsPage;
