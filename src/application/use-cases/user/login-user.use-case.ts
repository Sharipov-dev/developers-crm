import type { User } from '../../../domain/entities/user.entity.js';
import { InvalidCredentialsError, UserDisabledError } from '../../../domain/errors/user.errors.js';
import type { UserRepository } from '../../../domain/repositories/user.repository.js';
import type { LoginUserDto } from '../../dto/user.dto.js';
import type { JwtService } from '../../services/jwt.service.js';
import type { PasswordService } from '../../services/password.service.js';

export interface LoginResult {
  accessToken: string;
  user: User;
}

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService
  ) {}

  async execute(data: LoginUserDto): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await this.passwordService.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    if (user.status === 'disabled') {
      throw new UserDisabledError();
    }

    const accessToken = this.jwtService.sign({ userId: user.id });

    return { accessToken, user };
  }
}
