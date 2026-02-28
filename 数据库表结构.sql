CREATE TABLE "JHN"."hr_staff"
(
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
CONSTRAINT "pk_hr_staff_id" NOT CLUSTER PRIMARY KEY("id")) STORAGE(ON "CARPARK", CLUSTERBTR) ;

CREATE TABLE "JHN"."park_gate"
(
"id" BIGINT IDENTITY(1, 1) NOT NULL,
"park_id" BIGINT NOT NULL,
"gate_name" VARCHAR(100),
"gate_code" VARCHAR(50),
"gate_type" VARCHAR(20),
"device_ip" VARCHAR(100),
"device_port" VARCHAR(10),
"area" VARCHAR(50),
"status" CHAR(1) DEFAULT '1',
"sort_no" NUMBER(5,0) DEFAULT 0,
"created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
"updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT "pk_park_gate_id" NOT CLUSTER PRIMARY KEY("id"),
CONSTRAINT "fk_park_gate_park_id" FOREIGN KEY("park_id") REFERENCES "JHN"."park_info"("id")) STORAGE(ON "CARPARK", CLUSTERBTR) ;

COMMENT ON TABLE JHN."park_gate" IS '道闸表 - 存储园区道闸设备信息';
COMMENT ON COLUMN JHN."park_gate"."id" IS '道闸ID-主键';
COMMENT ON COLUMN JHN."park_gate"."park_id" IS '所属园区ID';
COMMENT ON COLUMN JHN."park_gate"."gate_name" IS '道闸名称';
COMMENT ON COLUMN JHN."park_gate"."gate_code" IS '道闸编号';
COMMENT ON COLUMN JHN."park_gate"."gate_type" IS '道闸类型-入口:entry,出口:exit';
COMMENT ON COLUMN JHN."park_gate"."device_ip" IS '设备IP地址';
COMMENT ON COLUMN JHN."park_gate"."device_port" IS '设备端口';
COMMENT ON COLUMN JHN."park_gate"."area" IS '所在区域';
COMMENT ON COLUMN JHN."park_gate"."status" IS '状态-1:正常,0:停用';
COMMENT ON COLUMN JHN."park_gate"."sort_no" IS '排序号';
COMMENT ON COLUMN JHN."park_gate"."created_at" IS '创建时间';
COMMENT ON COLUMN JHN."park_gate"."updated_at" IS '更新时间';


CREATE OR REPLACE  INDEX "JHN"."idx_park_gate_park_id" ON "JHN"."park_gate"("park_id" ASC) STORAGE(ON "CARPARK", CLUSTERBTR) ;

CREATE TABLE "JHN"."park_info"
(
"id" BIGINT IDENTITY(1, 1) NOT NULL,
"park_name" VARCHAR(100),
"ip" VARCHAR(100) NOT NULL,
"park_name_third" VARCHAR(100),
"park_no" VARCHAR(100),
"park_id" VARCHAR(100),
"status" CHAR(1) DEFAULT '1',
"area" VARCHAR(50),
"address" VARCHAR(200),
"contact" VARCHAR(50),
"contact_phone" VARCHAR(20),
"gate_count" NUMBER(5,0) DEFAULT 0,
"created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
"updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT "pk_park_info_id" NOT CLUSTER PRIMARY KEY("id"),
CONSTRAINT "uk_park_info_park_id" UNIQUE("park_id")) STORAGE(ON "CARPARK", CLUSTERBTR) ;

COMMENT ON TABLE JHN."park_info" IS '园区信息表 - 存储园区/停车场基本信息';
COMMENT ON COLUMN JHN."park_info"."id" IS '园区ID-主键';
COMMENT ON COLUMN JHN."park_info"."park_name" IS '园区名称';
COMMENT ON COLUMN JHN."park_info"."ip" IS '服务器IP地址';
COMMENT ON COLUMN JHN."park_info"."park_name_third" IS '第三方园区名称';
COMMENT ON COLUMN JHN."park_info"."park_no" IS '园区编号';
COMMENT ON COLUMN JHN."park_info"."park_id" IS '园区第三方ID';
COMMENT ON COLUMN JHN."park_info"."status" IS '状态-1:正常,0:停用';
COMMENT ON COLUMN JHN."park_info"."area" IS '所在区域';
COMMENT ON COLUMN JHN."park_info"."address" IS '园区地址';
COMMENT ON COLUMN JHN."park_info"."contact" IS '联系人';
COMMENT ON COLUMN JHN."park_info"."contact_phone" IS '联系电话';
COMMENT ON COLUMN JHN."park_info"."gate_count" IS '道闸数量';
COMMENT ON COLUMN JHN."park_info"."created_at" IS '创建时间';
COMMENT ON COLUMN JHN."park_info"."updated_at" IS '更新时间';


CREATE TABLE "JHN"."park_package"
(
"id" BIGINT IDENTITY(1, 1) NOT NULL,
"park_id" BIGINT NOT NULL,
"package_code" VARCHAR(50) NOT NULL,
"package_name" VARCHAR(100) NOT NULL,
"package_type" VARCHAR(20),
"description" VARCHAR(500),
"validity_days" NUMBER(5,0),
"price" NUMBER(10,2),
"status" CHAR(1) DEFAULT '1',
"sort_no" NUMBER(5,0) DEFAULT 0,
"created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
"updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT "pk_park_package_id" NOT CLUSTER PRIMARY KEY("id"),
CONSTRAINT "uk_park_package_code" UNIQUE("park_id", "package_code")) STORAGE(ON "CARPARK", CLUSTERBTR) ;

COMMENT ON TABLE JHN."park_package" IS '园区套餐表 - 存储园区通行套餐信息';
COMMENT ON COLUMN JHN."park_package"."id" IS '套餐ID-主键';
COMMENT ON COLUMN JHN."park_package"."park_id" IS '所属园区ID';
COMMENT ON COLUMN JHN."park_package"."package_code" IS '套餐编码';
COMMENT ON COLUMN JHN."park_package"."package_name" IS '套餐名称';
COMMENT ON COLUMN JHN."park_package"."package_type" IS '套餐类型-月卡:monthly,季卡:quarterly,年卡:yearly';
COMMENT ON COLUMN JHN."park_package"."description" IS '套餐描述';
COMMENT ON COLUMN JHN."park_package"."validity_days" IS '有效期天数';
COMMENT ON COLUMN JHN."park_package"."price" IS '价格';
COMMENT ON COLUMN JHN."park_package"."status" IS '状态-1:启用,0:停用';
COMMENT ON COLUMN JHN."park_package"."sort_no" IS '排序号';
COMMENT ON COLUMN JHN."park_package"."created_at" IS '创建时间';
COMMENT ON COLUMN JHN."park_package"."updated_at" IS '更新时间';


CREATE OR REPLACE  INDEX "JHN"."idx_park_package_park_id" ON "JHN"."park_package"("park_id" ASC) STORAGE(ON "CARPARK", CLUSTERBTR) ;

CREATE TABLE "JHN"."park_staff_permission"
(
"id" BIGINT IDENTITY(1, 1) NOT NULL,
"staff_id" BIGINT NOT NULL,
"park_id" BIGINT NOT NULL,
"person_id" VARCHAR(50),
"credential_no" VARCHAR(50),
"credential_type" VARCHAR(20),
"package_code" VARCHAR(50),
"package_name" VARCHAR(100),
"status" CHAR(1) DEFAULT '1',
"effective_date" DATE,
"expire_date" DATE,
"issue_time" TIMESTAMP(6),
"created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
"updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT "pk_park_staff_permission_id" NOT CLUSTER PRIMARY KEY("id")) STORAGE(ON "CARPARK", CLUSTERBTR) ;

COMMENT ON TABLE JHN."park_staff_permission" IS '员工园区权限表 - 存储员工在园区的通行权限';
COMMENT ON COLUMN JHN."park_staff_permission"."id" IS '权限ID-主键';
COMMENT ON COLUMN JHN."park_staff_permission"."staff_id" IS '员工ID-关联hr_staff表';
COMMENT ON COLUMN JHN."park_staff_permission"."park_id" IS '园区ID-关联park_info表';
COMMENT ON COLUMN JHN."park_staff_permission"."person_id" IS '第三方系统人员ID';
COMMENT ON COLUMN JHN."park_staff_permission"."credential_no" IS '凭证号码-车牌号';
COMMENT ON COLUMN JHN."park_staff_permission"."credential_type" IS '凭证类型-车牌:vehicle,门禁:door';
COMMENT ON COLUMN JHN."park_staff_permission"."package_code" IS '套餐编码';
COMMENT ON COLUMN JHN."park_staff_permission"."package_name" IS '套餐名称';
COMMENT ON COLUMN JHN."park_staff_permission"."status" IS '权限状态-1:有效,0:失效';
COMMENT ON COLUMN JHN."park_staff_permission"."effective_date" IS '生效日期';
COMMENT ON COLUMN JHN."park_staff_permission"."expire_date" IS '失效日期';
COMMENT ON COLUMN JHN."park_staff_permission"."issue_time" IS '发放时间';
COMMENT ON COLUMN JHN."park_staff_permission"."created_at" IS '创建时间';
COMMENT ON COLUMN JHN."park_staff_permission"."updated_at" IS '更新时间';


CREATE OR REPLACE UNIQUE  INDEX "JHN"."uk_park_staff_permission_unique" ON "JHN"."park_staff_permission"("staff_id" ASC,"park_id" ASC,"credential_no" ASC) STORAGE(ON "CARPARK", CLUSTERBTR) ;
CREATE OR REPLACE  INDEX "JHN"."idx_park_staff_permission_staff_id" ON "JHN"."park_staff_permission"("staff_id" ASC) STORAGE(ON "CARPARK", CLUSTERBTR) ;
CREATE OR REPLACE  INDEX "JHN"."idx_park_staff_permission_park_id" ON "JHN"."park_staff_permission"("park_id" ASC) STORAGE(ON "CARPARK", CLUSTERBTR) ;

CREATE TABLE "JHN"."sys_operation_log"
(
"id" BIGINT IDENTITY(1, 1) NOT NULL,
"user_id" BIGINT,
"username" VARCHAR(50),
"module" VARCHAR(50),
"operation" VARCHAR(50),
"method" VARCHAR(100),
"request_url" VARCHAR(200),
"request_method" VARCHAR(10),
"request_params" CLOB,
"request_body" CLOB,
"response_status" NUMBER(5,0),
"response_body" CLOB,
"ip_address" VARCHAR(45),
"user_agent" VARCHAR(500),
"execution_time" NUMBER(10,0),
"error_message" VARCHAR(1000),
"created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT "pk_sys_operation_log_id" NOT CLUSTER PRIMARY KEY("id")) STORAGE(ON "CARPARK", CLUSTERBTR) ;

COMMENT ON TABLE JHN."sys_operation_log" IS '系统操作日志表 - 记录用户操作行为';
COMMENT ON COLUMN JHN."sys_operation_log"."id" IS '日志ID-主键';
COMMENT ON COLUMN JHN."sys_operation_log"."user_id" IS '操作用户ID';
COMMENT ON COLUMN JHN."sys_operation_log"."username" IS '操作用户名';
COMMENT ON COLUMN JHN."sys_operation_log"."module" IS '操作模块';
COMMENT ON COLUMN JHN."sys_operation_log"."operation" IS '操作类型';
COMMENT ON COLUMN JHN."sys_operation_log"."method" IS '请求方法';
COMMENT ON COLUMN JHN."sys_operation_log"."request_url" IS '请求URL';
COMMENT ON COLUMN JHN."sys_operation_log"."request_method" IS '请求方法GET/POST';
COMMENT ON COLUMN JHN."sys_operation_log"."request_params" IS '请求参数';
COMMENT ON COLUMN JHN."sys_operation_log"."request_body" IS '请求体';
COMMENT ON COLUMN JHN."sys_operation_log"."response_status" IS '响应状态码';
COMMENT ON COLUMN JHN."sys_operation_log"."response_body" IS '响应内容';
COMMENT ON COLUMN JHN."sys_operation_log"."ip_address" IS 'IP地址';
COMMENT ON COLUMN JHN."sys_operation_log"."user_agent" IS '用户代理';
COMMENT ON COLUMN JHN."sys_operation_log"."execution_time" IS '执行时间-毫秒';
COMMENT ON COLUMN JHN."sys_operation_log"."error_message" IS '错误信息';
COMMENT ON COLUMN JHN."sys_operation_log"."created_at" IS '创建时间';


CREATE OR REPLACE  INDEX "JHN"."idx_sys_operation_log_user_id" ON "JHN"."sys_operation_log"("user_id" ASC) STORAGE(ON "CARPARK", CLUSTERBTR) ;
CREATE OR REPLACE  INDEX "JHN"."idx_sys_operation_log_created_at" ON "JHN"."sys_operation_log"("created_at" ASC) STORAGE(ON "CARPARK", CLUSTERBTR) ;
CREATE OR REPLACE  INDEX "JHN"."idx_sys_operation_log_module" ON "JHN"."sys_operation_log"("module" ASC) STORAGE(ON "CARPARK", CLUSTERBTR) ;

CREATE TABLE "JHN"."sys_organization"
(
"id" BIGINT IDENTITY(1, 1) NOT NULL,
"organ_id" VARCHAR(20),
"organ_code" VARCHAR(30),
"organ_name" VARCHAR(80),
"layer_code" VARCHAR(10),
"superior_organ" VARCHAR(20),
"manage_organ" VARCHAR(20),
"full_path" VARCHAR(400),
"status" CHAR(1) DEFAULT '1',
"virtual_flag" CHAR(1) DEFAULT '0',
"name_jp" VARCHAR(16),
"sort_no" VARCHAR(4),
"changed_date" DATE,
"sys_organ_code" VARCHAR(200),
"created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
"updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT "pk_sys_organization_id" NOT CLUSTER PRIMARY KEY("id")) STORAGE(ON "CARPARK", CLUSTERBTR) ;

COMMENT ON TABLE JHN."sys_organization" IS '机构表 - 存储组织机构信息';
COMMENT ON COLUMN JHN."sys_organization"."id" IS '机构ID-主键';
COMMENT ON COLUMN JHN."sys_organization"."organ_id" IS '机构代码-业务主键';
COMMENT ON COLUMN JHN."sys_organization"."organ_code" IS '机构层级代码';
COMMENT ON COLUMN JHN."sys_organization"."organ_name" IS '机构名称';
COMMENT ON COLUMN JHN."sys_organization"."layer_code" IS '层级编码';
COMMENT ON COLUMN JHN."sys_organization"."superior_organ" IS '上级机构ID';
COMMENT ON COLUMN JHN."sys_organization"."manage_organ" IS '所属管理部门ID';
COMMENT ON COLUMN JHN."sys_organization"."full_path" IS '机构全路径';
COMMENT ON COLUMN JHN."sys_organization"."status" IS '状态-1:正常,0:停用';
COMMENT ON COLUMN JHN."sys_organization"."virtual_flag" IS '是否虚拟机构-0:否,1:是';
COMMENT ON COLUMN JHN."sys_organization"."name_jp" IS '机构名称简拼';
COMMENT ON COLUMN JHN."sys_organization"."sort_no" IS '排序号';
COMMENT ON COLUMN JHN."sys_organization"."changed_date" IS '修改日期';
COMMENT ON COLUMN JHN."sys_organization"."sys_organ_code" IS '系统机构代码';
COMMENT ON COLUMN JHN."sys_organization"."created_at" IS '创建时间';
COMMENT ON COLUMN JHN."sys_organization"."updated_at" IS '更新时间';


CREATE OR REPLACE UNIQUE  INDEX "JHN"."uk_sys_organization_organ_id" ON "JHN"."sys_organization"("organ_id" ASC) STORAGE(ON "CARPARK", CLUSTERBTR) ;
CREATE OR REPLACE  INDEX "JHN"."idx_sys_organization_parent" ON "JHN"."sys_organization"("superior_organ" ASC) STORAGE(ON "CARPARK", CLUSTERBTR) ;

CREATE TABLE "JHN"."sys_user"
(
"id" BIGINT IDENTITY(1, 1) NOT NULL,
"username" VARCHAR(50) NOT NULL,
"password" VARCHAR(255) NOT NULL,
"role" VARCHAR(20) DEFAULT 'user' NOT NULL,
"status" NUMBER(1,0) DEFAULT 1 NOT NULL,
"gender" VARCHAR(20),
"avatar" VARCHAR(255),
"department" VARCHAR(100),
"last_login_time" TIMESTAMP(6),
"last_login_ip" VARCHAR(45),
"login_count" NUMBER(10,0) DEFAULT 0,
"failed_login_attempts" NUMBER(3,0) DEFAULT 0,
"lock_until_time" TIMESTAMP(6),
"created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
"updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
"created_by" BIGINT,
"updated_by" BIGINT,
"remark" VARCHAR(500),
"ext_info" CLOB,
CONSTRAINT "pk_sys_user_id" NOT CLUSTER PRIMARY KEY("id"),
CONSTRAINT "uk_sys_user_username" UNIQUE("username")) STORAGE(ON "CARPARK", CLUSTERBTR) ;

COMMENT ON TABLE JHN."sys_user" IS '系统用户表 - 存储系统登录用户信息';
COMMENT ON COLUMN JHN."sys_user"."id" IS '用户ID-主键';
COMMENT ON COLUMN JHN."sys_user"."username" IS '用户名-唯一约束';
COMMENT ON COLUMN JHN."sys_user"."password" IS '登录密码-加密存储';
COMMENT ON COLUMN JHN."sys_user"."role" IS '用户角色-admin:管理员,user:普通用户';
COMMENT ON COLUMN JHN."sys_user"."status" IS '账号状态-1:启用,0:禁用';
COMMENT ON COLUMN JHN."sys_user"."gender" IS '性别';
COMMENT ON COLUMN JHN."sys_user"."avatar" IS '头像URL';
COMMENT ON COLUMN JHN."sys_user"."department" IS '所属部门';
COMMENT ON COLUMN JHN."sys_user"."last_login_time" IS '最后登录时间';
COMMENT ON COLUMN JHN."sys_user"."last_login_ip" IS '最后登录IP';
COMMENT ON COLUMN JHN."sys_user"."login_count" IS '登录次数';
COMMENT ON COLUMN JHN."sys_user"."failed_login_attempts" IS '连续登录失败次数';
COMMENT ON COLUMN JHN."sys_user"."lock_until_time" IS '账号锁定截止时间';
COMMENT ON COLUMN JHN."sys_user"."created_at" IS '创建时间';
COMMENT ON COLUMN JHN."sys_user"."updated_at" IS '更新时间';
COMMENT ON COLUMN JHN."sys_user"."created_by" IS '创建人ID';
COMMENT ON COLUMN JHN."sys_user"."updated_by" IS '更新人ID';
COMMENT ON COLUMN JHN."sys_user"."remark" IS '备注';
COMMENT ON COLUMN JHN."sys_user"."ext_info" IS '扩展信息-JSON格式';


CREATE TABLE "JHN"."users"
(
"id" NUMBER(20,0) NOT NULL,
"username" VARCHAR2(50) NOT NULL,
"password" VARCHAR2(255) NOT NULL,
"role" VARCHAR2(20) DEFAULT 'user' NOT NULL,
"status" NUMBER(1,0) DEFAULT 1 NOT NULL,
"gender" NUMBER(1,0),
"avatar" VARCHAR2(255),
"department" VARCHAR2(100),
"last_login_time" TIMESTAMP(6),
"last_login_ip" VARCHAR2(45),
"login_count" NUMBER(10,0) DEFAULT 0,
"failed_login_attempts" NUMBER(3,0) DEFAULT 0,
"lock_until_time" TIMESTAMP(6),
"created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
"updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
"created_by" NUMBER(20,0),
"updated_by" NUMBER(20,0),
"remark" VARCHAR2(500),
"ext_info" CLOB,
NOT CLUSTER PRIMARY KEY("id"),
UNIQUE("username")) STORAGE(ON "CARPARK", CLUSTERBTR) ;


CREATE TABLE "JHN"."sync_log"
(
"id" BIGINT IDENTITY(1, 1) NOT NULL,
"task_name" VARCHAR(100) NOT NULL,
"sync_type" VARCHAR(20) NOT NULL,
"status" VARCHAR(20) NOT NULL,
"message" VARCHAR(1000),
"total_fetched" NUMBER(10,0) DEFAULT 0,
"total_processed" NUMBER(10,0) DEFAULT 0,
"inserted" NUMBER(10,0) DEFAULT 0,
"updated" NUMBER(10,0) DEFAULT 0,
"errors" NUMBER(10,0) DEFAULT 0,
"time_range" VARCHAR(100),
"duration" VARCHAR(50),
"error_detail" CLOB,
"created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT "pk_sync_log_id" NOT CLUSTER PRIMARY KEY("id")) STORAGE(ON "CARPARK", CLUSTERBTR) ;

COMMENT ON TABLE JHN."sync_log" IS '数据同步日志表 - 记录机构和人员同步任务执行结果';
COMMENT ON COLUMN JHN."sync_log"."id" IS '日志ID-主键';
COMMENT ON COLUMN JHN."sync_log"."task_name" IS '任务名称';
COMMENT ON COLUMN JHN."sync_log"."sync_type" IS '同步类型-full:全量,incremental:增量';
COMMENT ON COLUMN JHN."sync_log"."status" IS '执行状态-success:成功,failed:失败';
COMMENT ON COLUMN JHN."sync_log"."message" IS '执行结果描述';
COMMENT ON COLUMN JHN."sync_log"."total_fetched" IS '获取数据总数';
COMMENT ON COLUMN JHN."sync_log"."total_processed" IS '处理数据总数';
COMMENT ON COLUMN JHN."sync_log"."inserted" IS '新增数据条数';
COMMENT ON COLUMN JHN."sync_log"."updated" IS '更新数据条数';
COMMENT ON COLUMN JHN."sync_log"."errors" IS '错误数据条数';
COMMENT ON COLUMN JHN."sync_log"."time_range" IS '同步时间范围';
COMMENT ON COLUMN JHN."sync_log"."duration" IS '执行耗时';
COMMENT ON COLUMN JHN."sync_log"."error_detail" IS '错误详情';
COMMENT ON COLUMN JHN."sync_log"."created_at" IS '创建时间';

CREATE OR REPLACE INDEX "JHN"."idx_sync_log_task_name" ON "JHN"."sync_log"("task_name" ASC) STORAGE(ON "CARPARK", CLUSTERBTR) ;
CREATE OR REPLACE INDEX "JHN"."idx_sync_log_created_at" ON "JHN"."sync_log"("created_at" ASC) STORAGE(ON "CARPARK", CLUSTERBTR) ;

