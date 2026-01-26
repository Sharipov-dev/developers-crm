import type { User } from '../../../domain/entities/user.entity.js';
import { UserEmailAlreadyExistsError } from '../../../domain/errors/user.errors.js';
import type { UserRepository } from '../../../domain/repositories/user.repository.js';
import type { RegisterUserDto } from '../../dto/user.dto.js';
import type { PasswordService } from '../../services/password.service.js';

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService
  ) {}

  async execute(data: RegisterUserDto): Promise<User> {
    const emailExists = await this.userRepository.existsByEmail(data.email);
    if (emailExists) {
      throw new UserEmailAlreadyExistsError(data.email);
    }

    const passwordHash = await this.passwordService.hash(data.password);

    return this.userRepository.create({
      email: data.email,
      passwordHash,
      displayName: data.displayName,
    });
  }
}
