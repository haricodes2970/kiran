import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RoleName, AuthProvider } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  RegisterDto,
  LoginDto,
  RequestOtpDto,
  VerifyOtpDto,
  UpdateProfileDto,
  CreateAddressDto,
} from './dto/auth.dto';
import { sanitizeUser } from '../../common/utils/serializer.util';

@Injectable()
export class AuthService {
  private readonly otpStore = new Map<string, { code: string; expiresAt: number; attempts: number }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
  ) {}

  private async ensureRole(roleName: RoleName) {
    let role = await this.prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      role = await this.prisma.role.create({
        data: { name: roleName, description: `${roleName} role` },
      });
    }
    return role;
  }

  private signUserToken(user: { id: string; email: string; name: string; roles: RoleName[] }) {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
    });
  }

  async register(dto: RegisterDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    if (dto.phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone: dto.phone.trim() },
      });
      if (existingPhone) {
        throw new ConflictException('Phone number is already registered');
      }
    }

    const customerRole = await this.ensureRole(RoleName.CUSTOMER);
    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email: normalizedEmail,
        phone: dto.phone?.trim() || null,
        passwordHash,
        authProvider: AuthProvider.LOCAL,
        userRoles: {
          create: [{ roleId: customerRole.id }],
        },
        customerProfile: {
          create: {},
        },
      },
      include: {
        userRoles: { include: { role: true } },
        customerProfile: true,
      },
    });

    const sanitized = sanitizeUser(user);
    const accessToken = this.signUserToken({
      id: user.id,
      email: user.email,
      name: user.name,
      roles: sanitized.roles,
    });

    return {
      user: sanitized,
      accessToken,
    };
  }

  async login(dto: LoginDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        userRoles: { include: { role: true } },
        customerProfile: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is suspended or inactive');
    }

    const sanitized = sanitizeUser(user);
    const accessToken = this.signUserToken({
      id: user.id,
      email: user.email,
      name: user.name,
      roles: sanitized.roles,
    });

    return {
      user: sanitized,
      accessToken,
    };
  }

  async requestOtp(dto: RequestOtpDto) {
    const phone = dto.phone.trim();
    const isDemo = process.env.DEMO_MODE !== 'false';
    const code = isDemo ? '123456' : String(Math.floor(100000 + Math.random() * 900000));
    this.otpStore.set(phone, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0,
    });

    return {
      sent: true,
      phone,
      provider: process.env.OTP_PROVIDER || 'mock-demo-boundary',
      expiresInSeconds: 300,
      ...(isDemo ? { demoHint: 'Use OTP 123456 in Demo Mode' } : {}),
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const phone = dto.phone.trim();
    const record = this.otpStore.get(phone);
    if (!record || record.expiresAt < Date.now()) {
      throw new UnauthorizedException('OTP has expired or was not requested');
    }
    record.attempts += 1;
    if (record.attempts > 5) {
      this.otpStore.delete(phone);
      throw new UnauthorizedException('Maximum OTP verification attempts exceeded');
    }
    if (record.code !== dto.otp.trim()) {
      throw new UnauthorizedException('Invalid OTP code');
    }
    this.otpStore.delete(phone);

    let user = await this.prisma.user.findUnique({
      where: { phone },
      include: {
        userRoles: { include: { role: true } },
        customerProfile: true,
      },
    });

    if (!user) {
      const customerRole = await this.ensureRole(RoleName.CUSTOMER);
      const safeDigits = phone.replace(/[^0-9]/g, '');
      user = await this.prisma.user.create({
        data: {
          name: dto.name?.trim() || `Customer ${safeDigits.slice(-4)}`,
          email: `mobile.${safeDigits}@kiransinfotech.local`,
          phone,
          authProvider: AuthProvider.OTP,
          userRoles: { create: [{ roleId: customerRole.id }] },
          customerProfile: { create: {} },
        },
        include: {
          userRoles: { include: { role: true } },
          customerProfile: true,
        },
      });
    }

    const sanitized = sanitizeUser(user);
    const accessToken = this.signUserToken({
      id: user.id,
      email: user.email,
      name: user.name,
      roles: sanitized.roles,
    });

    return {
      user: sanitized,
      accessToken,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: { include: { role: true } },
        customerProfile: true,
        addresses: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return sanitizeUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (dto.phone) {
      const conflict = await this.prisma.user.findFirst({
        where: { phone: dto.phone.trim(), NOT: { id: userId } },
      });
      if (conflict) {
        throw new ConflictException('Phone number already linked to another account');
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone.trim() || null } : {}),
        customerProfile: {
          upsert: {
            create: {
              companyName: dto.companyName ?? null,
              gstNumber: dto.gstNumber ?? null,
              alternatePhone: dto.alternatePhone ?? null,
            },
            update: {
              ...(dto.companyName !== undefined ? { companyName: dto.companyName } : {}),
              ...(dto.gstNumber !== undefined ? { gstNumber: dto.gstNumber } : {}),
              ...(dto.alternatePhone !== undefined ? { alternatePhone: dto.alternatePhone } : {}),
            },
          },
        },
      },
      include: {
        userRoles: { include: { role: true } },
        customerProfile: true,
        addresses: true,
      },
    });

    return sanitizeUser(user);
  }

  async listAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async addAddress(userId: string, dto: CreateAddressDto) {
    const count = await this.prisma.address.count({ where: { userId } });
    return this.prisma.address.create({
      data: {
        userId,
        label: dto.label || 'Home',
        recipient: dto.recipient,
        phone: dto.phone,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country || 'India',
        isDefault: count === 0,
      },
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const addr = await this.prisma.address.findUnique({ where: { id: addressId } });
    if (!addr || addr.userId !== userId) {
      throw new NotFoundException('Address not found');
    }
    await this.prisma.address.delete({ where: { id: addressId } });
    return { deleted: true };
  }

  async bootstrapAdmin(dto: RegisterDto & { bootstrapToken: string }) {
    const configuredToken = process.env.ADMIN_BOOTSTRAP_TOKEN;
    if (!configuredToken || dto.bootstrapToken !== configuredToken) {
      throw new UnauthorizedException('Invalid or unconfigured admin bootstrap token');
    }

    const existingAdmins = await this.prisma.userRole.count({
      where: { role: { name: RoleName.ADMIN } },
    });
    if (existingAdmins > 0) {
      throw new BadRequestException('An administrator account already exists');
    }

    const [adminRole, customerRole] = await Promise.all([
      this.ensureRole(RoleName.ADMIN),
      this.ensureRole(RoleName.CUSTOMER),
    ]);

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const admin = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.trim().toLowerCase(),
        phone: dto.phone?.trim() || null,
        passwordHash,
        userRoles: {
          create: [{ roleId: adminRole.id }, { roleId: customerRole.id }],
        },
      },
      include: { userRoles: { include: { role: true } } },
    });

    await this.auditService.log({
      actorId: admin.id,
      action: 'ADMIN_BOOTSTRAPPED',
      entityType: 'User',
      entityId: admin.id,
    });

    const sanitized = sanitizeUser(admin);
    return {
      user: sanitized,
      accessToken: this.signUserToken({
        id: admin.id,
        email: admin.email,
        name: admin.name,
        roles: sanitized.roles,
      }),
    };
  }
}
