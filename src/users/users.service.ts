import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { PAGE_SIZE } from 'src/utils/constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      email: createUserDto.email,
      password: hashedPassword,
    });
    return await this.usersRepository.save(user);
  }

  async findAll(page: number = 1): Promise<{
    total: number;
    data: User[];
    currentPage: number;
    totalPage: number;
  }> {
    const skip = (page - 1) * PAGE_SIZE;
    const [data, total] = await this.usersRepository.findAndCount({
      take: PAGE_SIZE,
      skip,
    });
    return {
      data,
      total,
      currentPage: page,
      totalPage: Math.ceil(total / PAGE_SIZE),
    };
  }

  async findByParams(queryParams: {
    id?: number;
    email?: string;
  }): Promise<User> {
    if (!queryParams.id && !queryParams.email) {
      throw new BadRequestException(
        'Pelo menos um parâmetro (id ou e-mail) deve ser fornecido',
      );
    }
    const user = await this.usersRepository.findOne({
      where: queryParams,
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.findByParams({ id });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    await this.usersRepository.update(id, updateUserDto);

    const { password, ...updatedUser } = user;
    return updatedUser;
  }

  async remove(id: number): Promise<string> {
    const user = await this.findByParams({ id });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    await this.usersRepository.delete(id);

    return `Usuário com ID ${id} foi deletado com sucesso!`;
  }
}
