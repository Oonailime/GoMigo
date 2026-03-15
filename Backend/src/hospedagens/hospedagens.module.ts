import { Module } from '@nestjs/common';
import { HospedagensController } from './hospedagens.controller';
import { HospedagensService } from './hospedagens.service';

@Module({
  controllers: [HospedagensController],
  providers: [HospedagensService],
})
export class HospedagensModule {}
