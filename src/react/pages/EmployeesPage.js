/* eslint-disable no-unused-vars */
import React from 'react';
import People from '@controleonline/ui-people/src/react/pages/People';
import {
  DEFAULT_EMPLOYEE_CONTEXT,
} from '@controleonline/ui-employee/src/shared/employeeFormats';
import {
  buildEmployeeDetailRouteParams,
} from '@controleonline/ui-employee/src/shared/employeeNavigation';

const buildEmployeesContext = routeParams => ({
  context: DEFAULT_EMPLOYEE_CONTEXT,
  defaultContext: DEFAULT_EMPLOYEE_CONTEXT,
  selectedContext: DEFAULT_EMPLOYEE_CONTEXT,
  defaultPeopleType: 'F',
  title: routeParams?.title || global.t?.t('people', 'label', 'employee') || 'Funcionarios',
  searchPlaceholder:
    routeParams?.searchPlaceholder ||
    global.t?.t('people', 'searchPlaceholder', 'searchEmployee') ||
    'Buscar funcionario',
  modalTitle:
    routeParams?.modalTitle ||
    global.t?.t('people', 'title', 'newEmployee') ||
    'Cadastro de funcionario',
  detailsRouteName: 'EmployeeDetailsPage',
  detailsRouteParams: employee => buildEmployeeDetailRouteParams(
    employee,
    'data',
    DEFAULT_EMPLOYEE_CONTEXT,
  ),
});

const EmployeesPage = ({route}) => {
  const context = buildEmployeesContext(route?.params || {});

  return <People context={context} />;
};

export default EmployeesPage;
