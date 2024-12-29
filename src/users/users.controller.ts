import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './entities/user.entity';

@ApiTags('Usuários')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiResponse({ status: 200 })
  findAll(@Query('page') page: string) {
    return this.usersService.findAll(Number(page));
  }

  @Get('find')
  @ApiResponse({ status: 200 })
  @ApiQuery({ name: 'id', required: false, type: Number })
  @ApiQuery({ name: 'email', required: false, type: String })
  async findByParams(
    @Query('id') id?: number,
    @Query('email') email?: string,
  ): Promise<User | null> {
    return this.usersService.findByParams({ id, email });
  }

  @Patch(':id')
  @ApiResponse({ status: 200 })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiResponse({
    status: 204,
    description: 'Usuário foi deletado com sucesso!',
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
