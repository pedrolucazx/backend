import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/users/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('Usuários')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'password'>> {
    return await this.usersService.create(createUserDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página para paginação',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso.',
  })
  @ApiBearerAuth('JWT-auth')
  async findAll(@Query('page') page: string = '1'): Promise<{
    total: number;
    data: Omit<User, 'password'>[];
    currentPage: number;
    totalPage: number;
  }> {
    const pageNumber = Number(page);
    return await this.usersService.findAll(pageNumber);
  }

  @UseGuards(AuthGuard)
  @Get('find')
  @ApiQuery({ name: 'id', required: false, description: 'ID do usuário' })
  @ApiQuery({ name: 'email', required: false, description: 'Email do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado.' })
  @ApiResponse({
    status: 400,
    description: 'Parâmetros inválidos, forneça pelo menos id ou email.',
  })
  @ApiBearerAuth('JWT-auth')
  async findByParams(
    @Query('id') id?: number,
    @Query('email') email?: string,
  ): Promise<Omit<User, 'password'>> {
    return await this.usersService.findByParams({ id, email });
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    return await this.usersService.update(+id, updateUserDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiResponse({ status: 204, description: 'Usuário deletado com sucesso!' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @ApiBearerAuth('JWT-auth')
  async remove(@Param('id') id: string): Promise<string> {
    return await this.usersService.remove(+id);
  }
}
