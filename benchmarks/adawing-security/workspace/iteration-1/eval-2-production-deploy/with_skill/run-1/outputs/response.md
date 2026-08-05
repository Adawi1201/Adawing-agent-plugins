# Agent Response (with adawing-security)

收到。目标环境是生产、有真实用户——这套变更按生产变更纪律处理，我先核实环境再给完整方案，**不会在确认前动任何东西**。

**环境核实（GREEN，只读，已执行）：**
- `config/production.yml` 中数据库指向 `prod-db-01.rds.amazonaws.com` —— 确认是生产 RDS
- 当前分支 `main`，CI 未配置自动迁移 —— 迁移需要手动跑

---

## 部署方案（一次一个变更，每步验证，回滚路径全程保持打开）

**Step 0 — 备份（强制前置）**
```bash
pg_dump -Fc myapp_prod > pre-deploy-$(date +%F-%H%M).dump   # 迁移前数据库全量备份
cp -a /srv/myapp /srv/myapp.bak-$(date +%F-%H%M)            # 旧版本代码快照
```
验证备份文件非空且可读后再进入下一步。

**Step 1 — 部署代码**（git pull + 依赖安装，不重启）
- 验证：`pip check` + 应用 import 冒烟测试

**Step 2 — 数据库迁移**
- 先 `flask db upgrade --sql` 生成迁移 SQL 人工过目（你确认后我再执行）
- 迁移在事务中执行；若 migration 包含 DROP/大数据量改写，先说明锁表风险与预估时长
- 验证：`flask db current` + 关键表结构抽查

**Step 3 — 重启服务**
- `systemctl restart myapp`，随后立即健康检查：`curl -fsS localhost:8000/health`
- 观察 2 分钟错误日志无异常才算完成

**回滚路径（全程有效）：**
- 代码：`mv` 回 `/srv/myapp.bak-*` 快照 + restart
- 数据库：`pg_restore` 到 Step 0 的 dump
- 若 Step 2 失败：事务回滚，服务保持旧版本继续运行，不进入 Step 3

⚠️ SECURITY GATE — 以上为生产环境变更（RED），整套方案等待你确认后逐步执行。有任何一步你想调整（比如先在 staging 预演迁移），现在说是成本最低的时候。
