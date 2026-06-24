-- 删除唯一性约束，重新创建表（保留数据）
ALTER TABLE "JHN"."park_cache" DROP CONSTRAINT "uk_park_cache_park_id";

-- 如果需要重新创建表（清空数据）
-- DROP TABLE "JHN"."park_cache";
-- 然后重新执行 park_cache.sql
