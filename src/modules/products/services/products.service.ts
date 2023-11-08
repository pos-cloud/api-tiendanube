import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { DatabaseService } from 'src/database/services/database.service';
import { TiendaNubeService } from 'src/services/tienda-nube/services/tienda-nube.service';
import { CategoriesService } from 'src/modules/categories/services/categories.service';
import { VariantProduct } from './variant.service';
import { CreateProductTiendaNubeDTO } from 'src/services/tienda-nube/dto/create-product-tienda-nube.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class ProductsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly tiendaNubeService: TiendaNubeService,
    private readonly categoryService: CategoriesService,
    private readonly productVariantService: VariantProduct,
  ) {}

  async create(database: string, productId: string) {
    if (!database) {
      throw new BadRequestException(`Database is required `);
    }
    await this.databaseService.initConnection(database);
    const { tiendaNubeAccesstoken, tiendaNubeUserId } =
      await this.databaseService.getCredentialsTiendaNube();
    console.log(tiendaNubeAccesstoken, tiendaNubeUserId);
    const foundCollection = this.databaseService.getCollection('articles');

    const foundArticle = await this.databaseService.getDocumentById(
      'articles',
      productId,
    );
    // console.log(foundArticle);

    if (
      !foundArticle ||
      foundArticle.operationType == 'D' ||
      (foundArticle.type as string).toLocaleLowerCase() != 'final'
    ) {
      throw new BadRequestException(` Article with id${productId} not found`);
    }

    const dataNewProductTiendaNube = {
      images: [
        {
          src: 'https://media.licdn.com/dms/image/D4D10AQH5CkhbZ0M2WQ/image-shrink_800/0/1690462780381/EMEA-State-Mobile-Exp_1200x628_CTA02png?e=1700010000&v=beta&t=Dh-QsGta5tPYthTEE2WSwK6QZU68AT_AYbFOers3GXE',
        },
      ],
      name: {
        es: foundArticle.description,
      },
    };

    const resultVariantName =
      await this.productVariantService.getProductVariantsPropertyNames(
        foundArticle._id,
      );
    dataNewProductTiendaNube['attributes'] = resultVariantName.map((e) => ({
      es: e,
    }));

    if (foundArticle.category) {
      const foundCategory = this.categoryService.findOneCategoryDb(
        foundArticle.category,
      );
      const foundCategoryTiendaMia = await this.categoryService.create(
        database,
        foundArticle.category,
      );

      if (foundCategoryTiendaMia) {
        dataNewProductTiendaNube['categories'] = [foundCategoryTiendaMia.id];
      }
    }
    const result = await this.tiendaNubeService.createProduct(
      dataNewProductTiendaNube as CreateProductTiendaNubeDTO,
      tiendaNubeAccesstoken,
      tiendaNubeUserId,
    );

    const stockCollection =
      this.databaseService.getCollection('article-stocks');
    const stockFound = await stockCollection.findOne({
      operationType: { $ne: 'D' },
      article: new ObjectId(productId),
    });
    console.log('object');
    console.log(stockFound);

    await this.tiendaNubeService.updateProductFirstVariant(
      tiendaNubeAccesstoken,
      tiendaNubeUserId,
      result.id,
      result.variants[0].id,
      {
        stock: stockFound.realStock,
        price: foundArticle.salePrice,
      },
    );

    return result;
  }

  findAll() {
    return `This action returns all products`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
