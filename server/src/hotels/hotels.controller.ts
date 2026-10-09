import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common'
import { ok } from '../common/api-result'
import { HotelsService } from './hotels.service'
import { HotelSearchQueryDto } from './hotel-search-query.dto'

@Controller('api/hotels')
export class HotelsController {
  constructor(private readonly hotels: HotelsService) {}

  @Get() async list() { return ok(await this.hotels.list()) }
  @Get('recommended') async recommended() { return ok(await this.hotels.recommended()) }
  @Get('search/paged') async searchPaged(@Query() query: HotelSearchQueryDto) { return ok(await this.hotels.searchPaged(query)) }
  @Get('search') async search(
    @Query('keyword') keyword?: string, @Query('area') area?: string,
    @Query('starLevel') starLevel?: string, @Query('minPrice') minPrice?: string, @Query('maxPrice') maxPrice?: string,
  ) { return ok(await this.hotels.search(keyword, area, numberOrUndefined(starLevel), numberOrUndefined(minPrice), numberOrUndefined(maxPrice))) }
  @Get(':id') async detail(@Param('id', ParseIntPipe) id: number) { return ok(await this.hotels.detail(id)) }
}

function numberOrUndefined(value: string | undefined): number | undefined {
  if (value === undefined || value === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}
