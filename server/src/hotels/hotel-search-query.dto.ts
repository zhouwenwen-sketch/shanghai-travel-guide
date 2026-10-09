import { Transform } from 'class-transformer'
import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'

export const HOTEL_PAGE_SIZES = [6, 12, 24] as const
export const HOTEL_SORTS = ['idAsc', 'priceAsc', 'priceDesc', 'ratingDesc'] as const
export const PRICE_BANDS = ['under150', '150to299', '300to449', '450to599', '600plus'] as const

const numberValue = ({ value }: { value: unknown }): unknown => {
  if (value === undefined) return undefined
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return Number.NaN
  return Number(value)
}
const csv = ({ value }: { value: unknown }): unknown => {
  if (value === undefined || value === '') return undefined
  const source = Array.isArray(value) ? value : [value]
  return source.flatMap((entry) => String(entry).split(',')).map((entry) => entry.trim()).filter(Boolean)
}

export class HotelSearchQueryDto {
  @IsOptional() @IsString() @MaxLength(100) keyword?: string
  @IsOptional() @Transform(csv) @IsArray() @ArrayMinSize(1) @ArrayMaxSize(10) @IsString({ each: true }) @MaxLength(50, { each: true }) areas?: string[]
  @IsOptional() @Transform(csv) @IsArray() @ArrayMinSize(1) @ArrayMaxSize(4) @IsIn(['2', '3', '4', '5'], { each: true }) starLevels?: string[]
  @IsOptional() @Transform(csv) @IsArray() @ArrayMinSize(1) @ArrayMaxSize(5) @IsIn(PRICE_BANDS, { each: true }) priceBands?: string[]
  @IsOptional() @Transform(numberValue) @IsInt() @Min(0) @Max(10_000) page = 0
  @IsOptional() @Transform(numberValue) @IsInt() @IsIn(HOTEL_PAGE_SIZES) size = 6
  @IsOptional() @IsIn(HOTEL_SORTS) sort: typeof HOTEL_SORTS[number] = 'idAsc'
}
