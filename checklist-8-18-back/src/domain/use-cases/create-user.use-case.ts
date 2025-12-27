import { CreateUserDto } from 'src/api/dtos/create-user.dto';
import { User } from '../models/user.model';

type CreatedUser = Omit<User, 'passwordHash'>;

export abstract class CreateUserUseCase {
  abstract execute(dto: CreateUserDto): Promise<CreatedUser>;
}