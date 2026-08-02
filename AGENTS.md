## Module Contract
- `ui-employee` is the RH entry module for the dashboard, employees, function registry, contracts, movements, schedules and export history.
- `employee_profiles` is the RH-specific layer and stays linked to `people_link` with `linkType=employee`.
- `people_access_events`, `people_schedules` and `people_export_jobs` are generic, context-scoped stores; the current UI uses `employment`, but every request and filter must keep `context` explicit for future reuse.
- Screens in this module must stay store-first, reuse shared/default components, and keep browser smoke coverage when routes change.

## Qualidade de código

- A barra comum de modularizacao, testes, smoke tests e limite de tamanho de componentes vive em `https://github.com/ControleOnline/agents-mcp/blob/master/skills/shared/code-quality.md`.
