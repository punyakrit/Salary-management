import 'server-only';
import { systemClock } from './clock';
import { db } from './db';
import { createPrismaEmployeeRepository } from './modules/employees/employee.prisma-repository';
import { createEmployeeService } from './modules/employees/employee.service';
import { createPrismaInsightsRepository } from './modules/insights/insights.prisma-repository';
import { createInsightsService } from './modules/insights/insights.service';
import { createPrismaReferenceRepository } from './modules/reference/reference.prisma-repository';

/**
 * Composition root: the only place that knows which concrete repositories back
 * the services. Pages and Server Actions import from here; tests build services
 * with in-memory fakes instead (docs/02-architecture.md, Key decisions).
 */
const reference = createPrismaReferenceRepository(db);

export const services = {
  employees: createEmployeeService({
    employees: createPrismaEmployeeRepository(db),
    reference,
    clock: systemClock,
  }),
  insights: createInsightsService({ insights: createPrismaInsightsRepository(db), reference }),
  reference,
};
