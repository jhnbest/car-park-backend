-- 权限表 - 用于存储员工已授权的园区权限
CREATE TABLE "JHN"."park_staff_permission"
(
    "id" BIGINT IDENTITY(1, 1) NOT NULL,
    "permission_id" VARCHAR(50) NOT NULL,
    "emp_id" VARCHAR(10) NOT NULL,
    "emp_name" VARCHAR(100) NOT NULL,
    "park_id" BIGINT NOT NULL,
    "park_name" VARCHAR(100),
    "credential_no" VARCHAR(50),
    "mobile" VARCHAR(20),
    "permission_type" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) DEFAULT 'active',
    "start_date" TIMESTAMP(6),
    "end_date" TIMESTAMP(6),
    "create_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pk_permission_id" NOT CLUSTER PRIMARY KEY("id"),
    CONSTRAINT "uk_permission_id" UNIQUE("permission_id")
) STORAGE(ON "CARPARK", CLUSTERBTR);

COMMENT ON TABLE JHN."park_staff_permission" IS '权限表 - 存储员工已授权的园区权限';
COMMENT ON COLUMN JHN."park_staff_permission"."id" IS '自增ID-主键';
COMMENT ON COLUMN JHN."park_staff_permission"."permission_id" IS '权限ID-唯一标识';
COMMENT ON COLUMN JHN."park_staff_permission"."emp_id" IS '员工工号';
COMMENT ON COLUMN JHN."park_staff_permission"."emp_name" IS '员工姓名';
COMMENT ON COLUMN JHN."park_staff_permission"."park_id" IS '园区ID';
COMMENT ON COLUMN JHN."park_staff_permission"."park_name" IS '园区名称';
COMMENT ON COLUMN JHN."park_staff_permission"."credential_no" IS '车牌号码';
COMMENT ON COLUMN JHN."park_staff_permission"."mobile" IS '联系电话';
COMMENT ON COLUMN JHN."park_staff_permission"."permission_type" IS '权限类型-new:新增,renew:续期,modify:变更';
COMMENT ON COLUMN JHN."park_staff_permission"."status" IS '权限状态-active:有效,inactive:失效';
COMMENT ON COLUMN JHN."park_staff_permission"."start_date" IS '权限开始日期';
COMMENT ON COLUMN JHN."park_staff_permission"."end_date" IS '权限结束日期';
COMMENT ON COLUMN JHN."park_staff_permission"."create_time" IS '创建时间';
COMMENT ON COLUMN JHN."park_staff_permission"."update_time" IS '更新时间';

-- 创建索引
CREATE UNIQUE INDEX "JHN"."uk_permission_id" ON "JHN"."park_staff_permission"("permission_id" ASC) STORAGE(ON "CARPARK", CLUSTERBTR);
CREATE INDEX "JHN"."idx_permission_emp_id" ON "JHN"."park_staff_permission"("emp_id" ASC) STORAGE(ON "CARPARK", CLUSTERBTR);
CREATE INDEX "JHN"."idx_permission_park_id" ON "JHN"."park_staff_permission"("park_id" ASC) STORAGE(ON "CARPARK", CLUSTERBTR);
CREATE INDEX "JHN"."idx_permission_status" ON "JHN"."park_staff_permission"("status" ASC) STORAGE(ON "CARPARK", CLUSTERBTR);
