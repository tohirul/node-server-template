import { container, InjectionToken } from 'tsyringe';

import { log } from '@/core/log';

// Define an interface for the module being imported dynamically
interface RepositoryModule {
  default: new (...args: any[]) => any; // The default export should be a class (singleton)
}

// Define the structure of each repository entry
interface RepositoryDefinition {
  name: string;
  repository: () => Promise<RepositoryModule>;
}

const repositories: RepositoryDefinition[] = [
  // Example:
  // {
  //   name: 'AirportRepository',
  //   repository: () => import('./container/repository_airport'),
  // },
];

export async function registerRepositories(): Promise<void> {
  const registrationPromises = repositories.map(({ name, repository }) =>
    repository()
      .then((module) => {
        container.registerSingleton(
          name as InjectionToken<InstanceType<typeof module.default>>,
          module.default
        );
      })
      .catch((error) => {
        log.error(`❌ Failed to register ${name}:`, error);
        throw error;
      })
  );

  await Promise.all(registrationPromises);
}

export default container;
