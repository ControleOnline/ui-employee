import {api} from '@controleonline/ui-common/src/api';
import * as types from '@controleonline/ui-default/src/store/default/mutation_types';

const unwrapResponseData = data => data?.response?.data ?? data?.data ?? data;

const normalizeCollection = payload => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  if (Array.isArray(payload.member)) return payload.member;
  if (Array.isArray(payload['hydra:member'])) return payload['hydra:member'];
  return [];
};

const commitItemIntoCollection = (commit, getters, item) => {
  if (!item) {
    return;
  }

  const items = Array.isArray(getters.items) ? [...getters.items] : [];
  const itemId = String(item?.['@id'] || item?.id || '').replace(/\D+/g, '');
  const index = items.findIndex(currentItem =>
    String(currentItem?.['@id'] || currentItem?.id || '').replace(/\D+/g, '') === itemId,
  );

  if (index >= 0) {
    items[index] = item;
  } else {
    items.unshift(item);
  }

  commit(types.SET_ITEM, item);
  commit(types.SET_ITEMS, items);
};

export const generateTimesheet = ({commit, getters}, payload = {}) => {
  commit(types.SET_ISSAVING, true);
  commit(types.SET_ERROR, null);

  return api
    .fetch(`${getters.resourceEndpoint}/generate`, {
      method: 'POST',
      body: payload,
    })
    .then(response => {
      const data = unwrapResponseData(response);
      commitItemIntoCollection(commit, getters, data);
      return data;
    })
    .catch(error => {
      commit(types.SET_ERROR, error?.message || String(error || ''));
      throw error;
    })
    .finally(() => {
      commit(types.SET_ISSAVING, false);
    });
};

export const reloadHistory = ({commit, getters}, params = {}) => {
  return api
    .fetch(getters.resourceEndpoint, {params})
    .then(response => {
      const items = normalizeCollection(unwrapResponseData(response));
      commit(types.SET_ITEMS, items);
      return items;
    });
};
