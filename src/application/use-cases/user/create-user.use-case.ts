import type { User } from '../../../domain/entities/user.entity.js';
import { UserEmailAlreadyExistsError } from '../../../domain/errors/user.errors.js';
import type { UserRepository } from '../../../domain/repositories/user.repository.js';
import type { CreateUserDto } from '../../dto/user.dto.js';

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(data: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new UserEmailAlreadyExistsError(data.email);
    }

    return this.userRepository.create({
      email: data.email,
      name: data.name,
    });
  }
}
