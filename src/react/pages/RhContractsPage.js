/* eslint-disable no-unused-vars */
import React, {useCallback, useMemo} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useStore} from '@store';
import RhTablePage from '@controleonline/ui-employee/src/react/pages/RhTablePage';
import {
  buildEmploymentContractRequestParams,
} from '@controleonline/ui-employee/src/shared/employeeNavigation';
import {DEFAULT_EMPLOYEE_CONTEXT, formatContextLabel, resolveEntityId} from '@controleonline/ui-employee/src/shared/employeeFormats';

const RhContractsPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const peopleStore = useStore('people');
  const {currentCompany} = peopleStore.getters || {};
  const context = useMemo(
    () => String(route?.params?.context || DEFAULT_EMPLOYEE_CONTEXT).trim().toLowerCase(),
    [route?.params?.context],
  );

  const requestParams = useMemo(
    () => buildEmploymentContractRequestParams(currentCompany, {'contractModel.context': context}),
    [context, currentCompany?.id],
  );

  const handleRowPress = useCallback(
    row => {
      const contractId = resolveEntityId(row?.id || row?.['@id']);

      if (!contractId) {
        return;
      }

      navigation.navigate('ContractDetails', {contractId});
    },
    [navigation],
  );

  return (
    <RhTablePage
      description={`Contratos de trabalho do contexto ${formatContextLabel(context)}.`}
      onRowPress={handleRowPress}
      searchProps={{
        placeholder: 'Buscar funcionario',
      }}
      requestParams={requestParams}
      searchKey="peoples.people.name"
      searchPlaceholder="Buscar funcionario"
      storeName="contract"
      title="Contratos"
      totalItemsLabel="contratos"
    />
  );
};

export default RhContractsPage;
