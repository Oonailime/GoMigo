import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { JwtAuthGuard } from './jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  async google(@Body() body: { idToken: string }) {
    return this.authService.handleGoogleLogin(body.idToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('complete-profile')
  async completeProfile(
    @Req() req: { user: { email: string; name?: string | null } },
    @Body() body: CompleteProfileDto,
  ) {
    return this.authService.completeProfile(req.user.email, req.user.name ?? null, body);
  }
}
