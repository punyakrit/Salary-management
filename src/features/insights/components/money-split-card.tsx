import { employeesHref } from '@/lib/url-state';
import { getCountryInsights, getDepartmentInsights } from '../queries';
import { payrollShareTakeaway } from '../takeaways';
import { MoneySplit, type SplitRow } from './money-split';

export async function MoneySplitCard({ className }: { className?: string }) {
  const [departments, countries] = await Promise.all([
    getDepartmentInsights(),
    getCountryInsights(),
  ]);

  const byDepartment: SplitRow[] = departments.map((d) => ({
    label: d.departmentName,
    payroll: d.totalPayrollUsd,
    headcount: d.headcount,
    href: employeesHref({}, { departmentId: d.departmentId }),
  }));
  const byCountry: SplitRow[] = countries.map((c) => ({
    label: c.countryName,
    payroll: c.usd.totalPayroll,
    headcount: c.headcount,
    href: employeesHref({}, { country: c.countryCode }),
  }));

  return (
    <MoneySplit
      className={className}
      byDepartment={byDepartment}
      byCountry={byCountry}
      takeaways={{
        department: payrollShareTakeaway(byDepartment),
        country: payrollShareTakeaway(byCountry),
      }}
    />
  );
}
