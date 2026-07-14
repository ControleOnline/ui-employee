import React from 'react';
import EmployeesPage from '@controleonline/ui-employee/src/react/pages/EmployeesPage';
import EmployeeDetailsPage from '@controleonline/ui-employee/src/react/pages/EmployeeDetailsPage';
import RhHomePage from '@controleonline/ui-employee/src/react/pages/RhHomePage';
import RhFunctionsPage from '@controleonline/ui-employee/src/react/pages/RhFunctionsPage';
import RhMovementsPage from '@controleonline/ui-employee/src/react/pages/RhMovementsPage';
import RhAttendancePage from '@controleonline/ui-employee/src/react/pages/RhAttendancePage';
import RhContractsPage from '@controleonline/ui-employee/src/react/pages/RhContractsPage';
import RhSchedulesPage from '@controleonline/ui-employee/src/react/pages/RhSchedulesPage';
import RhExportJobsPage from '@controleonline/ui-employee/src/react/pages/RhExportJobsPage';

const employeeRoutes = [
  {
    name: 'RhHomePage',
    component: RhHomePage,
    options: {
      showCompanyFilter: true,
      headerShown: true,
      headerBackVisible: true,
      companyFilterMode: 'icon',
      title: 'RH',
      showBottomToolBar: true,
    },
    path: 'hr',
  },
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
    name: 'RhFunctionsPage',
    component: RhFunctionsPage,
    options: {
      showCompanyFilter: true,
      headerShown: true,
      headerBackVisible: true,
      companyFilterMode: 'icon',
      title: 'Cargos e funcoes',
      showBottomToolBar: true,
    },
    path: 'hr/functions',
  },
  {
    name: 'RhMovementsPage',
    component: RhMovementsPage,
    options: {
      showCompanyFilter: true,
      headerShown: true,
      headerBackVisible: true,
      companyFilterMode: 'icon',
      title: 'Movimentos',
      showBottomToolBar: true,
    },
    path: 'hr/movements',
  },
  {
    name: 'RhAttendancePage',
    component: RhAttendancePage,
    options: {
      showCompanyFilter: true,
      headerShown: true,
      headerBackVisible: true,
      companyFilterMode: 'icon',
      title: 'Ponto por setor',
      showBottomToolBar: true,
    },
    path: 'hr/attendance',
  },
  {
    name: 'RhContractsPage',
    component: RhContractsPage,
    options: {
      showCompanyFilter: true,
      headerShown: true,
      headerBackVisible: true,
      companyFilterMode: 'icon',
      title: 'Contratos',
      showBottomToolBar: true,
    },
    path: 'hr/contracts',
  },
  {
    name: 'RhSchedulesPage',
    component: RhSchedulesPage,
    options: {
      showCompanyFilter: true,
      headerShown: true,
      headerBackVisible: true,
      companyFilterMode: 'icon',
      title: 'Agendas',
      showBottomToolBar: true,
    },
    path: 'hr/schedules',
  },
  {
    name: 'RhExportJobsPage',
    component: RhExportJobsPage,
    options: {
      showCompanyFilter: true,
      headerShown: true,
      headerBackVisible: true,
      companyFilterMode: 'icon',
      title: 'Folha de ponto',
      showBottomToolBar: true,
    },
    path: 'hr/exports',
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
