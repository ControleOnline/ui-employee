import {
  DEFAULT_EMPLOYEE_CONTEXT,
  DEFAULT_EMPLOYEE_EXPORT_KIND,
  resolveEntityId,
  resolvePeopleIri,
} from './employeeFormats';

export const RH_ROUTE_NAMES = {
  HOME: 'RhHomePage',
  EMPLOYEES: 'EmployeesPage',
  FUNCTIONS: 'RhFunctionsPage',
  MOVEMENTS: 'RhMovementsPage',
  ATTENDANCE: 'RhAttendancePage',
  CONTRACTS: 'RhContractsPage',
  SCHEDULES: 'RhSchedulesPage',
  EXPORTS: 'RhExportJobsPage',
};

export const RH_HOME_LINKS = [
  {
    key: 'employees',
    label: 'Funcionarios',
    description: 'Cadastro base e vinculo dos colaboradores.',
    icon: 'account-group',
    color: '#2563EB',
    routeName: RH_ROUTE_NAMES.EMPLOYEES,
    routeParams: {context: DEFAULT_EMPLOYEE_CONTEXT},
  },
  {
    key: 'functions',
    label: 'Cargos e funcoes',
    description: 'Perfil do colaborador com cargo, funcao e area.',
    icon: 'badge-account-horizontal',
    color: '#7C3AED',
    routeName: RH_ROUTE_NAMES.FUNCTIONS,
    routeParams: {context: DEFAULT_EMPLOYEE_CONTEXT},
  },
  {
    key: 'movements',
    label: 'Movimentos',
    description: 'Entradas, saidas e outros eventos por contexto.',
    icon: 'fingerprint',
    color: '#0EA5E9',
    routeName: RH_ROUTE_NAMES.MOVEMENTS,
    routeParams: {context: DEFAULT_EMPLOYEE_CONTEXT},
  },
  {
    key: 'attendance',
    label: 'Ponto por setor',
    description: 'Atrasos, faltas, horas extras e jornadas por departamento.',
    icon: 'clock-outline',
    color: '#2563EB',
    routeName: RH_ROUTE_NAMES.ATTENDANCE,
    routeParams: {context: DEFAULT_EMPLOYEE_CONTEXT},
  },
  {
    key: 'contracts',
    label: 'Contratos',
    description: 'Contratos de trabalho do contexto employment.',
    icon: 'file-document-outline',
    color: '#16A34A',
    routeName: RH_ROUTE_NAMES.CONTRACTS,
    routeParams: {context: DEFAULT_EMPLOYEE_CONTEXT},
  },
  {
    key: 'schedules',
    label: 'Agendas',
    description: 'Escalas recorrentes e compromissos datados.',
    icon: 'calendar-clock',
    color: '#F97316',
    routeName: RH_ROUTE_NAMES.SCHEDULES,
    routeParams: {context: DEFAULT_EMPLOYEE_CONTEXT},
  },
  {
    key: 'exports',
    label: 'Folha de ponto',
    description: 'Exportacao e historico da folha para o contador.',
    icon: 'file-export',
    color: '#475569',
    routeName: RH_ROUTE_NAMES.EXPORTS,
    routeParams: {
      context: DEFAULT_EMPLOYEE_CONTEXT,
      kind: DEFAULT_EMPLOYEE_EXPORT_KIND,
    },
  },
];

export const buildEmployeeDetailRouteParams = (
  employee,
  tab = 'data',
  context = DEFAULT_EMPLOYEE_CONTEXT,
) => {
  const id = resolveEntityId(employee);

  return {
    ...(id ? {id} : {}),
    context,
    tab,
  };
};

export const buildEmployeeProfileRequestParams = currentCompany => ({
  ...(currentCompany?.id
    ? {'peopleLink.company': resolvePeopleIri(currentCompany)}
    : {}),
  'peopleLink.linkType': 'employee',
});

export const buildEmploymentScopeRequestParams = (
  currentCompany,
  extra = {},
) => ({
  ...(currentCompany?.id ? {company: currentCompany.id} : {}),
  context: DEFAULT_EMPLOYEE_CONTEXT,
  ...extra,
});

export const buildEmploymentContractRequestParams = (
  currentCompany,
  extra = {},
) => ({
  ...(currentCompany?.id ? {provider: currentCompany.id} : {}),
  'contractModel.context': DEFAULT_EMPLOYEE_CONTEXT,
  ...extra,
});

export const buildEmploymentExportRequestParams = (
  currentCompany,
  extra = {},
) => ({
  ...(currentCompany?.id ? {company: currentCompany.id} : {}),
  context: DEFAULT_EMPLOYEE_CONTEXT,
  kind: DEFAULT_EMPLOYEE_EXPORT_KIND,
  ...extra,
});
