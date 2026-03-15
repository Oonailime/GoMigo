import { Module } from '@nestjs/common';
import { CaronasController } from './caronas.controller';
import { CaronasService } from './caronas.service';

@Module({
  controllers: [CaronasController],
  providers: [CaronasService],
})
export class CaronasModule {}
