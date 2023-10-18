import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TiendaNubeService } from './services/tienda-nube.service';
// import { TiendaNubeController } from './tienda-nube.controller';

@Module({
  // controllers: [TiendaNubeController],
  imports: [HttpModule],
  providers: [TiendaNubeService],
})
export class TiendaNubeModule {}
