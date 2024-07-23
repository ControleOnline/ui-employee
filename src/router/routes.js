export const routes = [
  {
    path: '/employee/',
    component: () =>  import ('@controleonline/ui-layout/src/layouts/AdminLayout.vue'),
    children: [
      {
        name: 'EmployeeIndex',
        path: '',
        component: () =>  import ('../pages/Employee/Index.vue')
      },
      {
        name: 'EmployeesDetails',
        path: 'id/:id',
        component: () =>  import ('../pages/Employee/Details.vue')
      },
    ]
  },
];