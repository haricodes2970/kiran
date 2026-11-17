import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateAddressDto, UpdateProfileDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('customer-profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('me')
export class ProfileController {
  constructor(private readonly authService: AuthService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get authenticated customer profile' })
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getMe(user.id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update authenticated customer profile' })
  updateProfile(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(user.id, dto);
  }

  @Get('addresses')
  @ApiOperation({ summary: 'List own saved addresses' })
  listAddresses(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.listAddresses(user.id);
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Add a new address to own profile' })
  addAddress(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateAddressDto) {
    return this.authService.addAddress(user.id, dto);
  }

  @Delete('addresses/:id')
  @ApiOperation({ summary: 'Delete own address' })
  deleteAddress(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.authService.deleteAddress(user.id, id);
  }
}
