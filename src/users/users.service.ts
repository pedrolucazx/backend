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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create({
      email: createUserDto?.email,
      password: await bcrypt.hash(createUserDto?.password, 10),
    });
    return await this.usersRepository.save(user);
  }

  async findAll(page: number = 1): Promise<{
    total: number;
    data: User[];
    currentPage: number;
    totalPage: number;
  }> {
    const take = 10;
    const skip = (page - 1) * take;
    const [data, total] = await this.usersRepository.findAndCount({
      take,
      skip,
    });
    return {
      data,
      total,
      currentPage: page,
      totalPage: Math.ceil(total / take),
    };
  }

  async findByParams(queryParams: {
    id?: number;
    email?: string;
  }): Promise<User | null> {
    if (queryParams?.id == null && queryParams?.email == null) {
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
    const updated = await this.usersRepository.update(id, updateUserDto);

    if (!updated) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const { email, role, createdAt, updatedAt } = await this.findByParams({
      id,
    });

    return { id, email, role, createdAt, updatedAt };
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
