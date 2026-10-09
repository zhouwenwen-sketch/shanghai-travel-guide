import { IsUUID } from 'class-validator'

export class HomeViewDto {
  @IsUUID('4') eventId!: string
  @IsUUID('4') visitorId!: string
  @IsUUID('4') sessionId!: string
}
