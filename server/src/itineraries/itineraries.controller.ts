import { Body, Controller, Delete, Get, Headers, Param, ParseIntPipe, Post, Put, UnauthorizedException } from '@nestjs/common'
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Length, Matches, Max, Min } from 'class-validator'
import { ok } from '../common/api-result'
import { UsersService } from '../users/users.service'
import { ItinerariesService } from './itineraries.service'

class ItineraryRequest { @IsString() @IsNotEmpty() @Length(1, 100) title!: string; @Matches(/^\d{4}-\d{2}-\d{2}$/) startDate!: string; @Matches(/^\d{4}-\d{2}-\d{2}$/) endDate!: string }
class ItemRequest { @Matches(/^\d{4}-\d{2}-\d{2}$/) itemDate!: string; @IsIn(['HOTEL','ATTRACTION','RESTAURANT','ACTIVITY','NOTE']) type!: string; @IsOptional() @Matches(/^\d{2}:\d{2}(?::\d{2})?$/) startTime?: string; @IsOptional() @Matches(/^\d{2}:\d{2}(?::\d{2})?$/) endTime?: string; @IsString() @IsNotEmpty() @Length(1,120) title!: string; @IsOptional() @IsString() @Length(0,200) location?: string; @IsOptional() @IsString() @Length(0,2000) notes?: string; @IsInt() @Min(0) @Max(10000) sortOrder!: number; @IsOptional() @IsInt() @Min(1) hotelId?: number; @IsOptional() @IsInt() @Min(1) poiId?: number }

@Controller('api/itineraries')
export class ItinerariesController {
  constructor(private readonly users: UsersService, private readonly service: ItinerariesService) {}
  @Get() async list(@Headers('authorization') a?: string) { return ok(await this.service.list(await this.user(a))) }
  @Get(':id') async get(@Headers('authorization') a: string|undefined,@Param('id',ParseIntPipe) id:number){return ok(await this.service.get(await this.user(a),id))}
  @Post() async create(@Headers('authorization') a:string|undefined,@Body() b:ItineraryRequest){return ok(await this.service.create(await this.user(a),b))}
  @Put(':id') async update(@Headers('authorization') a:string|undefined,@Headers('if-match') v:string|undefined,@Param('id',ParseIntPipe) id:number,@Body() b:ItineraryRequest){return ok(await this.service.update(await this.user(a),id,v,b))}
  @Delete(':id') async remove(@Headers('authorization') a:string|undefined,@Headers('if-match') v:string|undefined,@Param('id',ParseIntPipe) id:number){await this.service.remove(await this.user(a),id,v);return ok()}
  @Post(':id/items') async add(@Headers('authorization') a:string|undefined,@Headers('if-match') v:string|undefined,@Param('id',ParseIntPipe) id:number,@Body() b:ItemRequest){return ok(await this.service.addItem(await this.user(a),id,v,b))}
  @Put(':id/items/:itemId') async updateItem(@Headers('authorization') a:string|undefined,@Headers('if-match') v:string|undefined,@Param('id',ParseIntPipe) id:number,@Param('itemId',ParseIntPipe) itemId:number,@Body() b:ItemRequest){return ok(await this.service.updateItem(await this.user(a),id,itemId,v,b))}
  @Delete(':id/items/:itemId') async deleteItem(@Headers('authorization') a:string|undefined,@Headers('if-match') v:string|undefined,@Param('id',ParseIntPipe) id:number,@Param('itemId',ParseIntPipe) itemId:number){return ok(await this.service.deleteItem(await this.user(a),id,itemId,v))}
  private async user(a?:string){const t=a?.match(/^Bearer\s+(.+)$/i)?.[1];if(!t)throw new UnauthorizedException('未登录或登录已过期');return this.users.requireUserId(t)}
}
