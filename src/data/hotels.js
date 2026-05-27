/**
 * 酒店 mock 数据
 * recommended: true  → 首页推荐展示
 * starLevel: 5=五星/钻  4=四星/钻  3=三星/钻  2=二星及以下
 * area: 所属区域（匹配 topfilter 筛选）
 * priceLevel: 价格区间标识 low/mid/high/luxury
 */
export const hotels = [
  // ==================== 首页推荐（4 家） ====================
  {
    id: 1, name: '上海和平饭店', recommended: true, starLevel: 5,
    img_url: './images/1.jpg',
    banner_url: 'banner-1.jpg', starimg_url: 'star5.png',
    transport: '外滩地区·外滩街道南京东路20号', phone: '021-63216888',
    area: '外滩', priceLevel: 'luxury', price: 2099,
    description: '始建于1929年，上海最具代表性的历史建筑之一，融合装饰艺术风格与现代奢华，拥有270间客房。',
    tag: ['SPA', '室内游泳池', '西餐厅', '接机', '行李寄存', '礼宾服务', 'VIP通道'],
    rating: 4.8, reviewCount: 3089, reviewDesc: '很好',
    rooms: [
      { id: 101, name: '豪华大床房', area: '42m²', bed: '大床1.8m', price: 2099, breakfast: '含双早', cancel: '限时免费取消' },
      { id: 102, name: '行政套房', area: '68m²', bed: '大床2.0m', price: 3699, breakfast: '含双早', cancel: '限时免费取消' },
      { id: 103, name: '江景套房', area: '78m²', bed: '大床2.0m', price: 5299, breakfast: '含双早+行政酒廊', cancel: '限时免费取消' },
      { id: 104, name: '九国套房', area: '120m²', bed: '特大床2.2m', price: 8999, breakfast: '含双早+管家服务', cancel: '不可取消' },
    ],
    reviews: [
      { id: 201, user: '旅行者小张', rating: 5.0, date: '2026-05-10', content: '地理位置绝佳，出了酒店就是外滩。房间很有历史感又不失现代舒适，早餐种类丰富。', reply: '' },
      { id: 202, user: '商务旅客老李', rating: 4.8, date: '2026-05-03', content: '商务出行首选，会议室设备齐全，服务周到。', reply: '感谢您的反馈！期待再次光临。' },
    ],
  },
  {
    id: 2, name: '上海凯宾斯基大酒店', recommended: true, starLevel: 4,
    img_url: './images/2.jpg',
    banner_url: 'banner-2.jpg', starimg_url: 'star4.png',
    transport: '浦东陆家嘴金融贸易区·陆家嘴环路1288号', phone: '021-38678888',
    area: '陆家嘴', priceLevel: 'high', price: 1388,
    description: '坐落于浦东陆家嘴核心地段，毗邻东方明珠，拥有686间客房，融合德式严谨与东方待客之道。',
    tag: ['健身房', '早餐', '儿童泳池', '会议室', '免费停车场', '接机', '行李寄存'],
    rating: 4.5, reviewCount: 1790, reviewDesc: '好',
    rooms: [
      { id: 201, name: '高级客房', area: '38m²', bed: '大床1.8m', price: 1388, breakfast: '含单早', cancel: '限时免费取消' },
      { id: 202, name: '豪华客房', area: '45m²', bed: '大床2.0m', price: 1888, breakfast: '含双早', cancel: '限时免费取消' },
      { id: 203, name: '行政客房', area: '55m²', bed: '大床2.0m', price: 2688, breakfast: '含双早+行政酒廊', cancel: '限时免费取消' },
    ],
    reviews: [
      { id: 301, user: '出差达人', rating: 4.5, date: '2026-05-08', content: '陆家嘴地段好，健身房设施不错，早餐中规中矩。', reply: '' },
      { id: 302, user: '亲子游妈妈', rating: 4.3, date: '2026-04-28', content: '儿童泳池孩子玩得很开心，房间也够大。', reply: '' },
    ],
  },
  {
    id: 3, name: '上海外滩南京东路亚朵酒店', recommended: true, starLevel: 5,
    img_url: './images/3.jpg',
    banner_url: 'banner-3.jpg', starimg_url: 'star5.png',
    transport: '外滩地区·福州路105-1号', phone: '021-63336688',
    area: '外滩', priceLevel: 'mid', price: 899,
    description: '位于福州路文化街，步行可达外滩，以「人文阅读」与「属地摄影」为品牌特色，竹居书吧24小时开放。',
    tag: ['叫醒服务', '网红打卡', '免费停车场', '无障碍客房', '会议室', '接机', '行李寄存'],
    rating: 4.7, reviewCount: 1467, reviewDesc: '很好',
    rooms: [
      { id: 301, name: '雅致大床房', area: '28m²', bed: '大床1.8m', price: 899, breakfast: '含单早', cancel: '限时免费取消' },
      { id: 302, name: '几木大床房', area: '32m²', bed: '大床1.8m', price: 1099, breakfast: '含双早', cancel: '限时免费取消' },
      { id: 303, name: '几木套房', area: '48m²', bed: '大床2.0m', price: 1599, breakfast: '含双早', cancel: '限时免费取消' },
    ],
    reviews: [
      { id: 401, user: '文艺青年小陈', rating: 4.8, date: '2026-05-12', content: '竹居书吧真的太棒了，晚上看书喝咖啡很惬意，推荐！', reply: '' },
      { id: 402, user: '性价比追求者', rating: 4.6, date: '2026-05-01', content: '外滩附近这个价位很良心，亚朵品质一直稳定。', reply: '' },
    ],
  },
  {
    id: 4, name: '上海艾迪逊酒店', recommended: true, starLevel: 5,
    img_url: './images/4.jpg',
    banner_url: 'banner-1.jpg', starimg_url: 'star5.png',
    transport: '外滩地区·南京东路199号', phone: '021-53689999',
    area: '外滩', priceLevel: 'luxury', price: 2899,
    description: '由旧电力大楼改建而成，将历史建筑与现代极简美学完美结合，顶楼酒吧HIYA可俯瞰浦江全景。',
    tag: ['咖啡厅', '泳池', '行李寄存', '代客泊车', 'SPA', '无障碍客房'],
    rating: 4.9, reviewCount: 2456, reviewDesc: '好',
    rooms: [
      { id: 401, name: '豪华客房', area: '40m²', bed: '大床1.8m', price: 2899, breakfast: '含单早', cancel: '限时免费取消' },
      { id: 402, name: '尊享客房', area: '52m²', bed: '大床2.0m', price: 3899, breakfast: '含双早', cancel: '限时免费取消' },
      { id: 403, name: '露台套房', area: '85m²', bed: '大床2.2m', price: 6889, breakfast: '含双早+露台下午茶', cancel: '不可取消' },
    ],
    reviews: [
      { id: 501, user: '设计师小王', rating: 5.0, date: '2026-05-05', content: '旧电力大楼改得太成功了，如恩的设计每个细节都很到位。', reply: '' },
      { id: 502, user: '潮流博主Lily', rating: 4.7, date: '2026-04-18', content: '房间极简但不失温度，备品是Le Labo的，超好闻。', reply: '' },
    ],
  },

  // ==================== 更多酒店（仅搜索/筛选展示） ====================

  // ---------- 五星/钻 ----------
  {
    id: 5, name: '上海浦东丽思卡尔顿酒店', recommended: false, starLevel: 5,
    img_url: 'https://picsum.photos/seed/ritzcarlton-pudong/640/480',
    starimg_url: 'star5.png',
    transport: '浦东陆家嘴·世纪大道8号上海国金中心', phone: '021-20201188',
    area: '陆家嘴', priceLevel: 'luxury', price: 3299,
    description: '坐落于上海国金中心之上，俯瞰黄浦江与外滩天际线，拥有285间豪华客房，以传奇式服务闻名。',
    tag: ['SPA', '室内游泳池', '米其林餐厅', '行政酒廊', '接机', '代客泊车', '管家服务'],
    rating: 4.9, reviewCount: 2156, reviewDesc: '非常好',
    rooms: [
      { id: 501, name: '豪华客房', area: '50m²', bed: '大床2.0m', price: 3299, breakfast: '含双早', cancel: '限时免费取消' },
      { id: 502, name: '行政套房', area: '78m²', bed: '大床2.0m', price: 5899, breakfast: '含双早+行政酒廊', cancel: '限时免费取消' },
      { id: 503, name: '外滩景观套房', area: '100m²', bed: '特大床2.2m', price: 9999, breakfast: '含双早+管家服务', cancel: '不可取消' },
    ],
    reviews: [
      { id: 601, user: '奢华旅行家', rating: 5.0, date: '2026-05-11', content: '丽思的服务无可挑剔，房间正对东方明珠，夜景无敌。', reply: '' },
      { id: 602, user: '蜜月夫妇', rating: 5.0, date: '2026-04-25', content: '蜜月布置太用心了，送了香槟和玫瑰，非常感动。', reply: '感谢选择丽思卡尔顿度过蜜月，祝二位幸福！' },
    ],
  },
  {
    id: 6, name: '上海外滩华尔道夫酒店', recommended: false, starLevel: 5,
    img_url: 'https://picsum.photos/seed/waldorf-sh/640/480',
    starimg_url: 'star5.png',
    transport: '外滩地区·中山东一路2号', phone: '021-63229988',
    area: '外滩', priceLevel: 'luxury', price: 3599,
    description: '坐落于外滩核心地段，拥有百年历史的老楼与新楼交相辉映，是外滩万国建筑群中的璀璨明珠。',
    tag: ['SPA', '室内游泳池', '米其林餐厅', '下午茶', '接机', '婚礼场地', '管家服务'],
    rating: 4.9, reviewCount: 1890, reviewDesc: '非常好',
    rooms: [
      { id: 601, name: '豪华客房', area: '45m²', bed: '大床2.0m', price: 3599, breakfast: '含双早', cancel: '限时免费取消' },
      { id: 602, name: '江景套房', area: '75m²', bed: '大床2.0m', price: 6599, breakfast: '含双早+下午茶', cancel: '限时免费取消' },
    ],
    reviews: [
      { id: 701, user: '历史建筑爱好者', rating: 5.0, date: '2026-05-06', content: '老楼太有味道了，走在走廊里仿佛穿越回上世纪。', reply: '' },
      { id: 702, user: '下午茶达人', rating: 4.8, date: '2026-04-20', content: '红丝绒下午茶名不虚传，环境和服务都是一流的。', reply: '' },
    ],
  },
  {
    id: 7, name: '上海半岛酒店', recommended: false, starLevel: 5,
    img_url: 'https://picsum.photos/seed/peninsula-sh/640/480',
    starimg_url: 'star5.png',
    transport: '外滩地区·中山东一路32号', phone: '021-23272888',
    area: '外滩', priceLevel: 'luxury', price: 3899,
    description: '外滩源地标建筑，融合装饰艺术与当代奢华，拥有235间客房，米其林星级餐厅，半岛水疗中心享誉沪上。',
    tag: ['SPA', '室内游泳池', '米其林餐厅', '接机', '代客泊车', '劳斯莱斯礼宾', '管家服务'],
    rating: 4.9, reviewCount: 1678, reviewDesc: '非常好',
    rooms: [
      { id: 701, name: '豪华客房', area: '48m²', bed: '大床2.0m', price: 3899, breakfast: '含双早', cancel: '限时免费取消' },
      { id: 702, name: '特级江景房', area: '55m²', bed: '大床2.0m', price: 5299, breakfast: '含双早', cancel: '限时免费取消' },
      { id: 703, name: '半岛套房', area: '110m²', bed: '特大床2.2m', price: 12899, breakfast: '含双早+劳斯莱斯接机', cancel: '不可取消' },
    ],
    reviews: [
      { id: 801, user: '酒店控Mr.Wang', rating: 5.0, date: '2026-05-08', content: '半岛就是半岛，细节无可挑剔，房间里那个控制面板太智能了。', reply: '' },
    ],
  },
  {
    id: 8, name: '上海宝格丽酒店', recommended: false, starLevel: 5,
    img_url: 'https://picsum.photos/seed/bvlgari-sh/640/480',
    starimg_url: 'star5.png',
    transport: '静安地区·河南北路33号', phone: '021-36067788',
    area: '静安寺', priceLevel: 'luxury', price: 4599,
    description: '坐落于苏河湾，由意大利国宝级品牌宝格丽打造，82间客房融合意式奢华与上海风情。',
    tag: ['SPA', '室内游泳池', '意大利餐厅', '行政酒廊', '接机', '代客泊车', '管家服务'],
    rating: 4.8, reviewCount: 1234, reviewDesc: '非常好',
    rooms: [
      { id: 801, name: '高级客房', area: '52m²', bed: '大床2.0m', price: 4599, breakfast: '含双早', cancel: '限时免费取消' },
      { id: 802, name: '宝格丽套房', area: '120m²', bed: '特大床2.2m', price: 15999, breakfast: '含双早+管家服务', cancel: '不可取消' },
    ],
    reviews: [
      { id: 901, user: '时尚买手Lina', rating: 4.8, date: '2026-05-02', content: '宝格丽的香氛太好闻了，整个酒店都是高级感。', reply: '' },
    ],
  },
  {
    id: 9, name: '上海浦东文华东方酒店', recommended: false, starLevel: 5,
    img_url: 'https://picsum.photos/seed/mandarin-pudong/640/480',
    starimg_url: 'star5.png',
    transport: '浦东陆家嘴·浦东南路111号', phone: '021-20829888',
    area: '陆家嘴', priceLevel: 'luxury', price: 2899,
    description: '坐落于黄浦江畔，拥有318间客房与套房，文华东方水疗中心连续多年获奖，江景房正对陆家嘴天际线。',
    tag: ['SPA', '室内游泳池', '中餐厅', '江景', '接机', '行政酒廊', '管家服务'],
    rating: 4.8, reviewCount: 1567, reviewDesc: '很好',
    rooms: [
      { id: 901, name: '豪华江景房', area: '46m²', bed: '大床2.0m', price: 2899, breakfast: '含双早', cancel: '限时免费取消' },
      { id: 902, name: '行政套房', area: '76m²', bed: '大床2.0m', price: 5299, breakfast: '含双早+行政酒廊', cancel: '限时免费取消' },
    ],
    reviews: [
      { id: 1001, user: '商旅精英', rating: 4.8, date: '2026-05-04', content: '位置好，服务细致，江景房确实值得多花一些钱。', reply: '' },
    ],
  },
  {
    id: 10, name: '上海静安瑞吉酒店', recommended: false, starLevel: 5,
    img_url: 'https://picsum.photos/seed/stregis-jingan/640/480',
    starimg_url: 'star5.png',
    transport: '静安地区·北京西路1008号', phone: '021-62579999',
    area: '静安寺', priceLevel: 'luxury', price: 2699,
    description: '位于静安核心商圈，491间客房均配备管家服务，瑞吉酒吧是城中最热门的社交场所之一。',
    tag: ['管家服务', '室内游泳池', '酒吧', '接机', '会议室', '行政酒廊', 'SPA'],
    rating: 4.7, reviewCount: 1345, reviewDesc: '很好',
    rooms: [
      { id: 1001, name: '豪华客房', area: '42m²', bed: '大床1.8m', price: 2699, breakfast: '含双早', cancel: '限时免费取消' },
      { id: 1002, name: '瑞吉套房', area: '72m²', bed: '大床2.0m', price: 5099, breakfast: '含双早+管家服务', cancel: '限时免费取消' },
    ],
    reviews: [
      { id: 1101, user: '周末度假族', rating: 4.6, date: '2026-04-30', content: '管家服务是亮点，帮忙安排了周边行程，很贴心。', reply: '' },
    ],
  },

  // ---------- 四星/钻 ----------
  {
    id: 11, name: '上海新天地安达仕酒店', recommended: false, starLevel: 4,
    img_url: 'https://picsum.photos/seed/andaz-xintiandi/640/480',
    starimg_url: 'star4.png',
    transport: '黄浦区·嵩山路88号', phone: '021-23101788',
    area: '新天地', priceLevel: 'high', price: 1688,
    description: '毗邻新天地商圈，设计时尚前卫，307间客房充满上海本地文化元素，是潮人的聚集地。',
    tag: ['酒吧', '健身房', '免费WiFi', '早餐', '会议室', '行李寄存'],
    rating: 4.6, reviewCount: 1123, reviewDesc: '好',
    rooms: [
      { id: 1101, name: '安达仕客房', area: '35m²', bed: '大床1.8m', price: 1688, breakfast: '含单早', cancel: '限时免费取消' },
      { id: 1102, name: '安达仕套房', area: '62m²', bed: '大床2.0m', price: 2888, breakfast: '含双早', cancel: '限时免费取消' },
    ],
    reviews: [
      { id: 1201, user: '潮流青年', rating: 4.5, date: '2026-05-09', content: '位置绝佳，出门就是新天地，酒店设计很有艺术感。', reply: '' },
    ],
  },
  {
    id: 12, name: '上海环球港凯悦酒店', recommended: false, starLevel: 4,
    img_url: 'https://picsum.photos/seed/hyatt-global/640/480',
    starimg_url: 'star4.png',
    transport: '普陀区·宁夏路718号', phone: '021-62161234',
    area: '环球港', priceLevel: 'high', price: 1288,
    description: '与环球港购物中心相连，拥有318间现代客房，顶楼行政酒廊可俯瞰城市景观。',
    tag: ['健身房', '游泳池', '早餐', '免费停车场', '会议室', '行政酒廊'],
    rating: 4.4, reviewCount: 987, reviewDesc: '好',
    rooms: [
      { id: 1201, name: '凯悦客房', area: '36m²', bed: '大床1.8m', price: 1288, breakfast: '含单早', cancel: '限时免费取消' },
      { id: 1202, name: '行政客房', area: '42m²', bed: '大床2.0m', price: 1988, breakfast: '含双早+行政酒廊', cancel: '限时免费取消' },
    ],
    reviews: [
      { id: 1301, user: '购物达人', rating: 4.3, date: '2026-05-07', content: '楼下就是环球港逛街超方便，房间干净舒适。', reply: '' },
    ],
  },
  {
    id: 13, name: '上海虹桥康得思酒店', recommended: false, starLevel: 4,
    img_url: 'https://picsum.photos/seed/cordis-hongqiao/640/480',
    starimg_url: 'star4.png',
    transport: '闵行区·申长路568号', phone: '021-52638888',
    area: '虹桥', priceLevel: 'high', price: 1088,
    description: '毗邻虹桥枢纽及国家会展中心，396间客房，米其林一星「明阁」中餐厅位于酒店内。',
    tag: ['健身房', '游泳池', '米其林餐厅', '接机', '免费停车场', '会议室'],
    rating: 4.5, reviewCount: 856, reviewDesc: '好',
    rooms: [
      { id: 1301, name: '高级客房', area: '34m²', bed: '大床1.8m', price: 1088, breakfast: '含单早', cancel: '限时免费取消' },
      { id: 1302, name: '豪华客房', area: '42m²', bed: '大床2.0m', price: 1688, breakfast: '含双早', cancel: '限时免费取消' },
    ],
    reviews: [
      { id: 1401, user: '会展参展商', rating: 4.5, date: '2026-05-01', content: '离会展中心步行可达，早餐很不错，明阁值得一试。', reply: '' },
    ],
  },
  {
    id: 14, name: '上海浦东喜来登由由大酒店', recommended: false, starLevel: 4,
    img_url: 'https://picsum.photos/seed/sheraton-pudong/640/480',
    starimg_url: 'star4.png',
    transport: '浦东新区·浦东南路2111号', phone: '021-50399999',
    area: '陆家嘴', priceLevel: 'high', price: 1188,
    description: '位于浦东金融区，毗邻世博园区，525间客房配备喜来登特色睡眠体验床品。',
    tag: ['健身房', '游泳池', '早餐', '免费停车场', '会议室', 'SPA'],
    rating: 4.3, reviewCount: 723, reviewDesc: '好',
    rooms: [
      { id: 1401, name: '豪华客房', area: '35m²', bed: '大床1.8m', price: 1188, breakfast: '含单早', cancel: '限时免费取消' },
      { id: 1402, name: '行政客房', area: '48m²', bed: '大床2.0m', price: 1888, breakfast: '含双早+行政酒廊', cancel: '限时免费取消' },
    ],
    reviews: [
      { id: 1501, user: '世博游客', rating: 4.2, date: '2026-04-28', content: '去世博园很方便，酒店设施齐全，性价比不错。', reply: '' },
    ],
  },

  // ---------- 三星/钻 ----------
  {
    id: 15, name: '上海人民广场全季酒店', recommended: false, starLevel: 3,
    img_url: 'https://picsum.photos/seed/quanji-renmin/640/480',
    starimg_url: 'star3.png',
    transport: '黄浦区·西藏中路268号', phone: '021-63306688',
    area: '人民广场', priceLevel: 'mid', price: 468,
    description: '位于人民广场核心区域，步行可达南京东路步行街，以简约东方美学设计为特色。',
    tag: ['免费WiFi', '早餐', '行李寄存', '叫醒服务', '自助洗衣'],
    rating: 4.4, reviewCount: 2345, reviewDesc: '很好',
    rooms: [
      { id: 1501, name: '标准大床房', area: '22m²', bed: '大床1.8m', price: 468, breakfast: '含单早', cancel: '限时免费取消' },
      { id: 1502, name: '高级大床房', area: '28m²', bed: '大床1.8m', price: 568, breakfast: '含双早', cancel: '限时免费取消' },
    ],
    reviews: [
      { id: 1601, user: '经济旅行者', rating: 4.5, date: '2026-05-09', content: '市中心这个价格很划算，房间虽小但干净整洁。', reply: '' },
    ],
  },
  {
    id: 16, name: '上海静安寺如家精选酒店', recommended: false, starLevel: 3,
    img_url: 'https://picsum.photos/seed/rujia-jingan/640/480',
    starimg_url: 'star3.png',
    transport: '静安区·万航渡路105号', phone: '021-62185566',
    area: '静安寺', priceLevel: 'mid', price: 398,
    description: '静安寺商圈内，交通便利，紧邻地铁2号线与7号线，精选客房配备记忆棉床垫。',
    tag: ['免费WiFi', '早餐', '行李寄存', '叫醒服务', '会议室'],
    rating: 4.2, reviewCount: 1567, reviewDesc: '好',
    rooms: [
      { id: 1601, name: '精选大床房', area: '20m²', bed: '大床1.8m', price: 398, breakfast: '含单早', cancel: '限时免费取消' },
      { id: 1602, name: '商务双床房', area: '26m²', bed: '双床1.5m', price: 458, breakfast: '含双早', cancel: '限时免费取消' },
    ],
    reviews: [
      { id: 1701, user: '背包客小刘', rating: 4.0, date: '2026-05-05', content: '位置好，出门就是静安寺，地铁去哪都方便。', reply: '' },
    ],
  },
  {
    id: 17, name: '上海徐家汇亚朵酒店', recommended: false, starLevel: 3,
    img_url: 'https://picsum.photos/seed/yaduo-xujiahui/640/480',
    starimg_url: 'star3.png',
    transport: '徐汇区·虹桥路188号', phone: '021-64286688',
    area: '徐家汇', priceLevel: 'mid', price: 528,
    description: '徐家汇商业区核心位置，亚朵标志性的竹居书吧与属地摄影，为商旅人士提供有温度的住宿体验。',
    tag: ['免费WiFi', '书吧', '早餐', '行李寄存', '网红打卡', '自助洗衣'],
    rating: 4.5, reviewCount: 1890, reviewDesc: '很好',
    rooms: [
      { id: 1701, name: '雅致大床房', area: '25m²', bed: '大床1.8m', price: 528, breakfast: '含单早', cancel: '限时免费取消' },
      { id: 1702, name: '几木大床房', area: '30m²', bed: '大床1.8m', price: 668, breakfast: '含双早', cancel: '限时免费取消' },
    ],
    reviews: [
      { id: 1801, user: '商旅人士', rating: 4.5, date: '2026-05-10', content: '徐家汇出差首选，交通方便，书吧很适合工作。', reply: '' },
    ],
  },
  {
    id: 18, name: '上海陆家嘴宜必思酒店', recommended: false, starLevel: 3,
    img_url: 'https://picsum.photos/seed/ibis-lujiazui/640/480',
    starimg_url: 'star3.png',
    transport: '浦东新区·浦东大道588号', phone: '021-58789900',
    area: '陆家嘴', priceLevel: 'mid', price: 428,
    description: '靠近陆家嘴金融区，设计简约现代，提供高性价比的住宿选择，距地铁4号线步行5分钟。',
    tag: ['免费WiFi', '早餐', '行李寄存', '叫醒服务', '自助洗衣'],
    rating: 4.1, reviewCount: 1234, reviewDesc: '好',
    rooms: [
      { id: 1801, name: '标准大床房', area: '18m²', bed: '大床1.5m', price: 428, breakfast: '含单早', cancel: '限时免费取消' },
      { id: 1802, name: '标准双床房', area: '22m²', bed: '双床1.2m', price: 488, breakfast: '含双早', cancel: '限时免费取消' },
    ],
    reviews: [
      { id: 1901, user: '金融民工', rating: 4.0, date: '2026-05-06', content: '这个位置这个价位很划算了，房间虽小但该有的都有。', reply: '' },
    ],
  },
  {
    id: 23, name: '上海外滩四川北路汉庭酒店', recommended: false, starLevel: 3,
    img_url: 'https://picsum.photos/seed/hanting-sichuan/640/480',
    starimg_url: 'star3.png',
    transport: '虹口区·四川北路1885号', phone: '021-56663388',
    area: '外滩', priceLevel: 'mid', price: 368,
    description: '位于四川北路商圈，步行可达外白渡桥与外滩，交通便利，价格实惠。',
    tag: ['免费WiFi', '早餐', '行李寄存', '叫醒服务', '自助洗衣'],
    rating: 4.2, reviewCount: 2134, reviewDesc: '好',
    rooms: [
      { id: 2301, name: '标准大床房', area: '18m²', bed: '大床1.5m', price: 368, breakfast: '含单早', cancel: '限时免费取消' },
      { id: 2302, name: '高级大床房', area: '22m²', bed: '大床1.8m', price: 428, breakfast: '含双早', cancel: '限时免费取消' },
    ],
    reviews: [
      { id: 2401, user: '外滩游客', rating: 4.0, date: '2026-05-09', content: '走去外滩只要十几分钟，这个价位在外滩附近很难得了。', reply: '' },
    ],
  },
  {
    id: 24, name: '上海浦东锦江之星酒店', recommended: false, starLevel: 3,
    img_url: 'https://picsum.photos/seed/jinjiang-pudong/640/480',
    starimg_url: 'star3.png',
    transport: '浦东新区·浦东南路3888号', phone: '021-68785566',
    area: '陆家嘴', priceLevel: 'mid', price: 338,
    description: '地处浦东世博板块，紧邻地铁6/8号线，锦江之星经典房型，干净舒适。',
    tag: ['免费WiFi', '早餐', '行李寄存', '叫醒服务', '停车位'],
    rating: 4.1, reviewCount: 3456, reviewDesc: '好',
    rooms: [
      { id: 2401, name: '标准大床房', area: '16m²', bed: '大床1.5m', price: 338, breakfast: '含单早', cancel: '限时免费取消' },
      { id: 2402, name: '商务大床房', area: '20m²', bed: '大床1.8m', price: 398, breakfast: '含双早', cancel: '限时免费取消' },
    ],
    reviews: [
      { id: 2501, user: '世博游客', rating: 4.0, date: '2026-05-06', content: '锦江之星品质一向稳定，干净卫生，前台服务态度好。', reply: '' },
    ],
  },
  {
    id: 25, name: '上海虹桥枢纽如家酒店', recommended: false, starLevel: 3,
    img_url: 'https://picsum.photos/seed/rujia-hongqiao/640/480',
    starimg_url: 'star3.png',
    transport: '闵行区·宁虹路1188号', phone: '021-52218866',
    area: '虹桥', priceLevel: 'mid', price: 308,
    description: '紧邻虹桥火车站与虹桥机场，提供免费接驳班车，赶早班机/高铁的理想落脚点。',
    tag: ['免费WiFi', '接机', '早餐', '行李寄存', '叫醒服务', '班车'],
    rating: 4.0, reviewCount: 4567, reviewDesc: '好',
    rooms: [
      { id: 2501, name: '标准大床房', area: '16m²', bed: '大床1.5m', price: 308, breakfast: '不含早', cancel: '限时免费取消' },
      { id: 2502, name: '商务双床房', area: '22m²', bed: '双床1.2m', price: 368, breakfast: '含双早', cancel: '限时免费取消' },
    ],
    reviews: [
      { id: 2601, user: '赶早班机', rating: 4.0, date: '2026-05-11', content: '有免费班车去航站楼太方便了，早上5点就有车。', reply: '' },
    ],
  },
  {
    id: 26, name: '上海南京东路莫泰168酒店', recommended: false, starLevel: 3,
    img_url: 'https://picsum.photos/seed/motel168-nanjing/640/480',
    starimg_url: 'star3.png',
    transport: '黄浦区·宁波路588号', phone: '021-63517788',
    area: '南京东路步行街', priceLevel: 'mid', price: 358,
    description: '步行3分钟到南京东路步行街，10分钟到外滩，地段绝佳的经济型酒店。',
    tag: ['免费WiFi', '行李寄存', '叫醒服务', '自助洗衣'],
    rating: 3.9, reviewCount: 2345, reviewDesc: '一般',
    rooms: [
      { id: 2601, name: '经济大床房', area: '14m²', bed: '大床1.5m', price: 358, breakfast: '不含早', cancel: '限时免费取消' },
      { id: 2602, name: '标准大床房', area: '18m²', bed: '大床1.8m', price: 428, breakfast: '含单早', cancel: '限时免费取消' },
    ],
    reviews: [
      { id: 2701, user: '穷游达人', rating: 3.8, date: '2026-05-07', content: '这个位置这个价简直离谱，房间虽小但地段无敌。', reply: '' },
    ],
  },
  {
    id: 27, name: '上海五角场全季酒店', recommended: false, starLevel: 3,
    img_url: 'https://picsum.photos/seed/quanji-wujiaochang/640/480',
    starimg_url: 'star3.png',
    transport: '杨浦区·淞沪路368号', phone: '021-65605566',
    area: '五角场', priceLevel: 'mid', price: 388,
    description: '位于五角场商圈核心，紧邻复旦大学与同济大学，全季经典东方简约设计。',
    tag: ['免费WiFi', '书吧', '早餐', '行李寄存', '自助洗衣', '会议室'],
    rating: 4.3, reviewCount: 1567, reviewDesc: '好',
    rooms: [
      { id: 2701, name: '标准大床房', area: '20m²', bed: '大床1.8m', price: 388, breakfast: '含单早', cancel: '限时免费取消' },
      { id: 2702, name: '高级大床房', area: '26m²', bed: '大床1.8m', price: 468, breakfast: '含双早', cancel: '限时免费取消' },
    ],
    reviews: [
      { id: 2801, user: '复旦校友', rating: 4.3, date: '2026-05-10', content: '回母校看看住这里，离学校近，全季的品质不用多说。', reply: '' },
    ],
  },
  {
    id: 28, name: '上海松江大学城格林豪泰', recommended: false, starLevel: 2,
    img_url: 'https://picsum.photos/seed/greentree-songjiang/640/480',
    starimg_url: 'star2.png',
    transport: '松江区·文汇路1235号', phone: '021-67628800',
    area: '松江', priceLevel: 'low', price: 168,
    description: '松江大学城核心位置，周边高校林立，价格亲民，学生党首选。',
    tag: ['免费WiFi', '行李寄存', '叫醒服务'],
    rating: 3.8, reviewCount: 1234, reviewDesc: '一般',
    rooms: [
      { id: 2801, name: '特价大床房', area: '14m²', bed: '大床1.5m', price: 168, breakfast: '不含早', cancel: '不可取消' },
      { id: 2802, name: '标准大床房', area: '18m²', bed: '大床1.8m', price: 208, breakfast: '不含早', cancel: '限时免费取消' },
    ],
    reviews: [
      { id: 2901, user: '大学生小赵', rating: 3.8, date: '2026-05-08', content: '大学城附近最便宜的选择之一，房间干净就好。', reply: '' },
    ],
  },
  {
    id: 29, name: '上海嘉定新城速8酒店', recommended: false, starLevel: 2,
    img_url: 'https://picsum.photos/seed/super8-jiading/640/480',
    starimg_url: 'star2.png',
    transport: '嘉定区·塔城路388号', phone: '021-59925588',
    area: '嘉定', priceLevel: 'low', price: 158,
    description: '嘉定新城核心区域，紧邻地铁11号线，干净实惠。',
    tag: ['免费WiFi', '行李寄存', '叫醒服务', '停车位'],
    rating: 3.6, reviewCount: 890, reviewDesc: '一般',
    rooms: [
      { id: 2901, name: '经济大床房', area: '14m²', bed: '大床1.5m', price: 158, breakfast: '不含早', cancel: '不可取消' },
      { id: 2902, name: '标准双床房', area: '18m²', bed: '双床1.2m', price: 198, breakfast: '不含早', cancel: '限时免费取消' },
    ],
    reviews: [
      { id: 3001, user: '嘉定出差', rating: 3.5, date: '2026-05-04', content: '就图个便宜，凑合一晚还行，前台办入住挺快。', reply: '' },
    ],
  },

  // ---------- 二星/钻及以下 ----------
  {
    id: 19, name: '上海火车站7天连锁酒店', recommended: false, starLevel: 2,
    img_url: 'https://picsum.photos/seed/7days-railway/640/480',
    starimg_url: 'star2.png',
    transport: '静安区·秣陵路99号', phone: '021-63546677',
    area: '上海站', priceLevel: 'low', price: 188,
    description: '紧邻上海火车站，交通极为便利，24小时热水，经济实惠之选。',
    tag: ['免费WiFi', '行李寄存', '叫醒服务', '24小时热水'],
    rating: 3.8, reviewCount: 3456, reviewDesc: '一般',
    rooms: [
      { id: 1901, name: '经济大床房', area: '15m²', bed: '大床1.5m', price: 188, breakfast: '不含早', cancel: '不可取消' },
      { id: 1902, name: '标准双床房', area: '18m²', bed: '双床1.2m', price: 228, breakfast: '不含早', cancel: '不可取消' },
    ],
    reviews: [
      { id: 2001, user: '赶火车的人', rating: 3.5, date: '2026-05-11', content: '就在火车站旁边，赶早班车住这里很方便，价格便宜。', reply: '' },
    ],
  },
  {
    id: 20, name: '上海南站格林豪泰酒店', recommended: false, starLevel: 2,
    img_url: 'https://picsum.photos/seed/green-tree-south/640/480',
    starimg_url: 'star2.png',
    transport: '徐汇区·沪闵路8390号', phone: '021-54358866',
    area: '上海南站', priceLevel: 'low', price: 178,
    description: '紧邻上海南站及长途客运南站，出行方便，提供基本住宿服务。',
    tag: ['免费WiFi', '行李寄存', '叫醒服务', '停车位'],
    rating: 3.7, reviewCount: 2234, reviewDesc: '一般',
    rooms: [
      { id: 2001, name: '特价大床房', area: '14m²', bed: '大床1.5m', price: 178, breakfast: '不含早', cancel: '不可取消' },
      { id: 2002, name: '标准大床房', area: '18m²', bed: '大床1.8m', price: 228, breakfast: '含单早', cancel: '限时免费取消' },
    ],
    reviews: [
      { id: 2101, user: '长途旅客', rating: 3.6, date: '2026-05-08', content: '南站旁边，下了长途车就能入住，凑合一晚还行。', reply: '' },
    ],
  },
  {
    id: 21, name: '上海中山公园海友酒店', recommended: false, starLevel: 2,
    img_url: 'https://picsum.photos/seed/haiyou-zhongshan/640/480',
    starimg_url: 'star2.png',
    transport: '长宁区·长宁路888号', phone: '021-52726688',
    area: '中山公园', priceLevel: 'low', price: 218,
    description: '中山公园商圈内，紧邻地铁2/3/4号线交汇站，华住旗下年轻化品牌，性价比高。',
    tag: ['免费WiFi', '行李寄存', '叫醒服务', '自助洗衣'],
    rating: 4.0, reviewCount: 1876, reviewDesc: '好',
    rooms: [
      { id: 2101, name: '海友大床房', area: '16m²', bed: '大床1.5m', price: 218, breakfast: '不含早', cancel: '限时免费取消' },
      { id: 2102, name: '海友双床房', area: '20m²', bed: '双床1.2m', price: 258, breakfast: '不含早', cancel: '限时免费取消' },
    ],
    reviews: [
      { id: 2201, user: '学生党', rating: 4.0, date: '2026-05-10', content: '对学生来说性价比很高，地铁站就在楼下，去哪都方便。', reply: '' },
    ],
  },
  {
    id: 22, name: '上海迪士尼乐园酒店', recommended: false, starLevel: 5,
    img_url: 'https://picsum.photos/seed/disneyland-sh/640/480',
    starimg_url: 'star5.png',
    transport: '浦东新区·申迪西路1009号', phone: '021-20998002',
    area: '迪士尼度假区', priceLevel: 'luxury', price: 3599,
    description: '上海迪士尼度假区内的官方酒店，维多利亚风格建筑，专属入园通道，沉浸式迪士尼魔法体验。',
    tag: ['室内游泳池', '儿童乐园', '迪士尼餐厅', '班车服务', '行李寄存', 'VIP入园', '亲子友好'],
    rating: 4.8, reviewCount: 5678, reviewDesc: '非常好',
    rooms: [
      { id: 2201, name: '花园景观房', area: '35m²', bed: '大床1.8m', price: 3599, breakfast: '含双早', cancel: '限时免费取消' },
      { id: 2202, name: '乐园景观房', area: '40m²', bed: '大床1.8m', price: 4299, breakfast: '含双早+VIP入园', cancel: '限时免费取消' },
      { id: 2203, name: '主题套房', area: '65m²', bed: '特大床2.0m', price: 6899, breakfast: '含双早+VIP入园+下午茶', cancel: '不可取消' },
    ],
    reviews: [
      { id: 2301, user: '带娃妈妈', rating: 5.0, date: '2026-05-12', content: '孩子开心疯了！VIP入园太省时间了，酒店里就能见米奇。', reply: '' },
      { id: 2302, user: '迪士尼粉丝', rating: 4.9, date: '2026-04-26', content: '细节满满，每个角落都有迪士尼元素，早餐还有角色合影。', reply: '' },
    ],
  },
]

/** 推荐酒店 */
export function getRecommendedHotels() {
  return hotels.filter((h) => h.recommended)
}

/** 根据 id 获取酒店详情 */
export function getHotelById(id) {
  return hotels.find((h) => h.id === Number(id)) || null
}

/** 筛选条件 */
export function filterHotels({ keyword, area, starLevel, priceLevel, minPrice, maxPrice } = {}) {
  let result = [...hotels]

  if (keyword) {
    const kw = keyword.toLowerCase()
    result = result.filter((h) => {
      const haystack = [h.name, h.transport, ...h.tag].join(' ').toLowerCase()
      return haystack.includes(kw)
    })
  }

  if (area) {
    result = result.filter((h) => h.area === area)
  }

  if (starLevel) {
    result = result.filter((h) => h.starLevel === Number(starLevel))
  }

  if (priceLevel) {
    result = result.filter((h) => h.priceLevel === priceLevel)
  }

  if (minPrice) {
    result = result.filter((h) => h.price >= Number(minPrice))
  }

  if (maxPrice) {
    result = result.filter((h) => h.price <= Number(maxPrice))
  }

  return result
}
