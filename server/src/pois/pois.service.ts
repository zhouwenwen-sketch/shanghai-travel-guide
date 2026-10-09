import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '../generated/prisma/client'
import { asSafeNumber } from '../common/json-codec'
import { DatabaseService } from '../database/database.service'

const validTypes = new Set(['ATTRACTION', 'RESTAURANT', 'BUSINESS_DISTRICT'])
const include = { poi_tags: { select: { tag: true } } } as const

@Injectable()
export class PoisService {
  constructor(private readonly db: DatabaseService) {}

  async search(keyword: string | undefined, type: string | undefined, area: string | undefined, page: number, size: number) {
    if (type && !validTypes.has(type)) throw new BadRequestException('景点类型无效')
    const filters: Prisma.poisWhereInput[] = [{ active: true }]
    if (keyword?.trim()) filters.push({ OR: [{ name: { contains: keyword.trim() } }, { description: { contains: keyword.trim() } }, { address: { contains: keyword.trim() } }] })
    if (type) filters.push({ type })
    if (area?.trim()) filters.push({ area: area.trim() })
    const where = { AND: filters }
    const [totalElements, records] = await this.db.$transaction([
      this.db.pois.count({ where }),
      this.db.pois.findMany({ where, include, orderBy: [{ recommended: 'desc' }, { rating: 'desc' }, { id: 'asc' }], skip: page * size, take: size }),
    ])
    return { items: records.map(toResponse), page, size, totalElements, totalPages: Math.ceil(totalElements / size) }
  }

  async detail(id: number) {
    const poi = await this.db.pois.findFirst({ where: { id: BigInt(id), active: true }, include })
    if (!poi) throw new NotFoundException('POI 不存在')
    return toResponse(poi)
  }
  async searchAdmin(keyword:string|undefined,type:string|undefined,area:string|undefined,page:number,size:number){
    if(!Number.isInteger(page)||page<0||!Number.isInteger(size)||size<1||size>50)throw new BadRequestException('分页参数无效')
    if(type&&!validTypes.has(type))throw new BadRequestException('景点类型无效')
    const where:any={AND:[keyword?.trim()?{OR:[{name:{contains:keyword.trim()}},{description:{contains:keyword.trim()}},{address:{contains:keyword.trim()}}]}:{},type?{type}:{},area?.trim()?{area:area.trim()}:{}]}
    const [totalElements,records]=await this.db.$transaction([this.db.pois.count({where}),this.db.pois.findMany({where,include,orderBy:[{recommended:'desc'},{rating:'desc'},{id:'asc'}],skip:page*size,take:size})]);return {items:records.map(toResponse),page,size,totalElements,totalPages:Math.ceil(totalElements/size)}
  }
  async create(b:any){const {tags,...data}=this.poiData(b);const poi=await this.db.pois.create({data:{...data,version:0,poi_tags:{create:tags.map((tag:string)=>({tag}))}},include});return toResponse(poi)}
  async update(id:number,b:any,h?:string){const {tags,...data}=this.poiData(b);const bodyVersion=b.version===undefined?undefined:versionValue(b.version);const headerVersion=h===undefined?undefined:headerVersionValue(h);if(bodyVersion!==undefined&&headerVersion!==undefined&&bodyVersion!==headerVersion)throw new BadRequestException('If-Match 与 version 不一致');const expected=headerVersion??bodyVersion;const old=await this.db.pois.findUnique({where:{id:BigInt(id)}});if(!old)throw new NotFoundException('POI 不存在');if(expected===undefined||BigInt(expected)!==old.version)throw new ConflictException('POI 已被更新，请刷新后重试');const changed=await this.db.$transaction(async tx=>{const r=await tx.pois.updateMany({where:{id:old.id,version:old.version},data:{...data,version:{increment:1}}});if(!r.count)throw new ConflictException('POI 已被更新，请刷新后重试');await tx.poi_tags.deleteMany({where:{poi_id:old.id}});await tx.poi_tags.createMany({data:tags.map((tag:string)=>({poi_id:old.id,tag}))});return tx.pois.findUniqueOrThrow({where:{id:old.id},include})});return toResponse(changed)}
  async deactivate(id:number,h:string|undefined){if(h===undefined)throw new BadRequestException('If-Match 必须是非负版本号');const expected=headerVersionValue(h);const old=await this.db.pois.findUnique({where:{id:BigInt(id)}});if(!old)throw new NotFoundException('POI 不存在');if(old.version!==BigInt(expected))throw new ConflictException('POI 已被更新，请刷新后重试');const r=await this.db.pois.updateMany({where:{id:old.id,version:old.version},data:{active:false,version:{increment:1}}});if(!r.count)throw new ConflictException('POI 已被更新，请刷新后重试');return this.detailAdmin(id)}
  private async detailAdmin(id:number){const p=await this.db.pois.findUnique({where:{id:BigInt(id)},include});if(!p)throw new NotFoundException('POI 不存在');return toResponse(p)}
  private poiData(b:any):any{
    if(!b||typeof b!=='object'||Array.isArray(b)||!validTypes.has(b.type)||typeof b.recommended!=='boolean'||typeof b.active!=='boolean')throw new BadRequestException('POI 参数无效')
    const name=textValue(b.name,120,true),area=textValue(b.area,50,true),address=textValue(b.address,200,true)
    const latitude=decimalValue(b.latitude,-90,90,7),longitude=decimalValue(b.longitude,-180,180,7)
    const ticketPrice=b.ticketPrice==null?null:decimalValue(b.ticketPrice,0,99999999.99,2)
    const averagePrice=b.averagePrice==null?null:decimalValue(b.averagePrice,0,99999999.99,2)
    const rating=b.rating==null?null:decimalValue(b.rating,0,5,1)
    const duration=b.suggestedDurationMinutes
    if(duration!=null&&(!Number.isInteger(duration)||duration<1||duration>1440))throw new BadRequestException('建议时长必须是1到1440之间的整数')
    const rawTags=b.tags??[]
    if(!Array.isArray(rawTags)||rawTags.length>10)throw new BadRequestException('标签参数无效')
    const tags=[...new Set(rawTags.map((tag:unknown)=>textValue(tag,50,true) as string))]
    return {name,type:b.type,area,address,latitude,longitude,opening_hours:textValue(b.openingHours,200),ticket_price:ticketPrice,average_price:averagePrice,suggested_duration_minutes:duration??null,description:textValue(b.description,5000),image_url:textValue(b.imageUrl,500),rating,recommended:b.recommended,active:b.active,tags}
  }
}

function textValue(value:unknown,max:number,required=false):string|null{
  if(value==null&&!required)return null
  if(typeof value!=='string'||value.length>max||(required&&!value.trim()))throw new BadRequestException('POI 文本或标签参数无效')
  return value.trim()||null
}
function decimalValue(value:unknown,min:number,max:number,scale:number):Prisma.Decimal{
  if((typeof value!=='number'&&typeof value!=='string')||(typeof value==='string'&&!value.trim()))throw new BadRequestException('POI 数值参数无效')
  let parsed:Prisma.Decimal
  try{parsed=new Prisma.Decimal(value)}catch{throw new BadRequestException('POI 数值参数无效')}
  if(!parsed.isFinite()||parsed.lt(min)||parsed.gt(max)||parsed.decimalPlaces()>scale)throw new BadRequestException('POI 数值范围或精度无效')
  return parsed
}
function versionValue(value:unknown):number{
  if(typeof value!=='number'&&(typeof value!=='string'||!/^\d+$/.test(value)))throw new BadRequestException('version 必须是非负安全整数')
  const parsed=Number(value)
  if(!Number.isSafeInteger(parsed)||parsed<0)throw new BadRequestException('version 必须是非负安全整数')
  return parsed
}
function headerVersionValue(value:string):number{
  const m=value.trim().match(/^(?:W\/)?"(\d+)"$|^(\d+)$/)
  if(!m)throw new BadRequestException('If-Match 必须是非负版本号')
  return versionValue(m[1]??m[2])
}

function toResponse(poi: Prisma.poisGetPayload<{ include: typeof include }>) {
  return {
    id: asSafeNumber(poi.id), name: poi.name, type: poi.type, area: poi.area, address: poi.address,
    latitude: poi.latitude.toNumber(), longitude: poi.longitude.toNumber(), openingHours: poi.opening_hours,
    ticketPrice: poi.ticket_price?.toNumber() ?? null, averagePrice: poi.average_price?.toNumber() ?? null,
    suggestedDurationMinutes: poi.suggested_duration_minutes, description: poi.description, imageUrl: poi.image_url,
    rating: poi.rating?.toNumber() ?? null, recommended: poi.recommended, active: poi.active,
    tags: poi.poi_tags.map(({ tag }) => tag), version: asSafeNumber(poi.version),
  }
}
