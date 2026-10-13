import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { EMPLOYEES_TAG } from '@/server/cache-tags';
import { services } from '@/server/container';

/*
 * Aggregations over 10k rows are the heaviest reads in the app, and they only
 * change when an employee is written. Cache them and expire on write instead
 * of recomputing on every dashboard view.
 */

export async function getOverview() {
  'use cache';
  cacheLife('hours');
  cacheTag(EMPLOYEES_TAG);
  return services.insights.overview();
}

export async function getCountryInsights() {
  'use cache';
  cacheLife('hours');
  cacheTag(EMPLOYEES_TAG);
  return services.insights.byCountry();
}

export async function getDepartmentInsights() {
  'use cache';
  cacheLife('hours');
  cacheTag(EMPLOYEES_TAG);
  return services.insights.byDepartment();
}

export async function getJobTitleInsights(countryCode: string) {
  'use cache';
  cacheLife('hours');
  cacheTag(EMPLOYEES_TAG);
  return services.insights.byJobTitle(countryCode);
}

export async function getSalaryDistribution() {
  'use cache';
  cacheLife('hours');
  cacheTag(EMPLOYEES_TAG);
  return services.insights.distribution();
}
