import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class SeedService {
  constructor(
    private productsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async runSeed() {
    await this.deleteTables();
    const userAdmin = await this.insertUsers();
    await this.insertNewProducts(userAdmin);
    return 'SEED EXECUTED';
  }

  private async deleteTables() {
    await this.productsService.deletAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
  }

  private async insertUsers() {
    const seedUsers = initialData.users;
    const users: User[] = [];

    seedUsers.forEach((user) => {
      users.push(this.userRepository.create(user));
    });

    const usersBD = await this.userRepository.save(seedUsers);

    return usersBD[0];
  }

  private async insertNewProducts(user: User) {
    await this.productsService.deletAllProducts();
    const products = initialData.products;
    const insertPromises = [];

    products.forEach((product) => {
      insertPromises.push(this.productsService.create(product, user));
      // this.productsService.create(product)
    });

    await Promise.all(insertPromises);

    return true;
  }
}
