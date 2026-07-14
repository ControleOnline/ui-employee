/* eslint-disable no-unused-vars */
import React, {useCallback, useMemo} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useStore} from '@store';
import RhTablePage from '@controleonline/ui-employee/src/react/pages/RhTablePage';
import {
  buildEmployeeDetailRouteParams,
  buildEmployeeProfileRequestParams,
} from '@controleonline/ui-employee/src/shared/employeeNavigation';

const RhFunctionsPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const peopleStore = useStore('people');
  const {currentCompany} = peopleStore.getters || {};
  const context = useMemo(
    () => String(route?.params?.context || 'employment').trim().toLowerCase(),
    [route?.params?.context],
  );

  const requestParams = useMemo(
    () => buildEmployeeProfileRequestParams(currentCompany),
    [currentCompany?.id],
  );

  const handleRowPress = useCallback(
    row => {
      const employee = row?.peopleLink?.people || row?.peopleLink?.people?.id || row?.people;
      const employeeId = String(employee?.id || employee?.['@id'] || employee || '').replace(/\D+/g, '');

      if (!employeeId) {
        return;
      }

      navigation.navigate(
        'EmployeeDetailsPage',
        buildEmployeeDetailRouteParams(employee, 'profile', context),
      );
    },
    [context, navigation],
  );

  return (
    <RhTablePage
      description="Cadastro de cargos, funcoes e snapshots locais do LinkedIn por colaborador."
      onRowPress={handleRowPress}
      searchProps={{
        placeholder: 'Buscar cargo',
      }}
      requestParams={requestParams}
      searchKey="jobTitle"
      searchPlaceholder="Buscar cargo"
      storeName="employee_profiles"
      title="Cargos e funcoes"
      totalItemsLabel="funcoes"
    />
  );
};

export default RhFunctionsPage;
