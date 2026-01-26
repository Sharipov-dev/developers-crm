import type { User } from '../../../domain/entities/user.entity.js';
import { UserEmailAlreadyExistsError, UserNotFoundError } from '../../../domain/errors/user.errors.js';
import type { UserRepository } from '../../../domain/repositories/user.repository.js';
import type { UpdateUserDto } from '../../dto/user.dto.js';

export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string, data: UpdateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      throw new UserNotFoundError(id);
    }

    if (data.email && data.email !== existingUser.email) {
      const userWithEmail = await this.userRepository.findByEmail(data.email);
      if (userWithEmail) {
        throw new UserEmailAlreadyExistsError(data.email);
      }
    }

    return this.userRepository.update(id, data);
  }
}
