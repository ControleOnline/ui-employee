import Formatter from '@controleonline/ui-common/src/utils/formatter.js';

export const DEFAULT_EMPLOYEE_CONTEXT = 'employment';
export const DEFAULT_EMPLOYEE_EXPORT_KIND = 'timesheet';
export const EMPLOYEE_CATEGORY_CONTEXTS = {
  job: 'employment-job',
  function: 'employment-function',
  department: 'employment-department',
  employmentType: 'employment-type',
};

const normalizeText = value => String(value ?? '').trim();

const buildPeopleLabel = people => {
  if (!people || typeof people !== 'object') {
    return normalizeText(people);
  }

  const alias = normalizeText(people?.alias);
  const name = normalizeText(people?.name);

  if (alias && name && alias !== name) {
    return `${alias} - ${name}`;
  }

  return alias || name || '';
};

const normalizeDateInput = value => {
  if (!value) {
    return '';
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString();
};

export const resolveEntityId = value =>
  normalizeText(value?.['@id'] || value?.id || value).replace(/\D+/g, '');

export const resolvePeopleIri = value => {
  const id = resolveEntityId(value);
  return id ? `/people/${id}` : '';
};

export const resolvePeopleLinkIri = value => {
  const id = resolveEntityId(value);
  return id ? `/people_links/${id}` : '';
};

export const resolveCategoryIri = value => {
  const id = resolveEntityId(value);
  return id ? `/categories/${id}` : '';
};

export const resolvePeopleLabel = people => buildPeopleLabel(people) || '-';

export const resolveCompanyLabel = company => resolvePeopleLabel(company);

export const formatDateValue = value => {
  const formatted = Formatter.formatDateYmdTodmY(value);
  return normalizeText(formatted) || '-';
};

export const formatDateTimeValue = value => {
  const formatted = Formatter.formatDateYmdTodmY(value, true);
  return normalizeText(formatted) || '-';
};

export const formatTimeValue = value => {
  if (!value) {
    return '-';
  }

  if (value instanceof Date) {
    return value.toISOString().slice(11, 16);
  }

  const normalized = normalizeText(value);
  if (!normalized) {
    return '-';
  }

  return normalized.slice(0, 5);
};

export const formatBooleanLabel = value => (value ? 'Sim' : 'Nao');

export const formatContextLabel = value => {
  const normalized = normalizeText(value).toLowerCase();
  const map = {
    employment: 'RH',
    building_access: 'Acesso predial',
    procedure: 'Procedimento',
  };

  return map[normalized] || normalizeText(value) || '-';
};

export const formatEmployeeCategoryContextLabel = value => {
  const normalized = normalizeText(value).toLowerCase();
  const map = {
    [EMPLOYEE_CATEGORY_CONTEXTS.job]: 'Cargo',
    [EMPLOYEE_CATEGORY_CONTEXTS.function]: 'Funcao',
    [EMPLOYEE_CATEGORY_CONTEXTS.department]: 'Departamento',
    [EMPLOYEE_CATEGORY_CONTEXTS.employmentType]: 'Vinculo',
  };

  return map[normalized] || normalizeText(value) || '-';
};

export const formatDirectionLabel = value => {
  const normalized = normalizeText(value).toLowerCase();
  if (normalized === 'exit') {
    return 'Saida';
  }

  if (normalized === 'entry') {
    return 'Entrada';
  }

  return normalizeText(value) || '-';
};

export const formatModeLabel = value => {
  const normalized = normalizeText(value).toLowerCase();
  if (normalized === 'appointment') {
    return 'Compromisso';
  }

  if (normalized === 'recurring') {
    return 'Recorrente';
  }

  return normalizeText(value) || '-';
};

export const formatStatusLabel = value => {
  const normalized = normalizeText(value).toLowerCase();
  const map = {
    pending: 'Pendente',
    processing: 'Processando',
    done: 'Concluido',
    error: 'Erro',
  };

  return map[normalized] || normalizeText(value) || '-';
};

export const formatKindLabel = value => {
  const normalized = normalizeText(value).toLowerCase();
  if (normalized === 'timesheet') {
    return 'Folha de ponto';
  }

  return normalizeText(value) || '-';
};

const padDurationComponent = value => String(Math.abs(Number(value) || 0)).padStart(2, '0');

export const formatDurationMinutes = value => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  const numericValue = Math.max(0, Number(value) || 0);
  const hours = Math.floor(numericValue / 60);
  const minutes = numericValue % 60;

  return `${padDurationComponent(hours)}:${padDurationComponent(minutes)}`;
};

export const formatSignedDurationMinutes = value => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  const numericValue = Number(value) || 0;
  const label = formatDurationMinutes(Math.abs(numericValue));
  if (numericValue > 0) {
    return `+${label}`;
  }

  if (numericValue < 0) {
    return `-${label}`;
  }

  return label;
};

export const formatAttendanceStatusLabel = value => {
  const normalized = normalizeText(value).toLowerCase();
  const map = {
    absent: 'Falta',
    absent_justified: 'Falta justificada',
    late: 'Atraso',
    late_overtime: 'Atraso e hora extra',
    overtime: 'Hora extra',
    present: 'Em dia',
    unplanned: 'Sem escala',
  };

  return map[normalized] || normalizeText(value) || '-';
};

export const formatAttendanceToneLabel = value => {
  const normalized = normalizeText(value).toLowerCase();
  const map = {
    danger: 'Alerta',
    info: 'Informacao',
    success: 'Ok',
    warning: 'Atencao',
  };

  return map[normalized] || normalizeText(value) || '-';
};

export const buildScheduleWindowLabel = schedule => {
  if (!schedule || typeof schedule !== 'object') {
    return '-';
  }

  if (normalizeText(schedule?.mode).toLowerCase() === 'appointment') {
    const startsAt = formatDateTimeValue(schedule?.startsAt);
    const endsAt = formatDateTimeValue(schedule?.endsAt);
    const label = [startsAt, endsAt].filter(value => value && value !== '-').join(' - ');
    return label || '-';
  }

  const weekdayLabel = normalizeText(schedule?.weekdayLabel);
  const start = formatTimeValue(schedule?.startTime);
  const end = formatTimeValue(schedule?.endTime);
  const parts = [weekdayLabel, start, end].filter(value => value && value !== '-');

  return parts.length > 0 ? parts.join(' ') : '-';
};

export const formatExportPeriodLabel = job => {
  if (!job || typeof job !== 'object') {
    return '-';
  }

  const start = formatDateValue(job?.periodStart);
  const end = formatDateValue(job?.periodEnd);
  const label = [start, end].filter(value => value && value !== '-').join(' - ');

  return label || '-';
};

export const formatFileLabel = file => {
  if (!file || typeof file !== 'object') {
    return normalizeText(file) || '-';
  }

  const fileName = normalizeText(file?.fileName || file?.name);
  const extension = normalizeText(file?.extension);

  if (!fileName) {
    return '-';
  }

  return extension ? `${fileName}.${extension}` : fileName;
};

export const normalizeDateRange = ({ shortcut = '', customRange = {} } = {}) => ({
  shortcut: normalizeText(shortcut),
  customRange: {
    from: normalizeText(customRange?.from || ''),
    to: normalizeText(customRange?.to || ''),
  },
});

export const normalizeDateString = value => {
  const isoValue = normalizeDateInput(value);
  return isoValue ? isoValue.slice(0, 10) : '';
};

export const normalizePeopleSnapshot = snapshot => {
  if (!snapshot) {
    return null;
  }

  if (typeof snapshot === 'object') {
    return snapshot;
  }

  if (typeof snapshot !== 'string') {
    return null;
  }

  try {
    return JSON.parse(snapshot);
  } catch {
    return snapshot;
  }
};
