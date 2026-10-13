import { describe, expect, it } from 'vitest';
import { listEmployeesQuerySchema } from './schemas/employee';
import { employeesHref, firstValues, nextSort } from './url-state';

const defaults = listEmployeesQuerySchema.parse({});

describe('employeesHref', () => {
  it('returns the bare path when everything is default', () => {
    expect(employeesHref(defaults)).toBe('/employees');
  });

  it('keeps only non-default values', () => {
    expect(employeesHref(defaults, { country: 'IN', sortBy: 'salary', sortOrder: 'desc' })).toBe(
      '/employees?sortBy=salary&sortOrder=desc&country=IN',
    );
  });

  it('drops the page when a filter change resets it to 1', () => {
    const onPage3 = { ...defaults, page: 3, search: 'ada' };

    expect(employeesHref(onPage3, { departmentId: 2, page: 1 })).toBe(
      '/employees?search=ada&departmentId=2',
    );
  });

  it('removes a cleared filter', () => {
    expect(employeesHref({ ...defaults, country: 'IN' }, { country: undefined })).toBe(
      '/employees',
    );
  });
});

describe('nextSort', () => {
  it('starts salary biggest-first', () => {
    expect(nextSort(defaults, 'salary')).toEqual({ sortBy: 'salary', sortOrder: 'desc' });
  });

  it('flips the order when the active column is clicked again', () => {
    expect(nextSort({ sortBy: 'salary', sortOrder: 'desc' }, 'salary')).toEqual({
      sortBy: 'salary',
      sortOrder: 'asc',
    });
  });
});

describe('firstValues', () => {
  it('takes the first value of repeated params', () => {
    expect(firstValues({ country: ['IN', 'US'], page: '2', search: undefined })).toEqual({
      country: 'IN',
      page: '2',
      search: undefined,
    });
  });
});
