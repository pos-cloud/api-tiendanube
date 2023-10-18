import { Injectable } from '@nestjs/common';
import { CreateTiendaNubeDto } from '../dto/create-tienda-nube.dto';
import { UpdateTiendaNubeDto } from '../dto/update-tienda-nube.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateCategoryTiendaNubeDto } from '../dto/create-category-tienda-nube.dto';

@Injectable()
export class TiendaNubeService {
  private tiendaNubeUrI = process.env.TIENDA_NUBE_URI;
  constructor(private readonly httpService: HttpService) {}
  async createCategory(createTiendaNubeDto: CreateCategoryTiendaNubeDto) {
    // const { data: userFacebook }: any = await firstValueFrom(
    //   this.httpService.get(apiUrl),
    // );

    return 'This action adds a new tiendaNube';
  }

  findAll() {
    return `This action returns all tiendaNube`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tiendaNube`;
  }

  update(id: number, updateTiendaNubeDto: UpdateTiendaNubeDto) {
    return `This action updates a #${id} tiendaNube`;
  }

  remove(id: number) {
    return `This action removes a #${id} tiendaNube`;
  }
}
