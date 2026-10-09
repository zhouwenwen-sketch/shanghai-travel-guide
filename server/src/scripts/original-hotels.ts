// Original demo content from travel-backend V2__demo_hotel_data.sql.
// Legacy numeric IDs deliberately omitted: resolve each hotel by its identity.
export const ORIGINAL_HOTELS = [
  {
    "hotel": {
      "name": "上海和平饭店",
      "recommended": true,
      "star_level": 5,
      "img_url": "/images/1.jpg",
      "banner_url": "banner-1.jpg",
      "starimg_url": "star5.png",
      "transport": "外滩地区·外滩街道南京东路20号",
      "phone": "021-63216888",
      "area": "外滩",
      "price_level": "luxury",
      "price": 2099,
      "description": "始建于1929年，上海最具代表性的历史建筑之一，融合装饰艺术风格与现代奢华，拥有270间客房。",
      "rating": 4.8,
      "review_count": 3089,
      "review_desc": "很好"
    },
    "tags": [
      "SPA",
      "室内游泳池",
      "西餐厅",
      "接机",
      "行李寄存",
      "礼宾服务",
      "VIP通道"
    ],
    "rooms": [
      {
        "name": "豪华大床房",
        "area": "42m²",
        "bed": "大床1.8m",
        "price": 2099,
        "breakfast": "含双早",
        "cancel_rule": "限时免费取消"
      },
      {
        "name": "行政套房",
        "area": "68m²",
        "bed": "大床2.0m",
        "price": 3699,
        "breakfast": "含双早",
        "cancel_rule": "限时免费取消"
      },
      {
        "name": "江景套房",
        "area": "78m²",
        "bed": "大床2.0m",
        "price": 5299,
        "breakfast": "含双早+行政酒廊",
        "cancel_rule": "限时免费取消"
      },
      {
        "name": "九国套房",
        "area": "120m²",
        "bed": "特大床2.2m",
        "price": 8999,
        "breakfast": "含双早+管家服务",
        "cancel_rule": "不可取消"
      }
    ],
    "reviews": [
      {
        "review_user": "旅行者小张",
        "rating": 5,
        "date": "2026-05-10",
        "content": "地理位置绝佳，出了酒店就是外滩。房间很有历史感又不失现代舒适，早餐种类丰富。",
        "reply": ""
      },
      {
        "review_user": "商务旅客老李",
        "rating": 4.8,
        "date": "2026-05-03",
        "content": "商务出行首选，会议室设备齐全，服务周到。",
        "reply": "感谢您的反馈！期待再次光临。"
      }
    ]
  },
  {
    "hotel": {
      "name": "上海凯宾斯基大酒店",
      "recommended": true,
      "star_level": 4,
      "img_url": "/images/2.jpg",
      "banner_url": "banner-2.jpg",
      "starimg_url": "star4.png",
      "transport": "浦东陆家嘴金融贸易区·陆家嘴环路1288号",
      "phone": "021-38678888",
      "area": "陆家嘴",
      "price_level": "high",
      "price": 1388,
      "description": "坐落于浦东陆家嘴核心地段，毗邻东方明珠，拥有686间客房，融合德式严谨与东方待客之道。",
      "rating": 4.5,
      "review_count": 1790,
      "review_desc": "好"
    },
    "tags": [
      "健身房",
      "早餐",
      "儿童泳池",
      "会议室",
      "免费停车场",
      "接机",
      "行李寄存"
    ],
    "rooms": [
      {
        "name": "高级客房",
        "area": "38m²",
        "bed": "大床1.8m",
        "price": 1388,
        "breakfast": "含单早",
        "cancel_rule": "限时免费取消"
      },
      {
        "name": "豪华客房",
        "area": "45m²",
        "bed": "大床2.0m",
        "price": 1888,
        "breakfast": "含双早",
        "cancel_rule": "限时免费取消"
      },
      {
        "name": "行政客房",
        "area": "55m²",
        "bed": "大床2.0m",
        "price": 2688,
        "breakfast": "含双早+行政酒廊",
        "cancel_rule": "限时免费取消"
      }
    ],
    "reviews": [
      {
        "review_user": "出差达人",
        "rating": 4.5,
        "date": "2026-05-08",
        "content": "陆家嘴地段好，健身房设施不错，早餐中规中矩。",
        "reply": ""
      },
      {
        "review_user": "亲子游妈妈",
        "rating": 4.3,
        "date": "2026-04-28",
        "content": "儿童泳池孩子玩得很开心，房间也够大。",
        "reply": ""
      }
    ]
  },
  {
    "hotel": {
      "name": "上海外滩南京东路亚朵酒店",
      "recommended": true,
      "star_level": 5,
      "img_url": "/images/3.jpg",
      "banner_url": "banner-3.jpg",
      "starimg_url": "star5.png",
      "transport": "外滩地区·福州路105-1号",
      "phone": "021-63336688",
      "area": "外滩",
      "price_level": "mid",
      "price": 899,
      "description": "位于福州路文化街，步行可达外滩，以「人文阅读」与「属地摄影」为品牌特色，竹居书吧24小时开放。",
      "rating": 4.7,
      "review_count": 1467,
      "review_desc": "很好"
    },
    "tags": [
      "叫醒服务",
      "网红打卡",
      "免费停车场",
      "无障碍客房",
      "会议室",
      "接机",
      "行李寄存"
    ],
    "rooms": [
      {
        "name": "雅致大床房",
        "area": "28m²",
        "bed": "大床1.8m",
        "price": 899,
        "breakfast": "含单早",
        "cancel_rule": "限时免费取消"
      },
      {
        "name": "几木大床房",
        "area": "32m²",
        "bed": "大床1.8m",
        "price": 1099,
        "breakfast": "含双早",
        "cancel_rule": "限时免费取消"
      },
      {
        "name": "几木套房",
        "area": "48m²",
        "bed": "大床2.0m",
        "price": 1599,
        "breakfast": "含双早",
        "cancel_rule": "限时免费取消"
      }
    ],
    "reviews": [
      {
        "review_user": "文艺青年小陈",
        "rating": 4.8,
        "date": "2026-05-12",
        "content": "竹居书吧真的太棒了，晚上看书喝咖啡很惬意，推荐！",
        "reply": ""
      },
      {
        "review_user": "性价比追求者",
        "rating": 4.6,
        "date": "2026-05-01",
        "content": "外滩附近这个价位很良心，亚朵品质一直稳定。",
        "reply": ""
      }
    ]
  },
  {
    "hotel": {
      "name": "上海艾迪逊酒店",
      "recommended": true,
      "star_level": 5,
      "img_url": "/images/4.jpg",
      "banner_url": "banner-1.jpg",
      "starimg_url": "star5.png",
      "transport": "外滩地区·南京东路199号",
      "phone": "021-53689999",
      "area": "外滩",
      "price_level": "luxury",
      "price": 2899,
      "description": "由旧电力大楼改建而成，将历史建筑与现代极简美学完美结合，顶楼酒吧HIYA可俯瞰浦江全景。",
      "rating": 4.9,
      "review_count": 2456,
      "review_desc": "好"
    },
    "tags": [
      "咖啡厅",
      "泳池",
      "行李寄存",
      "代客泊车",
      "SPA",
      "无障碍客房"
    ],
    "rooms": [
      {
        "name": "豪华客房",
        "area": "40m²",
        "bed": "大床1.8m",
        "price": 2899,
        "breakfast": "含单早",
        "cancel_rule": "限时免费取消"
      },
      {
        "name": "尊享客房",
        "area": "52m²",
        "bed": "大床2.0m",
        "price": 3899,
        "breakfast": "含双早",
        "cancel_rule": "限时免费取消"
      },
      {
        "name": "露台套房",
        "area": "85m²",
        "bed": "大床2.2m",
        "price": 6889,
        "breakfast": "含双早+露台下午茶",
        "cancel_rule": "不可取消"
      }
    ],
    "reviews": [
      {
        "review_user": "设计师小王",
        "rating": 5,
        "date": "2026-05-05",
        "content": "旧电力大楼改得太成功了，如恩的设计每个细节都很到位。",
        "reply": ""
      },
      {
        "review_user": "潮流博主Lily",
        "rating": 4.7,
        "date": "2026-04-18",
        "content": "房间极简但不失温度，备品是Le Labo的，超好闻。",
        "reply": ""
      }
    ]
  }
]
