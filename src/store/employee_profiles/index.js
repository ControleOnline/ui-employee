import * as actions from '@controleonline/ui-default/src/store/default/actions';
import * as getters from '@controleonline/ui-default/src/store/default/getters';
import mutations from '@controleonline/ui-default/src/store/default/mutations';
import {
  formatBooleanLabel,
  formatDateValue,
  EMPLOYEE_CATEGORY_CONTEXTS,
  resolvePeopleLabel,
} from '@controleonline/ui-employee/src/shared/employeeFormats';

const buildCategoryColumn = ({name, label, context}) => ({
  editable: true,
  sortable: true,
  name,
  align: 'left',
  label,
  list: 'categories/getItems',
  listRequestParams: ({currentCompanyId}) => ({
    ...(currentCompanyId ? {company: currentCompanyId} : {}),
    context,
    'order[name]': 'ASC',
  }),
  searchParam: 'name',
  sortField: `${name}.name`,
  format: (value, _column, row) =>
    value?.name ||
    row?.[`${name}Label`] ||
    (typeof value === 'string' ? value : '') ||
    '-',
  formatList: item => ({
    value: item?.id,
    label: item?.name,
  }),
  saveFormat: value => (value ? `/categories/${parseInt(value.value || value, 10)}` : null),
});

export default {
  namespaced: true,
  state: {
    item: {},
    items: [],
    resourceEndpoint: 'employee_profiles',
    isLoading: false,
    isSaving: false,
    error: '',
    totalItems: 0,
    summary: {},
    filters: {},
    reload: false,
    add: false,
    columns: [
      {
        editable: false,
        isIdentity: true,
        sortable: true,
        name: 'id',
        align: 'left',
        label: 'ID',
        format: value => `#${value}`,
      },
      {
        editable: false,
        sortable: true,
        name: 'peopleLabel',
        align: 'left',
        label: 'Funcionario',
        sortField: 'peopleLabel',
        format: (value, column, row) => resolvePeopleLabel(row?.peopleLabel || row?.people),
      },
      {
        editable: false,
        sortable: true,
        name: 'companyLabel',
        align: 'left',
        label: 'Empresa',
        sortField: 'companyLabel',
        format: (value, column, row) => resolvePeopleLabel(row?.companyLabel || row?.company),
      },
      {
        editable: true,
        sortable: true,
        label: 'Cargo',
        ...buildCategoryColumn({
          context: EMPLOYEE_CATEGORY_CONTEXTS.job,
          label: 'Cargo',
          name: 'jobTitle',
        }),
      },
      {
        editable: true,
        sortable: true,
        label: 'Funcao',
        ...buildCategoryColumn({
          context: EMPLOYEE_CATEGORY_CONTEXTS.function,
          label: 'Funcao',
          name: 'jobFunction',
        }),
      },
      {
        editable: true,
        sortable: true,
        label: 'Departamento',
        ...buildCategoryColumn({
          context: EMPLOYEE_CATEGORY_CONTEXTS.department,
          label: 'Departamento',
          name: 'department',
        }),
      },
      {
        editable: true,
        sortable: true,
        label: 'Vinculo',
        ...buildCategoryColumn({
          context: EMPLOYEE_CATEGORY_CONTEXTS.employmentType,
          label: 'Vinculo',
          name: 'employmentType',
        }),
      },
      {
        editable: true,
        sortable: true,
        name: 'workloadHours',
        align: 'center',
        label: 'Horas',
        format: value => (value !== null && value !== undefined ? String(value) : '-'),
      },
      {
        editable: true,
        sortable: true,
        name: 'active',
        align: 'center',
        label: 'Ativo',
        format: value => formatBooleanLabel(value),
      },
      {
        editable: true,
        sortable: true,
        name: 'admissionDate',
        align: 'left',
        label: 'Admissao',
        format: value => formatDateValue(value),
      },
      {
        editable: true,
        sortable: true,
        name: 'terminationDate',
        align: 'left',
        label: 'Demissao',
        format: value => formatDateValue(value),
      },
      {
        editable: true,
        sortable: true,
        name: 'linkedinHeadline',
        align: 'left',
        label: 'LinkedIn',
        format: value => value || '-',
      },
      {
        editable: false,
        sortable: true,
        name: 'creationDate',
        align: 'left',
        label: 'Criado em',
        format: value => formatDateValue(value),
      },
      {
        editable: false,
        sortable: true,
        name: 'alterDate',
        align: 'left',
        label: 'Atualizado em',
        format: value => formatDateValue(value),
      },
    ],
  },
  actions,
  getters,
  mutations,
};
