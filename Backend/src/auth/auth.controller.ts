import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
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

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: { user: { email: string } }) {
    return this.authService.getProfile(req.user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(
    @Req() req: { user: { email: string } },
    @Body() body: CompleteProfileDto,
  ) {
    return this.authService.updateProfile(req.user.email, body);
  }
}
