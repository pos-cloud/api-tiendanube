import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { DatabaseService } from 'src/database/services/database.service';
import { TiendaNubeService } from 'src/services/tienda-nube/services/tienda-nube.service';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly tiendaNubeService: TiendaNubeService,
    private readonly httpService: HttpService,
  ) {}

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

    const foundCollection = this.databaseService.getCollection('categories');

    const foundCategory = await this.databaseService.getDocumentById(
      'categories',
      categoryId,
    );

    if (!foundCategory) {
      throw new BadRequestException(` Category with id${categoryId} not found`);
    }
    if (foundCategory.tiendaNubeId) {
      const foundCategoryTiendaMia = await this.tiendaNubeService.getCategoryId(
        foundCategory.tiendaNubeId,
        tiendaNubeAccesstoken,
        tiendaNubeUserId,
      );
      if (foundCategoryTiendaMia) {
        return foundCategoryTiendaMia;
      }
    }

    const categoryTiendaNube = await this.tiendaNubeService.createCategory(
      {
        name: {
          es: foundCategory.description,
        },
      },
      tiendaNubeAccesstoken,
      tiendaNubeUserId,
    );

    await foundCollection.updateOne(
      { _id: foundCategory._id },
      {
        $set: {
          tiendaNubeId: categoryTiendaNube.id,
        },
      },
    );

    return categoryTiendaNube;
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
