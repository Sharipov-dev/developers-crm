import type { User } from '../../../domain/entities/user.entity.js';
import { UserNotFoundError } from '../../../domain/errors/user.errors.js';
import type { UserRepository } from '../../../domain/repositories/user.repository.js';

export class GetUserByIdUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new UserNotFoundError(id);
    }

    return user;
  }
}
