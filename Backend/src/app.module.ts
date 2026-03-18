import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { EnderecosModule } from './enderecos/enderecos.module';
import { VeiculosModule } from './veiculos/veiculos.module';
import { PacotesModule } from './pacotes/pacotes.module';
import { SolicitacoesModule } from './solicitacoes/solicitacoes.module';
import { HospedagensModule } from './hospedagens/hospedagens.module';
import { CaronasModule } from './caronas/caronas.module';
import { AvaliacoesModule } from './avaliacoes/avaliacoes.module';
import { AnunciosModule } from './anuncios/anuncios.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    EnderecosModule,
    VeiculosModule,
    PacotesModule,
    SolicitacoesModule,
    HospedagensModule,
    CaronasModule,
    AvaliacoesModule,
    AnunciosModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
