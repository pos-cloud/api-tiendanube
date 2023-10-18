import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { DatabaseService } from 'src/database/services/database.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(
    // createCategoryDto: CreateCategoryDto,
    database: string,
    categoryId: string,
  ) {
    if (!database) {
      throw new BadRequestException(`Database is required `);
    }
    await this.databaseService.initConnection(database);
    const { tiendaNubeAccesstoken, tiendaNubeUserId } =
      await this.databaseService.getCredentialsTiendaNube();

    const foundCategory = await this.databaseService.getDocumentById(
      'categories',
      categoryId,
    );

    console.log(foundCategory);

    return 'This action adds a new category';
  }

  findAll() {
    return `This action returns all categories`;
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
