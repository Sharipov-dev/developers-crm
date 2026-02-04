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
import { CreateDealUseCase } from '../application/use-cases/deal/create-deal.use-case.js';
import { DeleteDealUseCase } from '../application/use-cases/deal/delete-deal.use-case.js';
import { GetDealUseCase } from '../application/use-cases/deal/get-deal.use-case.js';
import { ListDealsUseCase } from '../application/use-cases/deal/list-deals.use-case.js';
import { MarkDealLostUseCase } from '../application/use-cases/deal/mark-deal-lost.use-case.js';
import { MarkDealWonUseCase } from '../application/use-cases/deal/mark-deal-won.use-case.js';
import { UpdateDealUseCase } from '../application/use-cases/deal/update-deal.use-case.js';
import { CreateInteractionUseCase } from '../application/use-cases/interaction/create-interaction.use-case.js';
import { DeleteInteractionUseCase } from '../application/use-cases/interaction/delete-interaction.use-case.js';
import { GetInteractionUseCase } from '../application/use-cases/interaction/get-interaction.use-case.js';
import { ListInteractionsUseCase } from '../application/use-cases/interaction/list-interactions.use-case.js';
import { UpdateInteractionUseCase } from '../application/use-cases/interaction/update-interaction.use-case.js';
import { DisableAccountUseCase } from '../application/use-cases/user/disable-account.use-case.js';
import { GetCurrentUserUseCase } from '../application/use-cases/user/get-current-user.use-case.js';
import { LoginUserUseCase } from '../application/use-cases/user/login-user.use-case.js';
import { RegisterUserUseCase } from '../application/use-cases/user/register-user.use-case.js';
import { UpdateProfileUseCase } from '../application/use-cases/user/update-profile.use-case.js';
import { prisma } from '../infrastructure/db/prisma.client.js';
import { PrismaCompanyRepository } from '../infrastructure/repositories/prisma-company.repository.js';
import { PrismaContactRepository } from '../infrastructure/repositories/prisma-contact.repository.js';
import { PrismaDealRepository } from '../infrastructure/repositories/prisma-deal.repository.js';
import { PrismaInteractionRepository } from '../infrastructure/repositories/prisma-interaction.repository.js';
import { PrismaUserRepository } from '../infrastructure/repositories/prisma-user.repository.js';
import { JwtTokenService } from '../infrastructure/services/jwt.service.js';
import { BcryptPasswordService } from '../infrastructure/services/password.service.js';
import { CompanyController } from '../interfaces/http/controllers/company.controller.js';
import { ContactController } from '../interfaces/http/controllers/contact.controller.js';
import { DealController } from '../interfaces/http/controllers/deal.controller.js';
import { InteractionController } from '../interfaces/http/controllers/interaction.controller.js';
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
const dealRepository = new PrismaDealRepository(prisma);
const interactionRepository = new PrismaInteractionRepository(prisma);

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

// Use Cases - Deal
const createDealUseCase = new CreateDealUseCase(dealRepository, contactRepository, companyRepository);
const getDealUseCase = new GetDealUseCase(dealRepository);
const listDealsUseCase = new ListDealsUseCase(dealRepository);
const updateDealUseCase = new UpdateDealUseCase(dealRepository, contactRepository, companyRepository);
const deleteDealUseCase = new DeleteDealUseCase(dealRepository);
const markDealWonUseCase = new MarkDealWonUseCase(dealRepository);
const markDealLostUseCase = new MarkDealLostUseCase(dealRepository);

// Use Cases - Interaction
const createInteractionUseCase = new CreateInteractionUseCase(interactionRepository, contactRepository, companyRepository, dealRepository);
const getInteractionUseCase = new GetInteractionUseCase(interactionRepository);
const listInteractionsUseCase = new ListInteractionsUseCase(interactionRepository);
const updateInteractionUseCase = new UpdateInteractionUseCase(interactionRepository, contactRepository, companyRepository, dealRepository);
const deleteInteractionUseCase = new DeleteInteractionUseCase(interactionRepository);

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
const dealController = new DealController(
  createDealUseCase,
  getDealUseCase,
  listDealsUseCase,
  updateDealUseCase,
  deleteDealUseCase,
  markDealWonUseCase,
  markDealLostUseCase
);
const interactionController = new InteractionController(
  createInteractionUseCase,
  getInteractionUseCase,
  listInteractionsUseCase,
  updateInteractionUseCase,
  deleteInteractionUseCase
);

// Middlewares
const authMiddleware = createAuthMiddleware(jwtService);

export const controllers: Controllers = {
  healthController,
  userController,
  companyController,
  contactController,
  dealController,
  interactionController,
};

export const middlewares: Middlewares = {
  authMiddleware,
};

export const repositories = {
  userRepository,
  companyRepository,
  contactRepository,
  dealRepository,
  interactionRepository,
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
  createDealUseCase,
  getDealUseCase,
  listDealsUseCase,
  updateDealUseCase,
  deleteDealUseCase,
  markDealWonUseCase,
  markDealLostUseCase,
  createInteractionUseCase,
  getInteractionUseCase,
  listInteractionsUseCase,
  updateInteractionUseCase,
  deleteInteractionUseCase,
};
