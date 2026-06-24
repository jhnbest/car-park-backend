-- 园区缓存数据表
-- 用于存储从捷顺API同步的园区数据缓存
CREATE TABLE "JHN"."park_cache"
(
  "id" BIGINT IDENTITY(1, 1) NOT NULL,
  "park_id" VARCHAR(100) NOT NULL,
  "gate_count" NUMBER(5,0) DEFAULT 0,
  "vehicle_count" NUMBER(10,0) DEFAULT 0,
  "daily_pass_count" NUMBER(10,0) DEFAULT 0,
  "person_count" NUMBER(10,0) DEFAULT 0,
  "cached_at" TIMESTAMP(6),
  "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pk_park_cache_id" NOT CLUSTER PRIMARY KEY("id"),
  CONSTRAINT "uk_park_cache_park_id" UNIQUE("park_id")
) STORAGE(ON "CARPARK", CLUSTERBTR);

COMMENT ON TABLE JHN."park_cache" IS '园区缓存数据表 - 存储从捷顺API同步的园区数据缓存';
COMMENT ON COLUMN JHN."park_cache"."id" IS '缓存ID-主键';
COMMENT ON COLUMN JHN."park_cache"."park_id" IS '园区第三方ID';
COMMENT ON COLUMN JHN."park_cache"."gate_count" IS '道闸数量';
COMMENT ON COLUMN JHN."park_cache"."vehicle_count" IS '授权车辆数';
COMMENT ON COLUMN JHN."park_cache"."daily_pass_count" IS '当日通行数';
COMMENT ON COLUMN JHN."park_cache"."person_count" IS '人员数量';
COMMENT ON COLUMN JHN."park_cache"."cached_at" IS '缓存时间';
COMMENT ON COLUMN JHN."park_cache"."created_at" IS '创建时间';
COMMENT ON COLUMN JHN."park_cache"."updated_at" IS '更新时间';

CREATE OR REPLACE INDEX "JHN"."idx_park_cache_park_id" ON "JHN"."park_cache"("park_id" ASC) STORAGE(ON "CARPARK", CLUSTERBTR);
