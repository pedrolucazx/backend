import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { SignInDto } from './dto/signIn.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async signIn(signInDto: SignInDto): Promise<{ access_token: string }> {
    const user = await this.usersRepository.findOne({
      where: { email: signInDto?.email },
    });

    const isValidPassword = await bcrypt.compare(
      signInDto?.password,
      user?.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user?.id, username: user?.email, role: user?.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async resetPassword(email: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    const newPassword = randomBytes(8).toString('hex');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await this.usersRepository.save(user);

    await this.mailerService.sendMail({
      from: 'Pedro Mesquita <pedrolucazxmesquita@gmail.com>',
      to: email,
      subject: 'Reset de Senha',
      text: `Sua nova senha é: ${newPassword}`,
    });
  }
}
