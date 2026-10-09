import { BadRequestException, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query } from '@nestjs/common'
import { ok } from '../common/api-result'
import { PoisService } from './pois.service'

@Controller('api/pois')
export class PoisController {
  constructor(private readonly pois: PoisService) {}

  @Get()
  async search(@Query('keyword') keyword?: string, @Query('type') type?: string, @Query('area') area?: string,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page = 0,
    @Query('size', new DefaultValuePipe(20), ParseIntPipe) size = 20,
  ) {
    if (page < 0 || size < 1 || size > 50) throw new BadRequestException('分页参数无效')
    return ok(await this.pois.search(keyword, type, area, page, size))
  }

  @Get(':id') async detail(@Param('id', ParseIntPipe) id: number) { return ok(await this.pois.detail(id)) }
}
