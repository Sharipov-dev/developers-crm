import { CreateCompanyUseCase } from '../application/use-cases/company/create-company.use-case.js';
import { DeleteCompanyUseCase } from '../application/use-cases/company/delete-company.use-case.js';
import { GetCompanyUseCase } from '../application/use-cases/company/get-company.use-case.js';
import { ListCompaniesUseCase } from '../application/use-cases/company/list-companies.use-case.js';
import { UpdateCompanyUseCase } from '../application/use-cases/company/update-company.use-case.js';
import { CreateContactUseCase } from '../application/use-cases/contact/create-contact.use-case.js';
import { DeleteContactUseCase } from '../application/use-cases/contact/delete-contact.use-case.js';
import { GetContactUseCase } from '../application/use-cases/contact/get-contact.use-case.js';
import { ListContactsUseCase } from '../application/use-cases/contact/list-contacts.use-case.js';
import { UpdateContactUseCase } from '../application/use-cases/contact/update-contact.use-case.js';
import { DisableAccountUseCase } from '../application/use-cases/user/disable-account.use-case.js';
import { GetCurrentUserUseCase } from '../application/use-cases/user/get-current-user.use-case.js';
import { LoginUserUseCase } from '../application/use-cases/user/login-user.use-case.js';
import { RegisterUserUseCase } from '../application/use-cases/user/register-user.use-case.js';
import { UpdateProfileUseCase } from '../application/use-cases/user/update-profile.use-case.js';
import { prisma } from '../infrastructure/db/prisma.client.js';
import { PrismaCompanyRepository } from '../infrastructure/repositories/prisma-company.repository.js';
import { PrismaContactRepository } from '../infrastructure/repositories/prisma-contact.repository.js';
import { PrismaUserRepository } from '../infrastructure/repositories/prisma-user.repository.js';
import { JwtTokenService } from '../infrastructure/services/jwt.service.js';
import { BcryptPasswordService } from '../infrastructure/services/password.service.js';
import { CompanyController } from '../interfaces/http/controllers/company.controller.js';
import { ContactController } from '../interfaces/http/controllers/contact.controller.js';
import { HealthController } from '../interfaces/http/controllers/health.controller.js';
import { UserController } from '../interfaces/http/controllers/user.controller.js';
import { createAuthMiddleware } from '../interfaces/http/middlewares/auth.middleware.js';
import type { Controllers, Middlewares } from '../interfaces/http/routes/router.js';
import { env } from '../shared/config/env.config.js';

// Services
const passwordService = new BcryptPasswordService();
const jwtService = new JwtTokenService(env.JWT_SECRET, env.JWT_EXPIRES_IN);

// Repositories
const userRepository = new PrismaUserRepository(prisma);
const companyRepository = new PrismaCompanyRepository(prisma);
const contactRepository = new PrismaContactRepository(prisma);

// Use Cases - User
const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordService);
const loginUserUseCase = new LoginUserUseCase(userRepository, passwordService, jwtService);
const getCurrentUserUseCase = new GetCurrentUserUseCase(userRepository);
const updateProfileUseCase = new UpdateProfileUseCase(userRepository);
const disableAccountUseCase = new DisableAccountUseCase(userRepository);

// Use Cases - Company
const createCompanyUseCase = new CreateCompanyUseCase(companyRepository);
const getCompanyUseCase = new GetCompanyUseCase(companyRepository);
const listCompaniesUseCase = new ListCompaniesUseCase(companyRepository);
const updateCompanyUseCase = new UpdateCompanyUseCase(companyRepository);
const deleteCompanyUseCase = new DeleteCompanyUseCase(companyRepository);

// Use Cases - Contact
const createContactUseCase = new CreateContactUseCase(contactRepository, companyRepository);
const getContactUseCase = new GetContactUseCase(contactRepository);
const listContactsUseCase = new ListContactsUseCase(contactRepository);
const updateContactUseCase = new UpdateContactUseCase(contactRepository, companyRepository);
const deleteContactUseCase = new DeleteContactUseCase(contactRepository);

// Controllers
const healthController = new HealthController();
const userController = new UserController(
  registerUserUseCase,
  loginUserUseCase,
  getCurrentUserUseCase,
  updateProfileUseCase,
  disableAccountUseCase
);
const companyController = new CompanyController(
  createCompanyUseCase,
  getCompanyUseCase,
  listCompaniesUseCase,
  updateCompanyUseCase,
  deleteCompanyUseCase
);
const contactController = new ContactController(
  createContactUseCase,
  getContactUseCase,
  listContactsUseCase,
  updateContactUseCase,
  deleteContactUseCase
);

// Middlewares
const authMiddleware = createAuthMiddleware(jwtService);

export const controllers: Controllers = {
  healthController,
  userController,
  companyController,
  contactController,
};

export const middlewares: Middlewares = {
  authMiddleware,
};

export const repositories = {
  userRepository,
  companyRepository,
  contactRepository,
};

export const services = {
  passwordService,
  jwtService,
};

export const useCases = {
  registerUserUseCase,
  loginUserUseCase,
  getCurrentUserUseCase,
  updateProfileUseCase,
  disableAccountUseCase,
  createCompanyUseCase,
  getCompanyUseCase,
  listCompaniesUseCase,
  updateCompanyUseCase,
  deleteCompanyUseCase,
  createContactUseCase,
  getContactUseCase,
  listContactsUseCase,
  updateContactUseCase,
  deleteContactUseCase,
};
