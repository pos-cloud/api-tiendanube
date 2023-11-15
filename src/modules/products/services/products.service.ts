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
    const { token, userID } =
      await this.databaseService.getCredentialsTiendaNube();
   // console.log(token, appID);
    const foundCollection = this.databaseService.getCollection('articles');

    const foundArticle = await this.databaseService.getDocumentById(
      'articles',
      productId,
    );
  //  console.log(foundArticle);

    if (
      !foundArticle ||
      foundArticle.operationType == 'D' ||
      (foundArticle.type as string).toLocaleLowerCase() != 'final'
    ){
      throw new BadRequestException(` Article with id ${productId} not found`);
    }

    const dataNewProductTiendaNube = {
      images: [
        {
          src: foundArticle.picture,
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
      token,
      userID,
    );

    const stockCollection =
      this.databaseService.getCollection('article-stocks');
    const stockFound = await stockCollection.findOne({
      operationType: { $ne: 'D' },
      article: new ObjectId(productId),
    });

    await this.tiendaNubeService.updateProductFirstVariant(
      token,
      userID,
      result.id,
      result.variants[0].id,
      {
        stock: stockFound && stockFound > 0 ? stockFound.realStock : 0,
        price: foundArticle.salePrice || null,
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
