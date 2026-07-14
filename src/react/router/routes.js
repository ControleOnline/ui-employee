import React from 'react';
import EmployeesPage from '@controleonline/ui-employee/src/react/pages/EmployeesPage';
import EmployeeDetailsPage from '@controleonline/ui-employee/src/react/pages/EmployeeDetailsPage';

const employeeRoutes = [
  {
    name: 'EmployeesPage',
    component: EmployeesPage,
    options: {
      showCompanyFilter: true,
      headerShown: true,
      headerBackVisible: true,
      companyFilterMode: 'icon',
      title: () => global.t?.t('people', 'label', 'employee') || 'Funcionarios',
      showBottomToolBar: true,
    },
    path: 'hr/employees',
  },
  {
    name: 'EmployeeDetailsPage',
    component: EmployeeDetailsPage,
    options: {
      headerShown: false,
      headerBackVisible: true,
      showCompanyFilter: false,
      showBottomToolBar: true,
      title: 'Funcionario',
    },
    path: 'hr/employees/details',
  },
];

export default employeeRoutes;
