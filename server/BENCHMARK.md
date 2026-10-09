# 酒店搜索独立测试库

只在本机 `travel_bench` 数据库操作。专用脚本拒绝远程主机及其他数据库，避免向日常使用的 `travel_node` 写入批量数据。

1. 在 MySQL 命令行创建 `travel_bench`，并给测试账号授予该库权限。
2. 复制 `.env.bench.example` 为 `.env.bench.local`，填写测试账号和 `BENCH_COUNT`。不要提交此文件。
3. 运行 `npm run db:push:bench`。该命令读取并检查 `BENCH_DATABASE_URL` 后才把它传给 Prisma；不要使用普通的 `npm run db:push` 建测试库结构。
4. 运行 `npm run seed:hotels:bench -- --count 10000`。需要 5 万条时再运行 `--count 50000`。固定种子为 `20260922`，每批 500 条，使用保留 ID 范围。重复运行会逐项校验已有数据并拒绝混入或损坏的数据，不会叠加记录。
5. 启动基准服务时设置 `NODE_ENV=benchmark`，并让 `DATABASE_HOST/PORT/USER/PASSWORD/NAME` 明确指向同一 `travel_bench`。基准接口 `/health/bench` 会用 `SELECT DATABASE()` 核验实际数据库；非 benchmark 模式返回 404。
6. 运行 `npm run bench:hotels:legacy`。脚本先确认服务实际连接 `travel_bench` 且保留记录数等于 `BENCH_COUNT`，不匹配时拒绝测试。每组暖机 5 次、采样 20 次，输出 p50/p95、响应 KB、该场景采样到的服务端堆内存峰值，以及 Git、Node、MySQL 和机器环境。
7. 部署分页代码后，在相同数据、服务配置和机器状态下运行 `npm run bench:hotels:paged`。随后运行只读的 `npm run bench:hotels:explain` 保存区域星级、价格、模糊关键词和深页码的 `EXPLAIN ANALYZE`。只有执行计划证明候选索引减少扫描与延迟后，才修改正式 schema。

若要分别记录 1 万与 5 万的可比结果，应先完成 1 万阶段基线，再扩容到 5 万。脚本不会清理或删除数据。浏览器交互指标仍需在同一设备和限速条件下单独记录。
