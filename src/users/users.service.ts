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

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      email: createUserDto.email,
      password: hashedPassword,
    });
    const { password, ...createdUser } = await this.usersRepository.save(user);

    return createdUser;
  }

  async findAll(page: number = 1): Promise<{
    total: number;
    data: Omit<User, 'password'>[];
    currentPage: number;
    totalPage: number;
  }> {
    const skip = (page - 1) * PAGE_SIZE;
    const [data, total] = await this.usersRepository.findAndCount({
      take: PAGE_SIZE,
      skip,
    });
    return {
      data: data?.map(({ password, ...user }) => user),
      total,
      currentPage: page,
      totalPage: Math.ceil(total / PAGE_SIZE),
    };
  }

  async findByParams(queryParams: {
    id?: number;
    email?: string;
  }): Promise<Omit<User, 'password'>> {
    if (!queryParams.id && !queryParams.email) {
      throw new BadRequestException(
        'Pelo menos um parâmetro (id ou e-mail) deve ser fornecido',
      );
    }
    const { password, ...user } = await this.usersRepository.findOne({
      where: queryParams,
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    return user;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const updatedUser = await this.usersRepository.update(id, updateUserDto);
    if (!updatedUser) throw new NotFoundException('Usuário não encontrado');
    const user = await this.findByParams({ id });

    return user;
  }

  async remove(id: number): Promise<string> {
    const user = await this.findByParams({ id });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    await this.usersRepository.delete(id);
    return `Usuário com ID ${id} foi deletado com sucesso!`;
  }
}
