-- 权限申请表 - 用于存储园区权限申请记录
CREATE TABLE "JHN"."park_staff_permission_apply"
(
    "id" BIGINT IDENTITY(1, 1) NOT NULL,
    "apply_id" VARCHAR(50) NOT NULL,
    "emp_id" VARCHAR(10) NOT NULL,
    "emp_name" VARCHAR(100) NOT NULL,
    "park_id" BIGINT NOT NULL,
    "park_name" VARCHAR(100),
    "apply_type" VARCHAR(20) NOT NULL,
    "credential_no" VARCHAR(50),
    "mobile" VARCHAR(20),
    "remark" VARCHAR(500),
    "status" VARCHAR(20) DEFAULT 'pending',
    "process_id" VARCHAR(50),
    "create_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pk_permission_apply_id" NOT CLUSTER PRIMARY KEY("id"),
    CONSTRAINT "uk_permission_apply_id" UNIQUE("apply_id")
) STORAGE(ON "CARPARK", CLUSTERBTR);

COMMENT ON TABLE JHN."park_staff_permission_apply" IS '权限申请表 - 存储员工提交的园区权限申请记录';
COMMENT ON COLUMN JHN."park_staff_permission_apply"."id" IS '自增ID-主键';
COMMENT ON COLUMN JHN."park_staff_permission_apply"."apply_id" IS '申请编号-唯一标识';
COMMENT ON COLUMN JHN."park_staff_permission_apply"."emp_id" IS '员工工号';
COMMENT ON COLUMN JHN."park_staff_permission_apply"."emp_name" IS '员工姓名';
COMMENT ON COLUMN JHN."park_staff_permission_apply"."park_id" IS '园区ID';
COMMENT ON COLUMN JHN."park_staff_permission_apply"."park_name" IS '园区名称';
COMMENT ON COLUMN JHN."park_staff_permission_apply"."apply_type" IS '申请类型-new:新增,renew:续期,modify:变更';
COMMENT ON COLUMN JHN."park_staff_permission_apply"."credential_no" IS '车牌号码';
COMMENT ON COLUMN JHN."park_staff_permission_apply"."mobile" IS '联系电话';
COMMENT ON COLUMN JHN."park_staff_permission_apply"."remark" IS '申请备注';
COMMENT ON COLUMN JHN."park_staff_permission_apply"."status" IS '申请状态-pending:待审批,approved:已通过,rejected:已驳回,withdrawn:已撤回';
COMMENT ON COLUMN JHN."park_staff_permission_apply"."process_id" IS 'BPM流程实例ID';
COMMENT ON COLUMN JHN."park_staff_permission_apply"."create_time" IS '创建时间';
COMMENT ON COLUMN JHN."park_staff_permission_apply"."update_time" IS '更新时间';

-- 创建索引
CREATE UNIQUE INDEX "JHN"."uk_permission_apply_id" ON "JHN"."park_staff_permission_apply"("apply_id" ASC) STORAGE(ON "CARPARK", CLUSTERBTR);
CREATE INDEX "JHN"."idx_permission_apply_emp_id" ON "JHN"."park_staff_permission_apply"("emp_id" ASC) STORAGE(ON "CARPARK", CLUSTERBTR);
CREATE INDEX "JHN"."idx_permission_apply_park_id" ON "JHN"."park_staff_permission_apply"("park_id" ASC) STORAGE(ON "CARPARK", CLUSTERBTR);
CREATE INDEX "JHN"."idx_permission_apply_status" ON "JHN"."park_staff_permission_apply"("status" ASC) STORAGE(ON "CARPARK", CLUSTERBTR);
CREATE INDEX "JHN"."idx_permission_apply_process_id" ON "JHN"."park_staff_permission_apply"("process_id" ASC) STORAGE(ON "CARPARK", CLUSTERBTR);
