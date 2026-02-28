-- ============================================================
-- 数据迁移脚本 - 从旧表结构迁移到新表结构
-- 数据库：达梦数据库 DM
-- 说明：将原始表的数据迁移到优化后的新表
-- ============================================================

-- ------------------------------------------------------------
-- 0. 清理已存在的数据
-- ------------------------------------------------------------
DELETE FROM "JHN"."park_info";
DELETE FROM "JHN"."hr_staff";
DELETE FROM "JHN"."sys_organization";
DELETE FROM "JHN"."sys_user";

-- ------------------------------------------------------------
-- 1. 用户表迁移：users -> sys_user
-- ------------------------------------------------------------
SET IDENTITY_INSERT "JHN"."sys_user" ON;

INSERT INTO "JHN"."sys_user" (
    "id", "username", "password", "role", "status", "gender", "avatar",
    "department", "last_login_time", "last_login_ip", "login_count",
    "failed_login_attempts", "lock_until_time", "created_at", "updated_at", "remark"
)
SELECT
    "id", "username", "password", "role", "status", "gender", "avatar",
    "department", "last_login_time", "last_login_ip", "login_count",
    "failed_login_attempts", "lock_until_time", "created_at", "updated_at", "remark"
FROM "JHN"."users";

SET IDENTITY_INSERT "JHN"."sys_user" OFF;

SELECT '用户表迁移结果:' AS "info", COUNT(*) AS "count" FROM "JHN"."sys_user";

-- ------------------------------------------------------------
-- 2. 机构表迁移：ORGANIZATION -> sys_organization
-- ------------------------------------------------------------
SET IDENTITY_INSERT "JHN"."sys_organization" ON;

INSERT INTO "JHN"."sys_organization" (
    "id", "organ_id", "organ_code", "organ_name", "layer_code",
    "superior_organ", "manage_organ", "full_path", "status", "virtual_flag",
    "name_jp", "sort_no", "changed_date", "sys_organ_code", "created_at", "updated_at"
)
SELECT
    ROWNUM, "ORGAN_ID", "ORGAN_CODE", "ORGAN_NAME", "LAYER_CODE",
    "SUPERIOR_ORGAN", "MANAGE_ORGAN", "FULL_PATH", "STATUS", "VIRTUAL_FLAG",
    "NAME_JP", "SORT_NO", "CHANGED_DATE", "SYS_ORGAN_CODE", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "JHN"."ORGANIZATION";

SET IDENTITY_INSERT "JHN"."sys_organization" OFF;

SELECT '机构表迁移结果:' AS "info", COUNT(*) AS "count" FROM "JHN"."sys_organization";

-- ------------------------------------------------------------
-- 3. 员工信息表迁移：STAFFINFO -> hr_staff
-- ------------------------------------------------------------
-- 删除 hr_staff 表并重建（不带唯一性约束）
DROP TABLE "JHN"."hr_staff";

CREATE TABLE "JHN"."hr_staff" (
    "id" BIGINT IDENTITY(1, 1) NOT NULL,
    "emp_sid" VARCHAR(22),
    "mf_id" VARCHAR(10),
    "cn_name" VARCHAR(100),
    "smpl_name" VARCHAR(100),
    "full_name" VARCHAR(200),
    "firstname_en" VARCHAR(40),
    "surname_en" VARCHAR(40),
    "midname_en" VARCHAR(40),
    "gender" VARCHAR(20),
    "organ_id" VARCHAR(40),
    "e0122" VARCHAR(50),
    "unit_name" VARCHAR(800),
    "dep_name" VARCHAR(200),
    "office_name" VARCHAR(400),
    "emp_type" VARCHAR(50),
    "emp_type_nm_new" VARCHAR(20),
    "emp_status_nm_new" VARCHAR(20),
    "work_post" VARCHAR(200),
    "post_id" VARCHAR(40),
    "job_type" VARCHAR(100),
    "tel_office" VARCHAR(50),
    "ekp_main" VARCHAR(100),
    "typeid" VARCHAR(8),
    "staff_rank" NUMBER(8,0),
    "pass_level_name" VARCHAR(40),
    "organ_post_all" VARCHAR(200),
    "changed_date" DATE,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    CONSTRAINT "pk_hr_staff_id" PRIMARY KEY("id")
);

-- 迁移所有数据
SET IDENTITY_INSERT "JHN"."hr_staff" ON;

INSERT INTO "JHN"."hr_staff" (
    "id", "emp_sid", "mf_id", "cn_name", "smpl_name", "full_name",
    "firstname_en", "surname_en", "midname_en", "gender", "organ_id",
    "e0122", "unit_name", "dep_name", "office_name", "emp_type",
    "emp_type_nm_new", "emp_status_nm_new", "work_post", "post_id",
    "job_type", "tel_office", "ekp_main", "typeid", "staff_rank",
    "pass_level_name", "organ_post_all", "changed_date", "created_at", "updated_at"
)
SELECT
    ROWNUM, "EMP_SID", "MF_ID", "CN_NAME", "SMPL_NAME", "FULL_NAME",
    "FIRSTNAME_EN", "SURNAME_EN", "MIDNAME_EN", "GENDER", "ORGAN_ID",
    "E0122", "UNIT_NAME", "DEP_NAME", "OFFICE_NAME", "EMP_TYPE",
    "EMP_TYPE_NM_NEW", "EMP_STATUS_NM_NEW", "WORK_POST", "POST_ID",
    "JOB_TYPE", "TEL_OFFICE", "EKP_MAIN", "TYPEID", "STAFF_RANK",
    "PASS_LEVEL_NAME", "ORGAN_POST_ALL", "CHANGED_DATE", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "JHN"."STAFFINFO";

SET IDENTITY_INSERT "JHN"."hr_staff" OFF;

SELECT '员工信息表迁移结果:' AS "info", COUNT(*) AS "count" FROM "JHN"."hr_staff";

-- ------------------------------------------------------------
-- 4. 园区信息表迁移
-- ------------------------------------------------------------
-- 由于原表 PARKDATA 不存在，跳过此步骤
SELECT '园区表迁移跳过（原表不存在）:' AS "info", 0 AS "count";

-- ------------------------------------------------------------
-- 5. 验证数据完整性
-- ------------------------------------------------------------
SELECT '=== 数据迁移验证 ===' AS "info";

SELECT 'sys_user' AS "table_name", COUNT(*) AS "count" FROM "JHN"."sys_user"
UNION ALL
SELECT 'sys_organization', COUNT(*) FROM "JHN"."sys_organization"
UNION ALL
SELECT 'hr_staff', COUNT(*) FROM "JHN"."hr_staff"
UNION ALL
SELECT 'park_info', COUNT(*) FROM "JHN"."park_info";

-- ------------------------------------------------------------
-- 6. 对比原表和目标表的数量
-- ------------------------------------------------------------
SELECT '=== 原表数据统计 ===' AS "info";

SELECT '原表-用户' AS "table_name", COUNT(*) AS "count" FROM "JHN"."users"
UNION ALL
SELECT '原表-机构', COUNT(*) FROM "JHN"."ORGANIZATION"
UNION ALL
SELECT '原表-员工', COUNT(*) FROM "JHN"."STAFFINFO";

-- ============================================================
-- 迁移完成！
-- ============================================================
