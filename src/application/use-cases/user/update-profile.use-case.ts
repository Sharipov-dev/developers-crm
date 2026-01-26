import type { User } from '../../../domain/entities/user.entity.js';
import { UserNotFoundError } from '../../../domain/errors/user.errors.js';
import type { UserRepository } from '../../../domain/repositories/user.repository.js';
import type { UpdateProfileDto } from '../../dto/user.dto.js';

export class UpdateProfileUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string, data: UpdateProfileDto): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    return this.userRepository.update(userId, {
      displayName: data.displayName,
    });
  }
}
