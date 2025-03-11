export const routes = [
  {
    path: '/employee/',
    component: () =>  import ('@controleonline/ui-layout/src/vue/layouts/AdminLayout.vue'),
    children: [
      {
        name: 'EmployeeIndex',
        path: '',
        component: () =>  import ('../pages/Employee/Index.vue')
      },
      {
        name: 'EmployeeDetails',
        path: 'id/:id',
        component: () =>  import ('../pages/Employee/Details.vue')
      },
    ]
  },
];