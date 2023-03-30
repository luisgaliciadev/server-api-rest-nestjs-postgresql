import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsJWT } from 'class-validator';
import { Column } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';

export class LoginResponse extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: 'User token authentication',
  })
  @IsJWT()
  @Column('text')
  token: string;
}
