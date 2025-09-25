import { Global, Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [
    JwtModule.register({
      global: true,
      privateKey: `${process.cwd()}/var/jwt/private.pem`,
      publicKey: `${process.cwd()}/var/jwt/private.pem`,
    }),
  ],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
