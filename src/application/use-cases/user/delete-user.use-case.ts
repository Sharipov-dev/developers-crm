import { UserNotFoundError } from '../../../domain/errors/user.errors.js';
import type { UserRepository } from '../../../domain/repositories/user.repository.js';

export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<void> {
    const exists = await this.userRepository.existsById(id);

    if (!exists) {
      throw new UserNotFoundError(id);
    }

    await this.userRepository.delete(id);
  }
}
