import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { User, UserRole } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
  const hashedPassword = await bcrypt.hash('defaultpassword', 10);

  const users = [
    {
      email: 'admin@example.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
    ...Array.from({ length: 100 }, (_, index) => ({
      email: `common${index}@example.com`,
      password: hashedPassword,
      role: UserRole.COMMON,
    })),
  ];

  for (const userData of users) {
    const userExists = await userRepository.findOneBy({
      email: userData.email,
    });
    if (!userExists) {
      const user = userRepository.create(userData);
      await userRepository.save(user);
    } else {
      console.log(`User ${userData.email} already exists.`);
    }
  }

  await app.close();
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
});
