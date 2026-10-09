import { Body, Controller, Delete, ForbiddenException, Get, Headers, Param, ParseIntPipe, Post, Put, Query, UnauthorizedException } from '@nestjs/common'
import { ok } from '../common/api-result'
import { UsersService } from '../users/users.service'
import { PoisService } from './pois.service'

@Controller('api/admin/pois')
export class AdminPoisController {
  constructor(private readonly users:UsersService,private readonly pois:PoisService){}
  @Get() async list(@Headers('authorization') a:string|undefined,@Query('keyword') k?:string,@Query('type') t?:string,@Query('area') r?:string,@Query('page') p?:string,@Query('size') s?:string){await this.admin(a);return ok(await this.pois.searchAdmin(k,t,r,Number(p??0),Number(s??20)))}
  @Post() async create(@Headers('authorization') a:string|undefined,@Body() b:any){await this.admin(a);return ok(await this.pois.create(b))}
  @Put(':id') async update(@Headers('authorization') a:string|undefined,@Param('id',ParseIntPipe) id:number,@Body() b:any,@Headers('if-match') h?:string){await this.admin(a);return ok(await this.pois.update(id,b,h))}
  @Delete(':id') async remove(@Headers('authorization') a:string|undefined,@Headers('if-match') h:string|undefined,@Param('id',ParseIntPipe) id:number){await this.admin(a);return ok(await this.pois.deactivate(id,h))}
  private async admin(a?:string){const t=a?.match(/^Bearer\s+(.+)$/i)?.[1];if(!t)throw new UnauthorizedException('未登录或登录已过期');if((await this.users.requireUser(t)).role!=='ADMIN')throw new ForbiddenException('无权限访问')}
}
