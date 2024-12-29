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

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
