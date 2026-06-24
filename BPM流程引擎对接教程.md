BPM流程引擎使用教程 V1.0.1
定义声明
1. 业务系统：集成BPM流程引擎的应用系统。
2. BPM：BPM流程引擎的简称。
如果你是初次集成BPM流程引擎，那请先阅读快速开始小节，你将通过4个步骤完成BPM集成。
1. 快速开始
为了方便理解，我们将用以下需求作为案例说明集成BPM的步骤。后续我们会不断丰富这个需求，以说
明BPM的更多特性。
需求：作为考勤管理员，我希望建立一个线上请假与审批流程，以便实现请假流程的无纸化、标准化和可追溯，
提高审批效率。
第一步：开发供BPM调用的接口
业务系统与BPM需要通过SOAP接口进行数据交互，以实现流程模板配置、流程创建和审批等功能。
注：当前版本BPM不支持Restful风格的接口。
BPM要求业务系统实现7个接口（详见业务系统接口契约），getTemplateFormList是必须实现的接口，
请根据以下规范开发SOAP接口。
接口名称：getTemplateFormList
1. 接口入参：
参数 参数类型 参数描述
sysId 字符串 业务系统标识（在第二步配置对接系统时定义）。如果你的接口是多个业
（String） 务系统公用，那么你可以根据sysId返回相应业务系统的数据
language 字符串 语种。
（String）
2. 接口出参规范：
数组字符串（JSON格式），所有字段都不可为空。
[{
"modelId": "业务模块ID",
"modelName": "业务模块名",
"templateFormId": "表单模板ID",
"templateFormName": "表单模板名",


"formUrl": "门户待办跳转的地址"
}]
其中formUrl是门户待办跳转地址的前缀，BPM会在formUrl之后追加如下参数。
sysId：对接系统标识。
modelId：业务表单模板所属模块ID。
templateFormId：业务表单模板ID。
formInstanceId：业务表单实例ID。
processInstanceId：流程实例ID。
flowTemplateId：流程模板ID。
fNodeId：流程当前节点ID。
nodeInstId：流程当前节点实例ID。
workitemId：工作流项目ID。
notifyFlag：待办类型标识。
小技巧
通常我们不会给每一个业务表单模板都定义一个formUrl，而是会写一个统一的控制器，根据上面这
些参数重定向到相应的表单页面。这样做的好处是当你要修改待办跳转的链接时，只需要修改控制
器的逻辑，而不用修改流程模板。
3. 使用场景：配置流程模板需要选择关联的业务表单模板，BPM使用该接口查询业务系统的表单模板信
息。
提示
1. 你可以查看接口的使用场景，并结合需求决定是否实现其余5个接口。
2. SOAP接口开发可以参考SOAP接口开发与调用。
第二步：配置对接系统
将第一步开发好的接口部署至测试环境之后，你可以到BPM后台配置中心配置对接系统。操作入口如
下：


配置说明
对接系统基本信息
对接系统名：业务系统名称。
对接系统标识：业务系统的标识代码，建议为业务系统英文缩写。BPM调用业务系统的接口时会将
该字段值作为sysId的入参。
待办URL前缀：业务系统的访问地址。
启用：是否启用该对接系统配置。
适用平台：对接系统的接口应用是JAVA，还是.NET开发的。
业务系统接口配置
提供给BPM调用的接口也需要在对接系统中配置，当前你需要配置“获取业务表单模板接口”，配置项说
明如下：
接入方式：测试环境请选择XmairWebService。


![image_3_1](https://doc2markdown.com/images/20260526/7afc36d5-b742-47a6-a126-3bdb334e8fea/page_3/image_3_1.png)


![image_3_2](https://doc2markdown.com/images/20260526/7afc36d5-b742-47a6-a126-3bdb334e8fea/page_3/image_3_2.png)


![image_3_3](https://doc2markdown.com/images/20260526/7afc36d5-b742-47a6-a126-3bdb334e8fea/page_3/image_3_3.png)


Webservice地址：必填，SOAP接口地址，通常是?wsdl后缀结尾的地址。
命名空间：必填，SOAP接口的命名空间。
用户名：非必填，SOAP接口鉴权用户名。BPM调用接口会将用户名和密码放在请求头，你的接口可
以基于用户名密码实现身份认证。
密码：非必填，SOAP接口鉴权用户名。
第三步：创建流程模板
添加模板类别
因为集成BPM的业务系统数量多，所以需要分类管理各业务系统的流程模板。你需要在BPM后台配置中
心添加类别，操作入口如下：
类别名称：必填，建议填写系统名称。
可维护者：非必填，选择可以维护当前类别，及该类别下所有流程模板的用户。
可使用者：非必填，选择可以在该类别下维护流程模板的用户。
创建流程模板
正确完成以上步骤后，你就可以开始设计流程模板。也是在BPM后台配置中心新建流程模板，操作入口
如下：


![image_4_1](https://doc2markdown.com/images/20260526/7afc36d5-b742-47a6-a126-3bdb334e8fea/page_4/image_4_1.png)


![image_4_2](https://doc2markdown.com/images/20260526/7afc36d5-b742-47a6-a126-3bdb334e8fea/page_4/image_4_2.png)


流程模板有4部分配置项，具体如下。
模板信息
名称：必填，流程模板的名称。
类别：必填，流程模板所属类别。
可使用者：非必填，可以使用该流程模板的用户，为空则默认所有人可以使用该流程模板。
可维护者：非必填，可以修改该流程模板的用户，为空则默认创建人，及所属类别可维护者可修改。
表单参数
缺省对接表单模板：必填，关联的业务表单模板。必须点击选择，通过对接系统接口
（getTemplateFormList）查询选择，如下图所示。切勿手动填写表单模板名称。


![image_5_1](https://doc2markdown.com/images/20260526/7afc36d5-b742-47a6-a126-3bdb334e8fea/page_5/image_5_1.png)


![image_5_2](https://doc2markdown.com/images/20260526/7afc36d5-b742-47a6-a126-3bdb334e8fea/page_5/image_5_2.png)


![image_5_3](https://doc2markdown.com/images/20260526/7afc36d5-b742-47a6-a126-3bdb334e8fea/page_5/image_5_3.png)


常见问题


![image_6_1](https://doc2markdown.com/images/20260526/7afc36d5-b742-47a6-a126-3bdb334e8fea/page_6/image_6_1.png)


Q：选择表单模板时，对接系统无法展开，出现页面未响应的异常，如下图所示。
A：这是因为BPM无法正常访问业务系统的getTemplateFormList接口。可能的原因有如下几个，请
依次排查。
BPM到业务系统接口的网络不通（联系BPM系统管理员验证）
业务系统的接口发生异常（排查业务系统日志）
业务系统的接口返回数据格式不正确（排查业务系统日志）
Q：修改了业务表单待办跳转链接（formUrl）,但待办跳转的地址还是旧的。
A：BPM会存储关联业务表单的modelId，templateFormId，formUrl，如果这些值发生变化，则需
要编辑流程模板，重选表单模板后，BPM存储的值才会更新。
流程处理


![image_7_1](https://doc2markdown.com/images/20260526/7afc36d5-b742-47a6-a126-3bdb334e8fea/page_7/image_7_1.png)


流程图：流程节点配置请参考《流程配置宝典》
特权人：设置流程模板特权人，特权人可以处理流程流转过程中出现的异常，建议设置为系统管理员。
权限


![image_8_1](https://doc2markdown.com/images/20260526/7afc36d5-b742-47a6-a126-3bdb334e8fea/page_8/image_8_1.png)


配置项说明如图所示，可根据实际需要进行设置，通常放空即可。
第四步：集成开发，实现流程审批功能
至此，所有配置工作都已完成，接下来需要进入功能开发阶段。开发内容分为后端集成、前端集成两部
分。
后端集成
BPM提供给业务系统使用的SOAP接口地址如下，详细方法清单见附录1。
测试环境：http://bpmtest.xiamenair.com.cn/bpm/sys/webservice/flowWebService?wsdl
生产环境：http://bpm.xiamenair.com.cn/bpm/sys/webservice/flowWebService?wsdl
要实现最基础的流程创建和审批功能，后端需要调用BPM的CreateProcess、ApproveProcess方
法。
如何调用SOAP接口
请参考Spring Boot示例：Getting Started | Consuming a SOAP web service
调用CreateProcess方法，实现流程创建接口
后端调用CreateProcess需要解析输出结果，判断是否创建成功，如果创建成功，则返回流程实例ID。如
果创建失败，则返回错误信息。CreateProcess接口说明如下：


![image_9_1](https://doc2markdown.com/images/20260526/7afc36d5-b742-47a6-a126-3bdb334e8fea/page_9/image_9_1.png)


参数 参数类型 参数描述
flowTemplateId 字符 可为空| 流程模板ID。
串 (String) 【注】当业务表单对应多个流程模板时需要此参数，此时BPM引擎
直接通过此参数创建流程实例。若该参数为NULL或“”时，需通过参
数formId关联获取相应的流程模板ID。
formId JSON字符串 必填| 异构系统表单模板信息，JSON格式，由以下几个值组成：
（String） 1) 系统标识（sysId），必填
2) 业务模块标识（modelId），必填
3) 业务表单模板标识（templateFormId），必填
4) 业务表单实例标识（formInstanceId），必填
【注】当flowTemplatId为空时，LBPM引擎将根据当前参数获取相
应的流程模板ID。
creator JSON字符 必填| 创建者的登录名（工号），JSON格式。
串 (String) 例如：{"LoginName":"test002"}
exParam JSON字符 必填| 扩展参数，传递流程需要的特定表单信息，JSON格式。
串 (String) 例如：{“docSubject”: “”}
【注】表单的标题不能为空。
language 字符串 可为空| 语种。
（String） 【注】若为NULL或“”时，则默认为中文（zh_CN）。
输出 字符串 成功：“T：流程实例ID”
（String） 失败：“F：错误信息”
调用ApproveProcess方法，实现审批流程接口
ApproveProcess接口说明如下：
参数 参数类型 参数描述
formId JSON字符串 必填| 异构系统表单实例信息，JSON格式，由以下几个值组成：
（String） 1) 系统标识（sysId），必填
2) 业务模块标识（modelId），必填
3) 业务表单模板标识（templateFormId），必填
4) 业务表单实例标识（formInstanceId），必填
processId 字符串 (String) 可为空| 流程实例标识。
【注】若此参数为NULL或“”时，通过参数formId去查找相应的流
程实例；否则，直接通过此参数获取相应的流程实例。
handler JSON字符 必填| 当前操作用户登录名（工号），JSON格式。
串 (String) 例如：{"LoginName":"test002"}
formData JSON字符 可为空|当前可先忽略。
串 (String)
processParam JSON字符 必填| 运行时流程审批数据，JSON格式。
串 (String) 该参数是前端通过BPM提供的js回调方法获取，
language 字符串 可为空| 语种。
（String） 【注】若为NULL或“”时，则默认为中文（zh_CN）。
输出 字符串 成功：“T”
（String） 失败：“F：错误信息”


前端集成
业务系统前端需要通过iframe嵌入BPM审批页面的方式实现集成。BPM审批页面的地址如下：
测试环境：
http://bpmtest.xiamenair.com.cn/bpm/sys/lbpmservice/support/lbpm_process/lbpmProcess.do?
method=viewProcess&fdId=流程实例ID
https://bpmtestssl.xiamenair.com.cn/bpm/sys/lbpmservice/support/lbpm_process/lbpmProcess.do?
method=viewProcess&fdId=流程实例ID
生产环境：
http://bpm.xiamenair.com.cn/bpm/sys/lbpmservice/support/lbpm_process/lbpmProcess.do?
method=viewProcess&fdId=流程实例ID
https://bpmssl.xiamenair.com.cn/bpm/sys/lbpmservice/support/lbpm_process/lbpmProcess.do?
method=viewProcess&fdId=流程实例ID
注意
http和https的域名不同，请根据你的网站协议使用相应的地址！！！
前端功能描述
1. 用户点击申请，进入申请页面
2. 进入页面时调用后端创建流程接口，获取流程实例ID，加载审批页面iframe，完成流程页面初始化。
3. 用户填写好申请信息，点击提交按钮，调用后端审批流程接口，完成申请
WEB端集成要点
1. 需要在前端项目中引用domain.js。建议下载至本地，离线引用。
//index.html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<link rel="icon" href="<%= BASE_URL %>favicon.ico">
<title>BPM集成演示</title>
//引入项目中的domain.js
<script src="<%= webpackConfig.output.publicPath %>domain.js"></script>
</head>
<body>
<noscript>
<strong>We're sorry but default doesn't work properly without JavaScript enabled.
Please enable it to continue.</strong>
</noscript>
<div id="app"></div>
<!-- built files will be auto injected -->


</body>
</html>
2. 创建流程
//嵌入bpm页面，动态计算url
<iframe v-if="bpmUrl" id="bpm" :src="bpmUrl" style="width: 100%;height: 600px;"></iframe>
//动态计算流程页面url
computed: {
bpmUrl() {
if (!this.$data.form.processId) return null;
return
"http://bpmtest.xiamenair.com.cn/bpm/sys/lbpmservice/support/lbpm_process/lbpmProcess.do?
method=viewProcess&fdId=" + this.$data.form.processId;
}},
//进入页面后调用初始化流程方法，创建流程，获得流程id
mounted() {
if (this.$route.params.id) {
if (!this.$data.form.processID) {
this.initProcess(this.$route.params.id)
}}
},
//调用后端创建流程接口，得到流程实例ID
methods:{
initProcess(id) {
this.$http.post('../request/init/' + id + '?staffId=' + this.staffId).then(res
=> {
this.$data.form = res.data.content;
})
}
}
3. 刚创建的流程状态为“草稿”，仍在起草节点，需要创建人提交审批之后流程才会开始流转。因此，你
还需要实现提交按钮，使用domain.js提供的方法获取流程审批的参数，作为后端审批流程接口的入
参，完成审批。
<mf-button type="primary" @click="onSubmit">提交</mf-button>
async onSubmit() {
//获取bpm页面容器
let f_bpm = document.getElementById("bpm");
//调用lbpm_getApprovalData方法获取审批参数
domain.call(f_bpm.contentWindow, "lbpm_getApprovalData", [], async data => {
//调用后端审批流程接口完成流程提交，在此之前你可根据实际需要校验data。
this.$http.post('../request/approve?staffId=' + this.staffId, { requestForm:
JSON.stringify(this.$data.form), processParam: data })
.then(res => {
if (res.data.code == 0) {


//审批成功后的工作，一般是关闭页面，或者返回上一层路由
this.back()
}}).catch(err => {
alert(err)
})})
}
4. 以上实现的申请人创建并提交流程的功能。其节点处理人的审批功能实现跟第3点描述的相同。
移动端集成要点
1. 同样地，需要在项目中引用domain.js。
2. 嵌入的页面地址与web端不同，具体如下：
页面 使用场 地址（使用时请加上域名）
名称 景
流程 创建流 /bpm/sys/lbpmservice/support/lbpm_process/lbpmProcess.do?
创建 程审批 type=mobile&method=editProcess&fdId={流程ID}
流程 显示流 /bpm/sys/lbpmservice/support/lbpm_process/lbpmProcess.do?
记录 程审批 method=viewProcess&fdId={流程实例
意见记 ID}&type=mobile&styleType=showAuditNote
录
流程 流程审 /bpm/sys/lbpmservice/support/lbpm_process/lbpmProcess.do?
审批 批 type=mobile&method=viewProcess&fdId={流程实例ID}&styleType=new
3. 创建流程，进入审批页面
//流程操作页面的容器，初始化隐藏，直到用户点击下一步在现实流程审批组件。
<div id="flowFormDiv">
<iframe
scrolling="no"
id="flowIFrame"
height="0px;"
style="z-index: 9999; border-width: 0; width: 100%"
></iframe>
</div>
//进入到流程提交页面的底部按钮
<div class="bottom-tool" v-if="showBar">
<van-button type="info" gradient native-type="clickProcess">{{ $t("下一步") }}</van-
button>
</div>
//建议页面加载时就初始化流程
async initProcess() {
//调用创建流程接口，创建流程实例，获得流程实例ID，用于拼接bpm创建流程操作页面
this.reviewForm.processId = res.content.id;
},


//下一步按钮点击事件
clickProcess() {
this.loadingProcess = true;
//初始化流程Iframe
this.initProcessIframe(this.reviewForm.processId);
//打开流程操作页面
this.openMobileProcess();
//隐藏底部工具条
this.showBar = false;
//防止页面偏移，滚至顶部，让流程页面
setTimeout(() => {
this.loadingProcess = false;
document.body.scrollTop = document.documentElement.scrollTop = 0;
}, 1000);
},
//初始化流程Iframe，
initProcessIframe(flowId) {
setTimeout(function () {
var url = process.env.VUE_APP_BPM_PATH +
"/bpm/sys/lbpmservice/support/lbpm_process/lbpmProcess.do?
type=mobile&method=editProcess&fdId=" + flowId
$("#flowIFrame").attr("src", url);
$("#flowFormDiv").css({
"height": '100vh !important',
})
}, 200);
}
//打开BPM流程操作页面
openMobileProcess(){
var ffdiv = $("#flowFormDiv");
ffdiv.show();
ffdiv.css("width", "100%");
ffdiv.css("-webkit-overflow-scrolling", "touch");
ffdiv.css("overflow", "scroll");
$("#flowFormDiv").css({
"height": '100vh !important',
"position": 'absolute',
'left': '0px',
'top': '0px'
})
$("body").css("overflow", "hidden");
$("#flowIFrame").css("height", $(window).height());
$("#flowIFrame").css("width", $(window).width());
document.body.scrollTop = document.documentElement.scrollTop = 0
}
4. 监听审批页面中的点击返回、或者确定的操作，并做出相应的处理。若点击返回按钮，则关闭审批组
件，返回表单；若点击确定，则使用lbpm_getApprovalData方法获取审批参数，再调用后端审批流
程接口完成审批。


//在组件创建后，或者页面加载后注册事件监听。
created() {
//监听用户点击后退按钮，隐藏BPM流程操作页面
domain.register("buz_backFlowZone", this.buz_backFlowZone);
//监听用户点击确认按钮，获取流程处理参数，调用ApproveProcess接口完成流程提交。
domain.register("buz_hideFlowZone", this.buz_hideFlowZone);
},
//隐藏流程页面
buz_backFlowZone(){
this.showBar = true;
$("#flowFormDiv").hide();
$("#flowFormDiv").css("height", "0");
$("body").css("overflow", "auto");
}
//处理流程点击确认事件
buz_hideFlowZone(){
var f_bpm = document.getElementById("flowIFrame");
domain.call(f_bpm.contentWindow,"lbpm_getApprovalData",[],
async data => {
//调用ApproveProcess接口提交流程，跟Web一样，可以参考web端的编码
//例如：
let res = await request({
url: "/api/process/approve/" + this.reviewForm.processId,
method: "POST",
data: JSON.parse(data)
});
if(res.code===200){//提交审批成功
//TODO...
}else{//提交审失败
//TODO...
}
}
);
}
至此，您已成功集成BPM流程引擎并实现了基础的流程创建与审批功能。为了更好满足实际业务场景的
需求，建议您进一步阅读下一章《常见进阶用法》，深入了解流程配置的扩展方法与高级功能。
2. 进阶用法
场景1：根据业务数据决定流程走向
需求：作为考勤管理员，我希望员工请假天数大于2天时需要部门领导审批，小于等于2天时仅需本单位领导审
批，以符合请假审批管理规范。
想要实现这个需求，你需要让BPM能获取到用户填写的数据，并在流程模板中使用条件分支节点，基于
表单值控制流程走向，详细实现步骤如下：


第一步：开发BPM回调接口
开发并部署以下两个接口，可以点击查看接口规范。
BPM流程引擎使用教程 > getFormFieldList ：该接口用户声明某个业务表单模板的字段定义。在配置流
程模板关联的业务表单字段时会调用该接口，保存配置后BPM将保存字段ID、所属表单模板ID，所属模
块ID。
BPM流程引擎使用教程 > getFormFieldValueList ：流程实例在流转中如果有使用到配置的业务表单字段
时，BPM会调用该接口传入模块ID、表单模板ID、表单实例ID和字段ID以获取字段值。
第二步：配置对接系统服务
配置对接系统-获取业务表单字段接口，即getFormFieldList。
配置对接系统-获取业务表单字段值接口，即getFormFieldValueList。
第三步：配置流程模板
配置表单字段。
添加条件分支节点。


![image_16_1](https://doc2markdown.com/images/20260526/7afc36d5-b742-47a6-a126-3bdb334e8fea/page_16/image_16_1.png)


![image_16_2](https://doc2markdown.com/images/20260526/7afc36d5-b742-47a6-a126-3bdb334e8fea/page_16/image_16_2.png)


![image_16_3](https://doc2markdown.com/images/20260526/7afc36d5-b742-47a6-a126-3bdb334e8fea/page_16/image_16_3.png)


配置条件分支的流转公式，使用表单字段值进行判断。
提示
1. BPM的公式定义器支持基础的JAVA语法。
2. BPM提供了自带的字段和通用函数，如果使用自带的字段能满足需求，则建议不使用自定义的
表单字段。


![image_17_1](https://doc2markdown.com/images/20260526/7afc36d5-b742-47a6-a126-3bdb334e8fea/page_17/image_17_1.png)


![image_17_2](https://doc2markdown.com/images/20260526/7afc36d5-b742-47a6-a126-3bdb334e8fea/page_17/image_17_2.png)


3. 自定义表单字段数量不宜过多，这是因为加载流程页面时BPM会逐个查询表单字段值，表单字
段数量过多会导致页面加载耗时过长。如果表单数量过多，那么建议将多个字段封装为一个对
象字段，取值时使用JAVA解析JSON字符串。
场景2：动态设置流程审批人
需求：作为考勤管理员，我希望请假流程值班经理节点的处理人根据值班表自动设置，以实现审批任务的自动分
配，减少人工操作成本。
当BPM组织架构选择器中人员、岗位、群组、角色线均无法满足你配置流程审批人的需求时，你就需要
使用公式定义器按照业务逻辑去设置流程审批人。动态设置流程审批人的实现方式有以下两种。
方案1：解析表单字段值（审批人工号），使用函数计算审批人。
首先，你需要参考场景一配置表单字段，将审批人通过表单字段值传递给BPM。然后再使用公式定义器
配置审批人，参考配置代码如下。
import java.util.ArrayList;
ArrayList rtnList = new ArrayList(); //初始化空集合，用于存放处理人对象
String localstr = $creator$; //接受表单字段值
String[] strs = localstr.split(",") ;
for (int i = 0 ; i <strs.length ; i++ ) {
rtnList.add($组织架构.根据登录名取用户$(strs[i])); //使用内置的函数获取处理人对象
}
return rtnList;
方案2：调用业务系统接口查询审批人
有时候业务表单数据中并没有审批人工号信息，而是需要通过复杂的查询计算才能得出审批人，例如上
述需求，审批人需要从值班表获取。此时，就可以使用函数“$扩展公式.设置当前节点处理人$(节点ID,节
点名称)”调用业务系统接口获取审批人。实现步骤如下。
第一步：开发BPM回调接口


![image_18_1](https://doc2markdown.com/images/20260526/7afc36d5-b742-47a6-a126-3bdb334e8fea/page_18/image_18_1.png)


BPM流程引擎使用教程 > getBusinessOrg：动态设置某个节点的处理人。在公示定义器中扩展公式—设
置当前节点处理人方法会调用该接口设置节点的处理人。
第二步：配置对接系统服务
配置对接系统-获取业务表单字段接口，即getBusinessOrg。
第三步：配置节点处理人
使用扩展公式——设置当前节点处理人函数设置处理人，该函数接口2个字符串参数，分别是
getBusinessOrg接口的入参，nodeId和nodeName。
场景3：流程通过后自动执行业务逻辑
需求：作为请假员工，我希望在我的请假申请审批通过后，不仅能收到通知，我的个人考勤日历也能自动更新，
让我能清晰地看到已被批准的假期安排，方便我规划工作。
BPM本身无业务逻辑，面对这种依赖于流程状态的需求，BPM提供了“监听流程状态+回调业务系统方法”
的功能，用于实现当流程进入指定状态后调用业务系统的方法执行业务逻辑。要实现上述需求，那么就
需要在流程结束节点配置监听“流程结束事件”，以及要执行的业务方法。实现步骤如下。
第一步：开发BPM回调接口
BPM流程引擎使用教程 > getMethodInfo：用于用户配置流程事件监听器时使用，选择逻辑方法。在流
程运转过程中，会根据配置的事件调用doMethodProcess接口，执行业务系统的逻辑方法。
BPM流程引擎使用教程 > doMethodProcess：在流程事件触发配置的监听器，监听器调用此业务事件统
一调用接口，触发相应的业务逻辑。
第二步：配置对接系统服务


![image_19_1](https://doc2markdown.com/images/20260526/7afc36d5-b742-47a6-a126-3bdb334e8fea/page_19/image_19_1.png)


![image_19_2](https://doc2markdown.com/images/20260526/7afc36d5-b742-47a6-a126-3bdb334e8fea/page_19/image_19_2.png)


第三步：配置节点事件
1. 打开节点配置窗口、选择事件页签，点击添加按钮。
2. 选择事件类型，选择侦听器类型（默认选择厦航事件监听器）
3. 配置事件要执行的业务方法，点击选择，选中关联的业务表单模板后，事件配置页面将加载可选的时
间列表。
4. 选择要执行的业务方法，点击确定完成配置。


![image_20_1](https://doc2markdown.com/images/20260526/7afc36d5-b742-47a6-a126-3bdb334e8fea/page_20/image_20_1.png)


![image_20_2](https://doc2markdown.com/images/20260526/7afc36d5-b742-47a6-a126-3bdb334e8fea/page_20/image_20_2.png)


![image_20_3](https://doc2markdown.com/images/20260526/7afc36d5-b742-47a6-a126-3bdb334e8fea/page_20/image_20_3.png)


提示
1. BPM提供了很多事件类型，请结合实际需求选择合适的事件。常用的有节点进入事件（获
取节点审批人更新业务表单权限）、流程结束事件（更新表单状态，执行业务结束的逻
辑）、流程废弃事件（更新表单状态，执行业务结束的逻辑）。
2. 当回调事件方法执行异常时，流程将报错并通过待阅通知流程特权人，需要修复回调方法
后，使用特权人权限重试触发事件。
场景4：需要发起子流程（子流程表单与主流程表单不一致）
需求：作为考勤管理员，我希望当员工请假涉及出国旅行时，需要自动发起出国申请流程，并通过出国申请流程
后才能通过请假流程，已实现合规管理，减少人工遗漏操作。
因为出国申请的表单与请假流程的表单不一样，所以需要在请假父流程中自动发起出国申请子流程，而
不是只在请假流程中增加审批节点。详细实现步骤如下：
第一步：子流程功能开发和流程模板配置


![image_21_1](https://doc2markdown.com/images/20260526/7afc36d5-b742-47a6-a126-3bdb334e8fea/page_21/image_21_1.png)


因为父子流程本质是一样的，所以你需要先按上文所说的方法开发子流程功能。差别在于子流程是有
BPM自动创建，可以不实现用户创建子流程的功能。
第二步：开发父流程回调方法，用于初始化子流程
BPM调用业务系统方法时，会传入流程参数processData，具体查看BPM流程引擎使用教程 >
doMethodProcess接口说明。启动子流程节点结束事件调用接口时还会传入子流程实例ID，你需要做的
是初始化子流程表单数据，建立子流程表单和流程实例关系，并按以下格式返回给BPM。
如果成功，则需要返回：
T:[{processId:"子流程实例ID，不可为空",formInstanceId:"子流程表单实例ID，不可为
空",docSubject:"子流程标题，可为空",exParam:"扩展参数，JSON字符串，可为空"}]
如果失败，则必须返回：
F:失败信息（注意：失败信息会展示在流程页面，建议返回完善的错误信息，以便排查问题）
第三步：配置父流程模板
在父流程模板中添加“启动子流程”和“回收子流程”节点，两个节点需要串联，中间可添加其他节点。如下
图所示：
然后再分别配置两个节点
启动子流程节点配置要点
1. 基本-子流程：选择需要启动的子流程模板
2. 基本-启东人身份：即设置子流程起草人，默认是主流程的起草人，另外支持手动设置或通过公式定
义器计算起草人。
3. 基本-启动选项：设置子流程的启动数量。
4. 基本-子流程异常：设置子流程异常是否通知主流程特权人和起草人
5. 事件：必须添加“节点结束事件”监听器，执行第二步实现的回调方法。
回收子流程节点配置要点
1. 基本-回收子流程：设置要回收那个子流程节点。
2. 基本-回收规则：设置什么时候回收子流程，让主流程继续流转。
小结


![image_22_1](https://doc2markdown.com/images/20260526/7afc36d5-b742-47a6-a126-3bdb334e8fea/page_22/image_22_1.png)


通过学习1. 快速开始和2. 进阶用法，你应该已经全面掌握了BPM核心用法，能够应对各种复杂的流程管
理需求。如果有更多复杂的需求，你可以先查看BPM提供的对外服务4.2 BPM接口契约（标准产品接
口）是否能够满足。
3. 常见问题
Q1. 流程流转异常（流程页面中有显示异常信息）
大多情况是因为业务系统获取表单字段值、事件回调或计算审批人接口发生异常（未按契约返回数据给
BPM），需要先定位是否为接口异常，如果是接口异常，那么需要修复后再用特权人操作重试。如果确
定不是业务系统接口异常，再联系BPM系统负责人排查。
Q2. 审批流程异常
（F:A JSONArray text must start with '[' at character 1 of N）
可能原因1：前端lbpm_ getApprovalData方法获取流程审批参数异常，遇见过的情况是用户单点登录
已经过期，但页面未刷新，用户继续点击提交审批时无法获取审批参数。
可能原因2：表单变量值获取接口返回结果为空或异常。
Q3. 审批流程异常（F:任务taskId:xxx, activityType:reviewWorkitem
不是用户name:xxx的任务)
原因是调用审批接口传入的处理人工号不是当前流程实际处理人的工号。排查思路，先刷新页面确认当
前处理人，对比审批参数中的工号，是否一致。
Q4. 审批流程异常（F:流程定义不完整)
问题分析：这个案例是第三方系统通过接口获取审批参数，用户没有在前端操作，导致起草节点必须修
改的节点没有被修改，所以流程定义不完整。 N2节点必须修改N11节点的处理人，但上方这个定义并没
有设置N11的处理人。
https://bpm.xiamenair.com.cn/bpm/sys/lbpmdocking/lbpm_docking_exchange_log/lbpmDockingExchan
geLog.do?method=view&fdId= 181d27ea7071ab20a2696d14300a252a
4. 附录
4.1 业务系统接口契约
getTemplateFormList
用于获取业务表单模板，配置表单模板时需调用的业务方法。在 流程模板设置“缺省对接表单模板”，或
者节点属性 >> 高级上设置“绑定表单模板”时，通过选择业务系统->业务模块 ->表单模板 步骤来选择关
联表单。
参数 参数类型 参数描述
sysId 字符串 必填| 业务系统标识（在第二步配置对接系统时定义）。如果你的接口
（String） 是多个业务系统公用，那么你可以根据sysId返回相应业务系统的数据
language 字符串 可为空| 语种。
（String） 【注】若为NULL或“”时，则默认为中文（zh_CN）。


参数 参数类型 参数描述
输出 JSON字符串 业务表单模板列表信息，JSON数组。格式如下：
（String）
[
{
"modelId": "业务模块ID",
"modelName": "业务模块名",
"templateFormId": "表单模板ID",
"templateFormName": "表单模板名",
"formUrl": "门户待办跳转的地址"
}
]
配置示意图：
getFormFieldList
用于获取业务表单相关字段。用于配置流程参数与业务表单字段的映射关系，在流程运转过程中，由业
务系统把业务数据传递给BPM（通过接口getFormFieldValueList），BPM通过此映射关系自动填充流程
参数的值为映射的业务表单字段值。
参数 参数类型 参数描述
sysId 字符串（String） 必填| 异构系统标识。
modelId 字符串（String） 可为空| 异构系统模块标识。
templateFormId 字符串（String） 必填| 异构系统表单模板标识。
language 字符串（String） 可为空| 语种。
【注】若为NULL或“”时，则默认为中文（zh_CN）。
输出 JSON字符串 业务表单字段列表信息，JSON数组。格式如下：
（String）
[
{
"fieldId": "字段标识",


![image_24_1](https://doc2markdown.com/images/20260526/7afc36d5-b742-47a6-a126-3bdb334e8fea/page_24/image_24_1.png)


参数 参数类型 参数描述
"fieldName": "字段显示名",
"type": "表单字段类型，目前默认只支持String，
Number，Array类型。"
}
]
示例数据如下：
[
{
"fieldId": "order.id",
"fieldName": "主表标识",
"type": "String"
},
{
"fieldId": "detail.name",
"fieldName": "从表名称",
"type": "Array"
}
]
配置示意图：
getFormFieldValueList
获取业务表单字段值调用的业务方法。通过此接口，在流程流转过程中可以动态获取相应的表单字段值
参与流程运转。例如根据表单字段值决定自动决策分支的走向，或者根据表单字段值计算流程处理人
等。
参数 参数类型 参数描述
sysId 字符串（String） 必填| 异构系统标识。
modelId 字符串（String） 可为空| 异构系统模块标识。
templateFormId 字符串（String） 必填| 异构系统表单模板标识。


![image_25_1](https://doc2markdown.com/images/20260526/7afc36d5-b742-47a6-a126-3bdb334e8fea/page_25/image_25_1.png)


参数 参数类型 参数描述
formInstanceId 字符串（String） 必填| 异构系统表单实例标识。
fieldIds 字符串（String） 可为空| 异构系统表单字段标识集合。
【注】字段ID集，以逗号或分号分隔。若此参数为NULL或“”
时，则返回formInstanceId下的所有字段。
language 字符串（String） 可为空| 语种。
【注】若为NULL或“”时，则默认为中文（zh_CN）。
输出 JSON字符串 业务表单字段值信息，JSON格式。格式如下：
（String）
[
{
"fieldId": "字段标识",
"fieldValue": "字段值"
}
]
示例数据如下：
[
{
"fieldId": "order.id",
"fidldValue": "1"
},
{
"fieldId": "deta.name",
"fieldValue": "name1,name2"
}
]
getMethodInfo
用于用户配置流程事件监听器时使用，选择逻辑方法。在流程运转过程中，会根据配置的事件调用
doMethodProcess接口，执行业务系统的逻辑方法。
参数 参数类型 参数描述
sysId 字符串（String） 必填| 异构系统标识。
modelId 字符串（String） 可为空| 异构系统模块标识。
templateFormId 字符串（String） 必填| 异构系统表单模板标识。
language 字符串（String） 可为空| 语种。
【注】若为NULL或“”时，则默认为中文（zh_CN）。
输出 JSON字符串 业务表单逻辑方法列表信息，JSON数组。格式如下：
（String）
[
{
"functionId": "逻辑方法标识",
"functionName": "逻辑方法显示名",
"functionDes": "逻辑方法详细描述，包括功能描述"


参数 参数类型 参数描述
}
]
【注】若逻辑方法显示名为NULL或“”，则会以逻辑方法详细
描述作为逻辑方法显示名。
示例数据如下：
[
{
"functionId": "updateStatus",
"functionName": "更新表单状态",
"functionDes": "根据流程节点ID更新表单状态"
},
{
"functionId": "abortRequest",
"functionName": "废弃流程，更新状态",
"functionDes": "将表单更新为废弃状态"
}
]
配置示意图：
1、选择事件所属模块-表单


![image_27_1](https://doc2markdown.com/images/20260526/7afc36d5-b742-47a6-a126-3bdb334e8fea/page_27/image_27_1.png)


2、选择业务逻辑方法
doMethodProcess
在流程事件触发配置的监听器，监听器调用此业务事件统一调用接口，触发相应的业务逻辑。
参数 参数类型 参数描述
formId JSON字符串 必填| 异构系统表单实例信息，JSON格式，由以下几个值组
（String） 成：
1) 系统标识（sysId），必填
2) 业务模块标识（modelId），可为空
3) 业务表单模板标识（templateFormId），必填
4) 业务表单实例标识（formInstanceId），必填
示例数据如下：
{
"sysId": "bpm-demo",
"modelId": "qingjia",
"templateFormId": "tiaoxiu",
"formInstanceId":
"8b19b52e9a7b7481019a7b74ce9a0000"
}
functionId 字符串（String） 必填| 调用的函数名。
例如：updateStatus


![image_28_1](https://doc2markdown.com/images/20260526/7afc36d5-b742-47a6-a126-3bdb334e8fea/page_28/image_28_1.png)


参数 参数类型 参数描述
processData JSON字符串 必填| 流程实例ID和流程节点实际ID，JSON格式。格式如
（String） 下：
{
"processId": "流程实例标识",
"nodeFactId":"节点实际ID",
"subProcess":"子流程实例ID"
}
language 字符串（String） 可为空| 语种。
【注】若为NULL或“”时，则默认为中文（zh_CN）。
输出 字符串（String） 成功：“T”
失败：“F：错误信息”
getBusinessOrg
动态设置某个节点的处理人。在公示定义器中扩展公式—设置当前节点处理人方法会调用该接口设置节
点的处理人。
参数 参数类型 参数描述
sysId 字符串（String） 必填| 异构系统标识。
modelId 字符串（String） 可为空| 异构系统模块标识。
templateFormId 字符串（String） 必填| 异构系统表单模板标识。
formInstanceId 字符串（String） 必填| 异构系统表单实例标识。
nodeId 字符串（String） 流程配置函数的入参，扩展公式.设置当前节点处理人
("nodeId","nodeName")
nodeName 字符串（String） 流程配置函数的入参，扩展公式.设置当前节点处理人
("nodeId","nodeName")
输出 JSON字符串 根据入参计算返回处理人信息，JSON数组。格式如下：
（String）
[
{
"LoginName": "处理人工号"
}
]
示例数据如下：
[
{
"LoginName": "28603"
},
{
"LoginName": "34088"
}
]


配置示意图：
synchronizeTemplate
流程模板同步时，异构系统在此时可能会同步更新业务表单权限配置。业务表单权限常常与流程的节
点、处理人的身份有千丝万缕的联系，在LBPM流程建模时需同步配置和更新相应的信息，故需通过此
接口来完成。
参数 参数类型 参数描述
sysId 字符串（String） 必填| 异构系统标识。
flowDefinitionId 字符串（String） 必填| 流程定义标识。
flowTemplateId 字符串（String） 必填| 流程模板标识。
operationType JSON字符串 必填| 流程模板操作类型和产生变化的节点标识集合，
（String） JSON格式。
格式如下：
{
// 操作类型：
// add：流程定义产生新版本
// update：流程定义不变
// delete：删除流程模板
“operationType”: "流程模板操作类型",
“operationNodes”:“变更的节点集合”
}


![image_30_1](https://doc2markdown.com/images/20260526/7afc36d5-b742-47a6-a126-3bdb334e8fea/page_30/image_30_1.png)


language 字符串（String） 可为空| 语种。
【注】若为NULL或“”时，则默认为中文（zh_CN）。
输出 字符串（String） 成功：“T”
失败：“F：错误信息”
3.6.3接口样例
举例：
一、flowDefinitionId有变化：
{
"operationType"："add"，
“operationNodes”："N1，N2，N4"
}
二、flowDefinitionId没有变化：
{
"operationType”："update"，
"operationNodes”："N1，N2，N4"
}
三、删除模板
{
"operationType"："delete"，
"operationNodes"：""
}
3.6.4使用场景
(cid:0)业务功能：新建流程模板配置业务表单字段权限设置。
(cid:0)功能描述：流程模板配置时，业务表单字段权限配置可能与流程信息有关。
A.新建流程模板，通过节点进入业务表单字段授权配置，需初步记录相关的权限配置。
B.流程模板保存时，触发流程模板保存事件，同时调用此接口同步流程模板更新信息。
C.删除流程模板时，触发流程模板删除事件，同时调用此接口同步删除相应的业务表单字段授权配置。
4.2 BPM接口契约（标准产品接口）
正式环境服务地址：
http://bpm.xiamenair.com.cn/bpm/sys/webservice/flowWebService?wsdl
https://bpmssl.xiamenair.com.cn/bpm/sys/webservice/flowWebService?wsdl
测试环境服务地址：
http://bpmtest.xiamenair.com.cn/bpm/sys/webservice/flowWebService?wsdl
https://bpmtestssl.xiamenair.com.cn/bpm/sys/webservice/flowWebService?wsdl
CreateProcess


参数 参数类型 参数描述
flowTemplateId 字符 可为空| 流程模板ID。
串 (String) 【注】当业务表单对应多个流程模板时需要此参数，此时BPM引擎
直接通过此参数创建流程实例。若该参数为NULL或“”时，需通过参
数formId关联获取相应的流程模板ID。
formId JSON字符串 必填| 异构系统表单模板信息，JSON格式，由以下几个值组成：
（String） 1) 系统标识（sysId），必填
2) 业务模块标识（modelId），必填
3) 业务表单模板标识（templateFormId），必填
4) 业务表单实例标识（formInstanceId），必填
【注】当flowTemplatId为空时，LBPM引擎将根据当前参数获取相
应的流程模板ID。
creator JSON字符 必填| 创建者的登录名（工号），JSON格式。
串 (String) 例如：{"LoginName":"test002"}
exParam JSON字符 必填| 扩展参数，传递流程需要的特定表单信息，JSON格式。
串 (String) 例如：{“docSubject”: “”}
【注】表单的标题不能为空。
language 字符串 可为空| 语种。
（String） 【注】若为NULL或“”时，则默认为中文（zh_CN）。
输出 字符串 成功：“T：流程实例ID”
（String） 失败：“F：错误信息”
用于创建流程实例。
ApproveProcess
参数 参数类型 参数描述
formId JSON字符 必填| 异构系统表单实例信息，JSON格式，由以下几个值组成：
串 1) 系统标识（sysId），必填
（String） 2) 业务模块标识（modelId），必填
3) 业务表单模板标识（templateFormId），必填
4) 业务表单实例标识（formInstanceId），必填
processId 字符 可为空| 流程实例标识。
串 (String) 【注】若此参数为NULL或“”时，通过参数formId去查找相应的流程实
例；否则，直接通过此参数获取相应的流程实例。
handler JSON字符 必填| 当前操作用户登录名（工号），JSON格式。
串 (String) 例如：{"LoginName":"test002"}
formData JSON字符 可为空| 运行时表单数据，JSON格式。
串 (String) 格式：{“表单字段ID”: “表单字段数值”}
例如：
{order.id:””,//基本数据类型（主表数据）
deta.name:”name1,,name2,”}//数组类型（从表数据）
【注】当此参数为空时，BPM会通过异构系统必须实现的接口获取相
应的字段值。
由于从表字段值是数组，请使用“，”进行分隔；如果数组中有空值的


参数 参数类型 参数描述
话，请使用“，，”表示；若数组结尾数据为空，则数组结尾以“，”结
束。|
processParam JSON字符 必填| 运行时流程审批数据，JSON格式。
串 (String) 该参数是前端通过BPM提供的js回调方法获取。注意：提交意见的同
时可以上传附件，附件的存储有两种方式，一种是直接使用LBPM提
供的嵌入式页面中提供的附件上传功能，附件交由LBPM自己管理，
此时auditNoteAttachments参数可以忽略；另外一种方式是由异构系
统方提供上传附件功能，这种方式只允许存储在异构系统方，此时
auditNoteAttachments参数是需要提供之,，如下所示。
"auditNoteAttachments": [
{
"attId": "附件唯一标识",
"attName": "附件名称",
"attUrl": "附件地址"
},
{
"attId": "附件唯一标识",
"attName": "附件名称",
"attUrl": "附件地址"
}
]
language 字符串 可为空| 语种。
（String） 【注】若为NULL或“”时，则默认为中文（zh_CN）。
输出 字符串 成功：“T”
（String） 失败：“F：错误信息”
用户审批流程。嵌入BPM提供的审批页面时，业务系统调用审批页面lbpm_getApprovalInfo方法，获取
流程审批页面信息，调用此接口实现审批。。
CanApprovalProcess
参数 参数类型 参数描述
formId JSON字符串 必填| 异构系统表单实例信息，JSON格式，由以下几个值组
（String） 成：
1) 系统标识（sysId），必填
2) 业务模块标识（modelId），可为空
3) 业务表单模板标识（templateFormId），必填
4) 业务表单实例标识（formInstanceId），必填
actionUid JSON字符串 (String) 必填| 当前操作用户登录名，JSON格式。
例如：{"LoginName":"test002"}
language 字符串（String） 可为空| 语种。
【注】若为NULL或“”时，则默认为中文（zh_CN）。
输出 字符串（String） 是当前审批人员：“T：true”
不是当前审批人员：“T：false”
抛出异常时：“F”
用于判断登录用户是否有审批权限，通常在进入流程页面时调用查询，以实现权限控制。


IsExistProcess
参数 参数类型 参数描述
formId JSON字符串 必填| 异构系统表单实例信息，JSON格式，由以下几个值组
（String） 成：
1) 系统标识（sysId），必填
2) 业务模块标识（modelId），可为空
3) 业务表单模板标识（templateFormId），必填
4) 业务表单实例标识（formInstanceId），必填
language 字符串（String） 可为空| 语种。
【注】若为NULL或“”时，则默认为中文（zh_CN）。
输出 字符串（String） 成功：“T：流程processId”
失败：“F：错误信息”
该接口主要用在业务表单保存，创建流程实例的时候，如果业务表单多次执行暂存操作，那么可能需要
调用接口判断该业务表单实例是否已经创建了流程实例，或者在删除业务表单实例时，需要调用该接口
检测业务表单实例是否在BPM中是否有流程实例与之关联。
GetUnApprovingLists
参数 参数类型 参数描述
actionUid JSON字符串 (String) 必填| 当前操作用户的登录名，JSON格式。
例如：{"LoginName":"test002"}
conditions JSON字符串 (String) 可为空，json对象。
docSubjetc可为空| 流程实例主题（模糊查询）
docStatus可为空| 流程状态
草稿：10
驳回：11
撤回：12
流转中：20
流程出错：21
sysId可为空| 系统标识
例如：{"docSubject": "test", "sysId", "hr"}
pageNo 字符串（String） 可为空| 起始页数，默认为1。
pageSize 字符串（String） 可为空| 每页的记录数，默认为20。
language 字符串（String） 可为空| 语种。
【注】若为NULL或“”时，则默认为中文（zh_CN）。
输出 JSON字符串（String） 当前处理人待审流程列表清单，JSON数组。格式如下：
T:{
"page": {
"totalSize": 6,
"pageSize": 1,
"currentPage": 1


参数 参数类型 参数描述
},
"datas": [
{
"processId": "流程唯一标识",
"docSubject": "流程实例标题",
"templateName": "流程模板名",
"templateId": "流程模板标识",
"creatorUid": "流程创建者登陆名",
"status": "流程状态",
"createTime": "流程创建时间",
"publishTime": "2022-08-29 20:38",
"sysId": "系统标识",
"modelId": "业务模板标识",
"templateFormId": "业务表单模板标识",
"formInstanceId": "表单实例标识",
"formUrl": "待办链接“
}
]
}
获取当前处理人的待审流程列表清单。通过此接口可以把业务数据与待审流程数据有机结合起来，在业
务系统中呈现。
GetApprovedLists
参数 参数类型 参数描述
actionUid JSON字符串 (String) 必填| 当前操作用户的登录名，JSON格式。
例如：{"LoginName":"test002"}
conditions JSON字符串 (String) 可为空，json对象。
docSubjetc可为空| 流程实例主题（模糊查询）
docStatus可为空| 流程状态
草稿：10
驳回：11
撤回：12
流转中：20
流程出错：21
sysId可为空| 系统标识
例如：{"docSubject": "test", "sysId", "hr"}
status 字符串（String） 可为空| 流程状态
流程发布：30
流程废弃：00
pageNo 字符串（String） 可为空| 起始页数，默认为1。
pageSize 字符串（String） 可为空| 每页的记录数，默认为20。
language 字符串（String） 可为空| 语种。
【注】若为NULL或“”时，则默认为中文（zh_CN）。


参数 参数类型 参数描述
输出 JSON字符串（String） 当前处理人待审流程列表清单，JSON数组。格式如下：
T:{
"page": {
"totalSize": 6,
"pageSize": 1,
"currentPage": 1
},
"datas": [
{
"processId": "流程唯一标识",
"docSubject": "流程实例标题",
"templateName": "流程模板名",
"templateId": "流程模板标识",
"creatorUid": "流程创建者登陆名",
"status": "流程状态",
"createTime": "流程创建时间",
"publishTime": "2022-08-29 20:38",
"sysId": "系统标识",
"modelId": "业务模板标识",
"templateFormId": "业务表单模板标识",
"formInstanceId": "表单实例标识",
"formUrl": "待办链接“
}
]
}
获取当前处理人的已审流程列表清单。通过此接口可以把业务数据与已审流程数据有机结合起来，在业
务系统中呈现。
GetFlowTemplateList
参数 参数类型 参数描述
actionUid JSON字符 可为空| 当前操作用户的登录名，JSON格式。
串 (String) 例如：{"LoginName":"test002"}
【注】当前字段不为空表示需要获取当前操作用户有使用权限并与其关
联的所有流程模板列表；当actionUid为NULL或“”时，则获取全部最新
的流程模板列表。
formId JSON字符串 必填| 异构系统表单模板信息，JSON格式，由以下几个值组成：
（String）
1) 系统标识（sysId），必填
2) 业务模块标识（modelId），可为空
3) 业务表单模板标识（templateFormId），可为空
【注】当modelId为空时，将根据sysId和templateFormId，获取所有最
新流程模板；当modelId和templateFormId均未空时，将根据sysId获取
所有最新流程模板。


参数 参数类型 参数描述
categoryId 字符串 可为空| 流程模板分类ID。
（String）
language 字符串 可为空| 语种。
（String） 【注】若为NULL或“”时，则默认为中文（zh_CN）。
输出 JSON字符串 流程模板列表信息，JSON数组。
（String）
格式如下：
T:[{ “flowTemplateId” : “对接模板ID”,
“flowTemplateName”：“对接模板名称”,
“formUrl”：“表单模板URL”,
“categoryId”: “对接模板所属类别ID”},…]
业务系统根据表单标识，获取与其关联的所有最新流程模板列表。
业务系统根据表单标识，获取当前操作用户有使用权限的所有最新流程模板列表。
业务系统根据流程分类标识，获取指定表单、指定流程分类的最新流程模板列表。
GetTasksInfo
参数 参数类型 参数描述
formId JSON字符串 必填| 异构系统表单实例信息，JSON格式，由以下几个值组成：
（String）
1) 系统标识（sysId），必填
2) 业务模块标识（modelId），可为空
3) 业务表单模板标识（templateFormId），必填
4) 业务表单实例标识（formInstanceId），必填
processId 字符串 (String) 可为空| 流程实例标识。
【注】若此参数为NULL或“”时，通过参数formId去查找相应的流程实
例；否则，直接通过此参数获取相应的流程实例。
handler JSON字符 必填| 当前操作用户登录名，JSON格式。
串 (String)
例如：{"LoginName":"test002"}
language 字符串 可为空| 语种。
（String）
【注】若为NULL或“”时，则默认为中文（zh_CN）。
输出 JSON字符串 当前操作用户可处理的任务信息，JSON数组。
（String）
格式如下：
T:[{


参数 参数类型 参数描述
“taskId”:”任务ID”，
“activityType”:”任务类型”，
“roleName”:”节点名（处理人身份名）”
}]
获取当前操作用户可处理的任务信息。
【注】此接口在不嵌入LBPM引擎提供的审批流程界面时，非常有用。
(cid:0)业务功能：业务表单自定义流程审批页面，获取当前操作用户的可处理任务，输出相应的流程审批信
息。
(cid:0)功能描述：业务表单自定义流程审批页面。
A.通过此接口获取当前操作用户的可处理任务。
B.审批页面中提供个当前操作用户可处理人任务选项。
C.然后根据选择的任务，获取相应的任务操作等信息（不在此接口中获取）。
DeleteProcess
参数 参数类型 参数描述
formId JSON字符串 必填| 异构系统表单实例信息，JSON格式，由以下几个值组
（String） 成：
1) 系统标识（sysId），必填
2) 业务模块标识（modelId），可为空
3) 业务表单模板标识（templateFormId），必填
4) 业务表单实例标识（formInstanceId），必填
language 字符串（String） 可为空| 语种。
【注】若为NULL或“”时，则默认为中文（zh_CN）。
输出 字符串（String） 成功：“T：流程实例ID”
失败：“F：错误信息”
注意：该接口将物理删除流程数据，无法恢复。如需实现取消审批的功能，可使用BPM的废弃功能
（起草人可在流程审批过程中“以起草人身份废弃”），只需在流程结束节点配置废弃事件实现取消申
请的逻辑。
(cid:0)业务功能：删除业务表单
(cid:0)功能描述：删除业务表单的同时删除业务表单实例对应的流程信息。
A.异构系统删除业务表单实例，先根据formId判断是否存在流程实例。
B.若存在流程实例，则调用删除相应的流程实例。


GetCurrentNodesInfo
参数 参数类型 参数描述
formId JSON字符串 必填| 异构系统表单模板信息，JSON格式，由以下几个值组成：
（String）
1) 系统标识（sysId），必填
2) 业务模块标识（modelId），可为空
3) 业务表单模板标识（templateFormId），必填
4) 业务表单实例标识（formInstanceId），必填
【注】当modelId为空时，将根据sysId、templateFormId和
formInstanceId，获取指定业务模块下的所有最新流程实例。
processId 字符串 (String) 可为空| 流程实例标识。
【注】若此参数为NULL或“”时，通过参数formId去查找相应的流程实
例；否则，直接通过此参数获取相应的流程实例。
language 字符串 可为空| 语种。
（String）
【注】若为NULL或“”时，则默认为中文（zh_CN）。
输出 JSON字符串 流程操作列表信息，JSON数组。
（String）
格式如下：
[
{
"taskId": "14ce56eb30b4c8682df421048958b509", // 任务id
"nodeId": "N5", // 节点编号
"nodeName": "审批节点", // 节点名称
"activityType": "reviewNode", //任务类型
"startDate": "2015-04-23 16:39", //节点开始时间
"handlers": "zhangsan;lisi", //节点定义处理人登录名
"handlerNames": "张三;李四", //节点定义处理人名称
"processType": "1", //审批类型
"desc": "",
"destinations": [ // 节点流向
{
"id": "N6",
"name": "人工决策",
"type": "manualBranchNode",
"desc": ""
}
],
"extAttributes": { //扩展属性
"editDocContent": "true",
"sigzq": "true"
},
"workitems": [ //节点实例工作项信息
{


参数 参数类型 参数描述
"taskId": "14ce56eb3c679bc6799233d4a3e817dc",
"activityType": "reviewWorkitem",
"startDate": "2015-04-23 16:39",
"expecterName": "张三",
"expecter": "zhangsan"
},
{
"taskId": "14ce56eb583decede25640c44cba31de",
"activityType": "reviewWorkitem",
"startDate": "2015-04-23 16:39",
"expecterName": "李四",
"expecter": "lisi"
}
]
}
]
(cid:0)此接口提供获取流程当前节点的信息（节点编号、节点名称、开始时间、节点处理人、节点审批类
型、节点描述、节点扩展属性、节点流向和工作项信息）。
GetOperationList
参数 参数类型 参数描述
formId JSON字符串 必填| 异构系统表单模板信息，JSON格式，由以下几个值组成：
（String）
1) 系统标识（sysId），必填
2) 业务模块标识（modelId），可为空
3) 业务表单模板标识（templateFormId），必填
4) 业务表单实例标识（formInstanceId），必填
【注】当modelId为空时，将根据sysId、templateFormId和
formInstanceId，获取指定业务模块下的所有最新流程实例。
processId 字符串 (String) 可为空| 流程实例标识。
【注】若此参数为NULL或“”时，通过参数formId去查找相应的流程实
例；否则，直接通过此参数获取相应的流程实例。
actionUid JSON字符 必填| 当前操作用户的登录名，JSON格式。
串 (String)
例如：{"LoginName":"test002"}
language 字符串 可为空| 语种。
（String）
【注】若为NULL或“”时，则默认为中文（zh_CN）。
输出 JSON字符串 流程操作列表信息，JSON数组。
（String）
格式如下：


见接口样例
(cid:0)此接口提供当前用户可以操作的列表清单。
(cid:0)不同类别的操作集合中的第一个操作，会包含操作相关的其他信息。比如：当前节点审批操作集合的
第一个操作是驳回，则同时会返回能驳回的节点清单。
(cid:0)业务功能：在异构系统展现当前用户可用的操作。
(cid:0)功能描述：在异构系统中展现当前用户哪些可用的操作，并且同时提供给异构系统默认操作的相关参
数信息。比如：驳回的可驳回的节点集合；通过时后续是人工决策分支时后续的节点集合。
T: [
{
"activityType": "reviewWorkitem", // 任务类型
"taskId": "1495f9a4ddef70d69d14f4d4455bbb3e", // 任务Id
"nodeId": "N4", // 当前节点
"expectedName": "张三", // 任务预计处理人姓名
"operations": [
{
"operationType": "drafter_submit", // 操作标识
"operationName": "提交文档", // 操作名称
"operationHandlerType": "handler", // 操作类型（drafter, handler, admin,
historyHandler）
"params": {
"identityList": [ // 提交人身份
{
"id": "149e4df60890789f80525d4456d80df2",
"name": "张三",
"LoginName": "zhangsan"
},
{
"id": "149e4de974dfb7e359124594348a23f6",
"name": "开发工程师（岗位）"
}
],
"manualBranchNodeListByDrafter": [ //在起草节点决定节点走向
{
"id": "N4",
"name": "人工决策",
"type": "manualBranchNode",
"desc": "",
"branchs": [ // 分支节点集合
{
"id": "N5",
"name": "审批节点",
"type": "reviewNode",
"desc": ""
},
{
"id": "N3",
"name": "结束节点",


"type": "endNode",
"desc": ""
}
]
},
{
"id": "N6",
"name": "人工决策",
"type": "manualBranchNode",
"desc": "",
"branchs": [
{
"id": "N7",
"name": "审批节点",
"type": "reviewNode",
"desc": ""
},
{
"id": "N3",
"name": "结束节点",
"type": "endNode",
"desc": ""
}
]
}
]
}
},
{
"operationType": "handler_pass",
"operationName": "通过",
"operationHandlerType": "handler",
"params": {
"manualBranchNodeList": [ // 后续为人工决策时后续节点集
{
"id": "N6",
"name": "审批节点6",
"type": "reviewNode",
"desc": "",
"manualNodeId": "N5",
"manualNodeName": "人工决策",
"manualNodeType": "manualBranchNode"
},
{
"id": "N7",
"name": "审批节点7",
"type": "reviewNode",
"desc": "",
"manualNodeId": "N5",
"manualNodeName": "人工决策",
"manualNodeType": "manualBranchNode"
}
],


"mustModifyHandlerNodeList": [ // 必须修改节点处理人节点集
{
"id": "N6",
"name": "审批节点6",
"type": "reviewNode",
"desc": ""
},
{
"id": "N7",
"name": "审批节点7",
"type": "reviewNode",
"desc": ""
}
],
"canModifyHandlerNodeList": [ // 可修改节点处理人节点集
{
"id": "N8",
"name": "审批节点8",
"type": "reviewNode",
"desc": ""
},
{
"id": "N9",
"name": "审批节点9",
"type": "reviewNode",
"desc": ""
}
]
}
},
{
"operationType": "handler_refuse",
"operationName": "驳回",
"operationHandlerType": "handler"
},
{
"operationType": "handler_commission",
"operationName": "转办",
"operationHandlerType": "handler"
},
{
"operationType": "handler_communicate",
"operationName": "沟通",
"operationHandlerType": "handler"
},
{
"operationType": "handler_abandon",
"operationName": "废弃",
"operationHandlerType": "handler"
}
],
"taskFrom": "workitem"
}


]
GetOperationParam
参数 参数类型 参数描述
formId JSON字符串 必填| 异构系统表单模板信息，JSON格式，由以下几个值组成：
（String）
1) 系统标识（sysId），必填
2) 业务模块标识（modelId），可为空
3) 业务表单模板标识（templateFormId），必填
4) 业务表单实例标识（formInstanceId），必填
【注】当modelId为空时，将根据sysId、templateFormId和
formInstanceId，获取指定业务模块下的所有最新流程实例。
processId 字符 可为空| 流程实例标识。
串 (String)
【注】若此参数为NULL或“”时，通过参数formId去查找相应的流程
实例；否则，直接通过此参数获取相应的流程实例。
actionUid JSON字符 必填| 当前操作用户的登录名，JSON格式。
串 (String)
例如：{"LoginName":"test002"}
operationTypes 字符 必填| 流程操作标识集合，多值，以逗号或分号分隔。
串 (String)
【注】此参数可通过GetOperationList获取。
格式如下：
handler_pass; handler_refuse // 获取通过和驳回的操作参数
taskInfo JSON字符串 可为空| 任务信息。当前用户有多个任务时必填，指定哪个任务的
（String） 操作参数
【注】此参数可通过GetOperationList获取。
格式如下：
{
"taskId": "13b21bccece05f4313fb5524855a621c", // 任务id（来
源：接口GetOperationList返回值中的taskId）
"activityType": "reviewWorkitem" // 任务类型（来源：接口
GetOperationList返回值中的activityType）
}


参数 参数类型 参数描述
language 字符串 可为空| 语种。
（String）
【注】若为NULL或“”时，则默认为中文（zh_CN）。
输出 JSON字符串 流程操作列表信息，JSON数组。
（String）
格式如下：见接口样例
(cid:0)此接口提供流程操作时需要使用的相关参数数据。
(cid:0)不同的操作有不同的参数。比如：驳回的参数有，能驳回的节点清单。
(cid:0)不同的流程上下文也会导致操作参数有些不同。比如：审批节点后续紧跟人工决策分支时，此时通过
操作的参数一定会返回可能的后续节点集合。
T: {
"handler_refuse": { // 驳回标识
"refuseNodeList": [ // 驳回节点集合
{
"id": "N2",
"name": "起草节点",
"desc": "",
"handlerIds": "1183b0b84ee4f581bba001c47a78b2d9",
"handlerNames": "管理员"
}
]
},
"handler_communicate": { // 沟通标识
"communicateScope": [ // 沟通范围
{
"id": "149e4de974dfb7e359124594348a23f6",
"name": "java开发工程师"
},
{


"id": "149e4df60890789f80525d4456d80df2",
"name": "wind",
"LoginName": "wind"
}
],
"isMutiCommunicate": true, // 是否允许多级沟通
"isHiddenNote": false, // 是否隐藏沟通意见
"isFirstCommunicate": false,
"communicateWorkitemList": [ // 已发起的沟通工作项
{
"id": "14b060a882cbcc1da6a0467483da0e56",
"parentId": "14b05f7aab0ffdfb1e0a38c4cffbbb58",
"nodeId": "N7",
"nodeName": "审批节点",
"handlerId": "149e4df60890789f80525d4456d80df2",
"handlerName": "张三"
}
]
},
"admin_jump": { // 特权人前后跳转标识
"jumpNodeList": [ // 跳转节点集合
{
"id": "N2",
"name": "起草节点",
"desc": "",
"handlerIds": "149e4df60890789f80525d4456d80df2",


"handlerNames": "张三"
},
{
"id": "N5",
"name": "审批节点",
"desc": "",
"handlerIds": "149e4dfc930459e05fc845a40d4982b9",
"handlerNames": "李四"
}
]
},
"admin_changeCurHandler": { // 特权人修改当前处理人标识
"currentWorkitemList": [ // 当前工作项集合
{
"id": "14b0622af3e71a047d965284c58ad0d5",
"activityType": "reviewWorkitem",
"handlerId": "149e4dfc930459e05fc845a40d4982b9",
"handlerName": "张三"
},
{
"id": "14b0622afb429ae2bc207984c03b5c62",
"activityType": "reviewWorkitem",
"handlerId": "149e4df9096933cb8937092489292415",
"handlerName": "李四"
}
]
}


}
ValidateProcess
参数 参数类型 参数描述
formId JSON字符串 必填| 异构系统表单模板信息，JSON格式，由以下几个值组成：
（String）
1) 系统标识（sysId），必填
2) 业务模块标识（modelId），可为空
3) 业务表单模板标识（templateFormId），必填
4) 业务表单实例标识（formInstanceId），必填
【注】当modelId为空时，将根据sysId、templateFormId和
formInstanceId，获取指定业务模块下的所有最新流程实例。
processId 字符 可为空| 流程实例标识。
串 (String)
【注】若此参数为NULL或“”时，通过参数formId去查找相应的流程
实例；否则，直接通过此参数获取相应的流程实例。
actionUid JSON字符 必填| 当前操作用户的登录名，JSON格式。
串 (String)
例如：{"LoginName":"test002"}
processParam JSON字符串 必填，流程审批信息，JSON格式。
（String）
格式与接口ApproveProcess的参数processParam一致，格式如下：
{“sysWfBusinessForm.fdParameterJson”:
“{‘taskId’:’任务ID’,
‘activityType:’任务类型’,
‘operationType’:’操作类型’,
‘param’ :
‘{“futureNodeId”:” 后续为人工决策时指定后续节点”,
“notifyType”:” 通知类型，比如：邮件”,
“notifyOnFinish”:” 流程结束时是否通知本人”,
“auditNote”:” 审批意见”
}’
}”,


参数 参数类型 参数描述
“sysWfBusinessForm.fdAdditionsParameterJson”:
“[{‘type’:‘附加操作类型’,
‘param’:’操作参数’
}]”
}
language 字符串 可为空| 语种。
（String）
【注】若为NULL或“”时，则默认为中文（zh_CN）。
输出 字符串 校验成功：“T”
（String）
校验失败：“F：错误信息”
(cid:0)提供流程配置的相关约束，比如：当前节点必须修改的后续节点的处理人。
(cid:0)此接口提供给异构系统使用，是同步校验合法性，立即返回是否合法或缺失。
(cid:0)此接口适用于异构系统没法使用流程提供的嵌入式页面方案的情况，因为此接口在流程提供的嵌入式
审批页面中前端校验流程合法性方法效果一样。
(cid:0)业务功能：在异构系统中调用接口之前，校验当前环节必填或操作的参数是否合法。
GetAuditOptionList
参数 参数类型 参数描述
formId JSON字符串 必填| 异构系统表单模板信息，JSON格式，由以下几个值组成：
（String）
1) 系统标识（sysId），必填
2) 业务模块标识（modelId），可为空
3) 业务表单模板标识（templateFormId），必填
4) 业务表单实例标识（formInstanceId），必填
【注】当modelId为空时，将根据sysId、templateFormId和
formInstanceId，获取指定业务模块下的所有最新流程实例。
processId 字符串 (String) 可为空| 流程实例标识。
【注】若此参数为NULL或“”时，通过参数formId去查找相应的流程实
例；否则，直接通过此参数获取相应的流程实例。
actionUid JSON字符 必填| 当前操作用户的登录名，JSON格式。
串 (String)
例如：{"LoginName":"test002"}
pageNo 字符串 可为空| 起始页数，默认为1。
（String）


参数 参数类型 参数描述
pageSize 字符串 可为空| 每页的记录数，默认为20。
（String）
language 字符串 可为空| 语种。
（String）
【注】若为NULL或“”时，则默认为中文（zh_CN）。
输出 JSON字符串 流程意见列表信息，JSON数组。
（String）
格式如下：
T:{
"page": { // 分页信息
"totalSize": "数据总数",
"pageSize": "每页的记录数",
"currentPage": "当前页"
},
"datas": [{
factNodeId :”节点在流程图中唯一标识”,
factNodeName：“节点名称”,
actionName：“操作名”,
actionInfo：“操作信息”,
auditNote：“审批意见”,
createTime：“创建时间”,
nodeId：“节点在数据库存储的唯一标识”,
workItemId：“所属工作项在数据库存储的唯一标识”,
handler：“实际处理人登陆名”,
handlerName : “实际处理人名称” ,
attachments: [
{
"attId": "附件唯一标识",
"attName": "附件名称",


参数 参数类型 参数描述
"attUrl": "附件地址"
},
{
"attId": "附件唯一标识",
"attName": "附件名称",
"attUrl": "附件地址"
}
] },
…]
}
【注】若有条意见需隐藏，此时auditNote值为[隐藏]。
handler是批示意见的实际处理人的登录名。
(cid:0)此接口提供审批意见记录列表清单。
(cid:0)提供给异构系统按照分页的数据集，由异构系统去做具体的页面展现。
(cid:0)目前不提供审批意见中上传的附件相关的附件链接。
(cid:0)业务功能：在异构系统展现流程过程的审批意见列表。
功能描述：在异构系统中查看或处理业务表单时，由业务系统调用此接口呈现相关流程过程的审批意见
列表。
T:{
"page": {
"totalSize": 2,
"pageSize": 20,
"currentPage": 1
},
"datas": [
{
"factNodeId": "N2",
"factNodeName": "起草节点",
"actionName": "起草人-提交文档",
"actionInfo": "提交文档",
"auditNote": "",
"createTime": "2014-10-30 13:49",
"nodeId": "1495f9a24993172c2383e0c4cbca2d70",
"workItemId": "1495f9a249f721e58a241ef4443a7ec8",
"handler": "1",
"handlerName": "管理员",
"attachments": [


{
"attId": "附件唯一标识",
"attName": "附件名称",
"attUrl": "附件地址"
},
{
"attId": "附件唯一标识",
"attName": "附件名称",
"attUrl": "附件地址"
}
]
},
{
"factNodeId": "N4",
"factNodeName": "审批节点5",
"actionName": "处理人-通过",
"actionInfo": "通过",
"auditNote": "同意",
"createTime": "2014-10-30 14:35",
"nodeId": "1495f9a4d9ba8be7a9279b542bea297c",
"workItemId": "1495f9a4ddef70d69d14f4d4455bbb3e",
"handler": "wind",
"handlerName": "wind",
"attachments": [
{
"attId": "附件唯一标识",
"attName": "附件名称",
"attUrl": "附件地址"
},
{
"attId": "附件唯一标识",
"attName": "附件名称",
"attUrl": "附件地址"
}
]
}
]
}
GetFlowLogList
参数 参数类型 参数描述
formId JSON字符串 必填| 异构系统表单模板信息，JSON格式，由以下几个值组成：
（String）
1) 系统标识（sysId），必填
2) 业务模块标识（modelId），可为空
3) 业务表单模板标识（templateFormId），可为空
4) 业务表单实例标识（formInstanceId），必填


参数 参数类型 参数描述
【注】当modelId为空时，将根据sysId、templateFormId和
formInstanceId，获取指定业务模块下的所有最新流程实例。
processId 字符串 (String) 可为空| 流程实例标识。
【注】若此参数为NULL或“”时，通过参数formId去查找相应的流程实
例；否则，直接通过此参数获取相应的流程实例。
pageNo 字符串 可为空| 起始页数，默认为1。
（String）
pageSize 字符串 可为空| 每页的记录数，默认为20。
（String）
language 字符串 可为空| 语种。
（String）
【注】若为NULL或“”时，则默认为中文（zh_CN）。
输出 JSON字符串 流程意见列表信息，JSON数组。
（String）
格式如下：
T:{
"page": { // 分页信息
"totalSize": "数据总数",
"pageSize": "每页的记录数",
"currentPage": "当前页"
},
"datas": [{ factNodeId：“节点在流程图中唯一标识”,
factNodeName：“节点名称”,
actionName：“操作名”,
actionInfo：“操作信息”,
createTime：“创建时间”,
nodeId：“节点在数据库存储的唯一标识”,
workItemId：“所属工作项在数据库存储的唯一标识”,
expecter：“预计处理人登陆名” ,
authorizer：“授权人登陆名” ,
authorizeType：“授权类型（1：预计处理人，2：被授权人，3：被
代理人）” ,


参数 参数类型 参数描述
handler：“实际处理人登陆名” ,
handlerName：“实际处理人名称” ,
notifyType：“通知方式”},…]
}
Ø 提供呈现流程流转的详细日志。
Ø 业务功能：在异构系统中呈现流程流转详细日志。
Ø 功能描述：在异构系统中通过此接口呈现流程流转的详细日志，包括谁授权给谁等细粒度的日志，但
此日志不包括审批意见记录。
T:{
"page": {
"totalSize": 2,
"pageSize": 20,
"currentPage": 1
},
"datas": [
{
"factNodeId": "N2",
"factNodeName": "起草节点",
"actionName": "起草人-提交文档",
"actionInfo": "提交文档",
"createTime": "2014-10-30 13:49",
"nodeId": "1495f9a24993172c2383e0c4cbca2d70",
"workItemId": "1495f9a249f721e58a241ef4443a7ec8",
"expecter": "1",
"authorizer": "",
"authorizeType": "1",
"authorizeTypeName": "预计处理人",
"handler": "1",
"handlerName": "管理员",
"notifyType": "todo"
},
{
"factNodeId": "N4",
"factNodeName": "审批节点5",
"actionName": "处理人-通过",
"actionInfo": "通过",
"createTime": "2014-10-30 14:35",
"nodeId": "1495f9a4d9ba8be7a9279b542bea297c",
"workItemId": "1495f9a4ddef70d69d14f4d4455bbb3e",
"expecter": "wind",
"authorizer": "",
"authorizeType": "1",
"authorizeTypeName": "预计处理人",


"handler": "wind",
"handlerName": "wind",
"notifyType": "todo"
}
]
}
GetApproverList
参数 参数类型 参数描述
formId JSON字符串 必填| 异构系统表单模板信息，JSON格式，由以下几个值组成：
（String）
1) 系统标识（sysId），必填
2) 业务模块标识（modelId），可为空
3) 业务表单模板标识（templateFormId），必填
1) 业务表单实例标识（formInstanceId），必填
【注】当modelId为空时，将根据sysId、templateFormId和
formInstanceId，获取指定业务模块下的所有最新流程实例。
processId 字符串 (String) 可为空| 流程实例标识。
【注】若此参数为NULL或“”时，通过参数formId去查找相应的流程实
例；否则，直接通过此参数获取相应的流程实例。
language 字符串 可为空| 语种。
（String）
【注】若为NULL或“”时，则默认为中文（zh_CN）。
输出 JSON字符串 当前处理人列表清单，JSON数组。
（String）
格式如下：
T:[{"LoginName":"test002"},…]
Ø 获取当前处理人列表清单。
Ø 业务功能：获取当前处理人列表清单。
Ø 功能描述：在异构系统中呈现当前处理人列表清单。
T:[
{
"LoginName": "test4",
"name": "测试4",
"id": "1493b4cf38da22af72b2e3d4729a3019"
}
]


GetFieldAuthInfo
参数 参数类型 参数描述
formId JSON字符 必填| 异构系统表单模板信息，JSON格式，由以下几个值组成：
串 (String)
1) 系统标识（sysId），必填
2) 业务模块标识（modelId），可为空
3) 业务表单模板标识（templateFormId），必填
4) 业务表单实例标识（formInstanceId），必填
【注】当modelId为空时，将根据sysId、templateFormId和
formInstanceId，获取指定业务模块下的所有最新流程实例。
processId 字符串 可为空| 流程实例标识。
（String）
【注】若此参数为NULL或“”时，通过参数formId去查找相应的流程实
例；否则，直接通过此参数获取相应的流程实例
nodeFactIds 字符串 可为空|节点实际编号集，多值时以;分隔
（String）
1、若为空的时候，返回正在处理的所有节点的相关权限列表
2、若不为空，则返回指定的节点集的相关权限列表
language 字符串 可为空| 语种。
（String）
【注】若为NULL或“”时，则默认为中文（zh_CN）。
输出 JSON字符串 节点的字段权限列表，JSON数组。
（String）
格式如下：
T:[{"nodeFactId":"N5","fieldCode":"test002","fieldName":"测试字
段",authType:0},…]
authType: 0表示可编辑，1表示不可见，2表示只读
Ø 获取审批节点的异构系统字段权限列表。
Ø 异构系统通过此接口，获取字段权限列表清单后，然后由异构系统把业务系统的表单字段按照权限进
行展示。
Ø 业务功能：获取审批节点的异构系统字段权限列表。
Ø 功能描述：异构系统通过此接口，获取字段权限列表清单后，然后由异构系统把业务系统的表单字段
按照权限进行展示。
T:[ {"nodeFactId":"N5","fieldCode":"test002","fieldName":"测试字段",authType:0},…]
GetFormFieldList


参数 参数类型 参数描述
formId JSON字符 必填| 异构系统表单模板信息，JSON格式，由以下几个值组成：
串 (String)
1) 系统标识（sysId），必填
2) 业务模块标识（modelId），可为空
3) 业务表单模板标识（templateFormId），必填
4) 业务表单实例标识（formInstanceId），可为空
【注】当modelId为空时，将根据sysId、templateFormId和
formInstanceId，获取指定业务模块下的所有最新流程实例。
formInstanceId和processId都为空时，则获取模板最新的映射字段列表
processId 字符串 可为空| 流程实例标识。
（String）
【注】若此参数为NULL或“”时，通过参数formId去查找相应的流程实例；
否则，直接通过此参数获取相应的流程实例
language 字符串 可为空| 语种。
（String）
【注】若为NULL或“”时，则默认为中文（zh_CN）。
输出 JSON字符串 节点的字段权限列表，JSON数组。
（String）
格式如下：
T:[{"fieldId":"test002","fieldName":"测试字段","type":"String"},…]
type: String表示字符串类型，Date表示时间类型
Ø 获取流程的异构系统映射字段列表。
Ø 业务功能：获取流程的异构系统映射字段列表。
返回值样例：T:[ {"fieldId":"test002","fieldName":"测试字段","type":"String"},…]
GetFormFieldValueList
参数 参数类型 参数描述
formId JSON字符 必填| 异构系统表单模板信息，JSON格式，由以下几个值组成：
串 (String)
1) 系统标识（sysId），必填
2) 业务模块标识（modelId），可为空
3) 业务表单模板标识（templateFormId），必填
4) 业务表单实例标识（formInstanceId），必填
【注】当modelId为空时，将根据sysId、templateFormId和
formInstanceId，获取指定业务模块下的所有最新流程实例。


参数 参数类型 参数描述
processId 字符串 可为空| 流程实例标识。
（String）
【注】若此参数为NULL或“”时，通过参数formId去查找相应的流程实
例；否则，直接通过此参数获取相应的流程实例
fieldIds 字符串 必填|字段标识，多值时以;分隔
（String）
language 字符串 可为空| 语种。
（String）
【注】若为NULL或“”时，则默认为中文（zh_CN）。
输出 JSON字符串 节点的字段权限列表，JSON数组。
（String）
格式如下：
T:{"test002":"value1","test003":"value2",…}
Ø 获取流程的异构系统映射字段值。
Ø 异构系统通过此接口，获取其他异构系统字段列表的数据。
Ø 业务功能：获取流程的异构系统映射字段值。
Ø 功能描述：异构系统通过此接口，获取其他异构系统字段列表的数据。
返回值样例：T: {"test002":"value1","test003":"value2",…}
4.3 前端接口
当流程实例创建之后，审批人需查看流程实例信息，查看流程的后续节点信息或修改后续节点处理人等
操作。这些操作可以通过LBPM引擎提供流程的审批页面来提供。
展现页面为JSP页面，可嵌入到异构系统表单页面中。LBPM引擎提供的展现页面，包含流程图和表格展
现页面，流程图中提供对流程节点处理人的修改，流程条件分支选择等功能，并且提供保存和流程合法
性校验接口，同时也提供刷新接口，当用户编辑修改了流程相关的业务数据，流程可以重新流程的分支
和处理人，并显示给用户查看。
【注】采用嵌入LBPM引擎提供的审批页面才需关注此接口。
调用方法（嵌入页面的JS跨域调用）
基于HTML5的postMessage来实现跨文档消息传输（支持IE8+，最新的Firefox，Chrome，和Safari），
异构系统页面需要引入封装的domain.js文件。异构系统页面调用样例：
// 注意：调用方式为异步方式，业务需要写在回调方法
var mainFrame = document.getElementById("mainFrame"); //lbpm嵌入页面
domain.call(mainFrame.contentWindow, "lbpm_getApprovalData", [], function(data) {
if(typeof(data) == "string") {
if(data != "") {
// 正常获取流程操作参数
if(window.console) {
window.console.info(data);
}


}
} else {
if(window.console) {
window.console.error("获取流程操作参数异常！");
}
}
});
domain.call的参数说明：1、lbpm嵌入页面frame；2、调用方法名；3、调用方法参数；4、回调方法
（参数为流程操作参数）
lbpm_getApprovalData
JS函数名：lbpm_ getApprovalData（先执行流程合法性校验，再获取流程审批信息）
参数 参数类型 参数描述
输出 JSON字符串（String） 流程审批信息，JSON格式。
格式如下：
{“sysWfBusinessForm.fdParameterJson”:
“{‘taskId’:’任务ID’,
‘activityType:’任务类型’,
‘operationType’:’操作类型’,
‘param’ :
‘{“futureNodeId”:” 后续为人工决策时指定后续节点”,
“notifyType”:” 通知类型，比如：邮件”,
“notifyOnFinish”:” 流程结束时是否通知本人”,
“auditNote”:” 审批意见”
}’
}”,
“sysWfBusinessForm.fdAdditionsParameterJson”:
“[{
‘type’:‘附加操作类型’,
‘param’:’操作参数’
}]”


}
注意：校验失败时返回“”
lbpm_getApprovalInfo
JS函数名：lbpm_getApprovalInfo（获取流程审批信息）
参数 参数类型 参数描述
输出 JSON字符串（String） 流程审批信息，JSON格式。
格式如下：
{“sysWfBusinessForm.fdParameterJson”:
“{‘taskId’:’任务ID’,
‘activityType:’任务类型’,
‘operationType’:’操作类型’,
‘param’ :
‘{“futureNodeId”:” 后续为人工决策时指定后续节点”,
“notifyType”:” 通知类型，比如：邮件”,
“notifyOnFinish”:” 流程结束时是否通知本人”,
“auditNote”:” 审批意见”
}’
}”,
“sysWfBusinessForm.fdAdditionsParameterJson”:
“[{
‘type’:‘附加操作类型’,
‘param’:’操作参数’
}]”
}
lbpm_validateProcess


JS函数名：lbpm_validateProcess（校验流程合法性）
参数 参数类型 参数描述
输出 字符串（String） 校验成功：“true”
校验失败：“false”,同时提示错误信息
lbpm_reloadProcess
JS函数名：lbpm_reloadProcess（根据业务表单数据，重新加载流程、条件分支计算等）
4.4 操作参数参考
如果你需要自己做审批页面，或者实现系统自动审批，那么你就需要自行构造审批操作参数。本节列出
了LBPM目前默认提供的所有操作相关参数格式，以及相关描述。使用时需要根据不同接口规约，做相
应的删减。
通用操作参数格式：
{
"taskId": "任务Id（来源：接口2.10 GetOperationList返回值中的taskId）",
"processId": "流程实例Id",
"activityType": "任务类型（来源：接口2.10 GetOperationList返回值中的activityType）",
"operationType": "操作标识",
"param": {
"operationName": "操作中文名称",
"notifyType": "通知方式，多值，以分号分隔。备选：todo;mail ",
"notifyOnFinish":"true/false是否流程结束后通知我",
"auditNote": "审批意见（中文长度限制2000）"
…（这里不同的操作还有其它不同的参数）
}
}
起草人 - 提交操作
{
"taskId": "14a80515e36692add6cb367411e95375",
"processId": "14a805159cee0bfd13d2a024fe983e79",
"activityType": "draftWorkitem",
"operationType": "drafter_submit", // 提交操作（固定值）
"param": {
"operationName": "提交文档",
"notifyType": "todo",
"notifyOnFinish": true,
"auditNote": "",
"identityId": " 14a80a241994f227da3a5e247b9bbed6", // 可选，提交人身份，为空则默认获
取提交人（来源：接口2.10 GetOperationList或2.11 GetOperationParam返回值中操作参数
identityList）
"futureNodeId": "N6", // 下一节点为人工决策分支必填，用户选择的分支走向（来源：接口2.10


GetOperationList或2.11 GetOperationParam返回值中操作参数manualBranchNodeList的id）
"draftDecidedFactIds": "[{\"NodeName\":\"N5\",\"NextRoute\":\"N6\"},
{\"NodeName\":\"N7\",\"NextRoute\":\"N8\"}]",
// 在起草节点决定节点走向必填，JSON数组，NodeName为人工分支节点编号，NextRoute为分支下一节点编号
（来源：接口2.10 GetOperationList或2.11 GetOperationParam返回值中操作参数
manualBranchNodeListByDrafter）
"dayOfNotifyDrafter": "0", // 可选，流程启动X天后仍未完成通知起草人
"hourOfNotifyDrafter": "0", // 可选，流程启动X小时后仍未完成通知起草人
"minuteOfNotifyDrafter": "0" // 可选，流程启动X分钟后仍未完成通知起草人
}
}
处理人 - 通过操作
{
"taskId": "14a80a3cd859c42d956d9a44e2287ce9",
"processId": "14a80a23cb954823f942106444197246",
"activityType": "reviewWorkitem",
"operationType": "handler_pass",// 通过操作（固定值）
"param": {
"operationName": "通过",
"notifyType": "todo",
"notifyOnFinish": true,
"auditNote": "同意"，
"futureNodeId": "N6", // 下一节点为人工决策分支必填，用户选择的分支走向（来源：接口2.10
GetOperationList或2.11 GetOperationParam返回值中操作参数manualBranchNodeList的id）
}
}
处理人 - 驳回操作
{
"taskId": "14a80d67818f5780193302845feaab9b",
"processId": "14a80a23cb954823f942106444197246",
"activityType": "reviewWorkitem",
"operationType": "handler_refuse",// 驳回操作（固定值）
"param": {
"operationName": "驳回",
"notifyType": "todo",
"notifyOnFinish": true,
"auditNote": "测试驳回",
"jumpToNodeId": "N6", // 驳回目标的节点编号（来源：接口2.11 GetOperationParam返回值中
操作参数refuseNodeList的id）
"refusePassedToThisNode": false // 驳回通过后是否直接返回本节点
}
}
处理人 - 转办操作


{
"taskId": "14a8494e6093796558e7f8643fab6c5e",
"processId": "14a80a23cb954823f942106444197246",
"activityType": "reviewWorkitem",
"operationType": "handler_commission",// 驳回操作（固定值）
"param": {
"operationName": "转办",
"notifyType": "todo",
"notifyOnFinish": true,
"auditNote": "测试转办",
"toOtherHandlerIds": "149e4dfc930459e05fc845a40d4982b9"// 被转办人，异构系统调用JSON
格式为：{\"LoginName\":\"test002\"}
}
}
处理人 - 废弃操作
{
"taskId": "14a8486ffcca2ce2179e92a4366b6e6f",
"processId": "14a84864b8ad1821d70bb2b451183e46",
"activityType": "reviewWorkitem",
"operationType": "handler_abandon",// 废弃操作（固定值）
"param": {
"operationName": "废弃",
"notifyType": "todo",
"notifyOnFinish": true,
"auditNote": "测试废弃"
}
}
处理人 - 沟通操作
{
"taskId": "14a85adb2657ce145f187154dfca2bdd",
"processId": "14a80a23cb954823f942106444197246",
"activityType": "reviewWorkitem",
"operationType": "handler_communicate",// 沟通操作（固定值）
"param": {
"operationName": "沟通",
"notifyType": "todo",
"notifyOnFinish": true,
"auditNote": "测试沟通",
"toOtherHandlerIds":
"149e4dfc930459e05fc845a40d4982b9;149e4df60890789f80525d4456d80df2", // 被沟通人（只能沟通人
员和岗位），异构系统调用JSON数组格式为：[{\"LoginName\":\"test000\"},
{\"LoginName\":\"test001\"}]
"isMutiCommunicate": true, // 是否允许多级沟通
"communicateScopeHandlerIds":
"149e4df26b9a5e9f01d93524e0e8d8da;14a3d3c3353868856b84ac14c04a8183", // 限制子级沟通范围（只
能限定沟通人员和岗位），为空则不限定范围，异构系统调用JSON数组格式为：
[{\"LoginName\":\"test002\"},{\"LoginName\":\"test003\"}]


"isHiddenNote": false // 是否隐藏沟通意见
}
}
处理人 – 取消沟通操作
{
"taskId": "14a941ceb77ac77d9190f7243e6b1bb7",
"processId": "14a941aa36a175050f747fc476d8187d",
"activityType": "communicateWorkitem",
"operationType": "handler_cancelCommunicate",// 取消沟通操作（固定值）
"param": {
"operationName": "取消",
"notifyType": "todo",
"notifyOnFinish": true,
"auditNote": "测试取消沟通",
"cancelHandlerIds":
"14a941dcc17e2b90ae31a404b8197e95;14a941dcc78ebd90174beff4eed883ec" // 取消工作项的id，多个
工作项分号隔开（来源：接口2.11 GetOperationParam返回值中操作参数communicateWorkitemList的id）
}
}
处理人 – 回复沟通操作
{
"taskId": "14a941ceb77ac77d9190f7243e6b1bb7",
"processId": "14a941aa36a175050f747fc476d8187d",
"activityType": "communicateWorkitem",
"operationType": "handler_returnCommunicate",// 回复沟通操作（固定值）
"param": {
"operationName": "回复",
"notifyType": "todo",
"notifyOnFinish": true,
"auditNote": "测试回复沟通"
}
}
处理人 – 节点暂停操作
{
"taskId": "14a941ad63a5a498362479b469cbd131",
"processId": "14a941aa36a175050f747fc476d8187d",
"activityType": "reviewWorkitem",
"operationType": "handler_nodeSuspend",// 节点暂停操作（固定值）
"param": {
"operationName": "节点暂停",
"notifyType": "todo",
"notifyOnFinish": true,
"auditNote": "测试节点暂停"


}
}
处理人 – 节点唤醒操作
{
"taskId": "14a941ad63a5a498362479b469cbd131",
"processId": "14a941aa36a175050f747fc476d8187d",
"activityType": "reviewWorkitem",
"operationType": "handler_nodeResume",// 节点唤醒操作（固定值）
"param": {
"operationName": "节点唤醒",
"notifyType": "todo",
"notifyOnFinish": true,
"auditNote": "测试节点唤醒"
}
}
起草人 – 催办操作
{
"taskId": "14a941ad6210163adf9f3994f03a2706",
"processId": "14a941aa36a175050f747fc476d8187d",
"activityType": "reviewNode",
"operationType": "drafter_press",// 催办操作（固定值）
"param": {
"operationName": "催办",
"notifyType": "todo",
"auditNote": ""
}
}
起草人 – 撤回操作
{
"taskId": "14a94b4fd4449c9d0e33c0c41718bdfa",
"processId": "14a941aa36a175050f747fc476d8187d",
"activityType": "reviewNode",
"operationType": "drafter_return",// 撤回操作（固定值）
"param": {
"operationName": "撤回",
"notifyType": "todo",
"auditNote": ""
}
}
起草人 – 废弃操作


{
"taskId": "14a94b6f0f40c5b806fe6784f379d04e",
"processId": "14a941aa36a175050f747fc476d8187d",
"activityType": "reviewNode",
"operationType": "drafter_abandon",// 废弃操作（固定值）
"param": {
"operationName": "废弃",
"notifyType": "todo",
"auditNote": ""
}
}
特权人 – 终审通过操作
{
"taskId": "14a94b99a883c1fe55057ab4c6abb84d",
"processId": "14a94b941d48d3503ff7a844ceaad45a",
"activityType": "reviewNode",
"operationType": "admin_pass",// 终审通过操作（固定值）
"param": {
"operationName": "终审通过",
"notifyType": "todo",
"auditNote": ""
}
}
特权人 – 前后跳转操作
{
"taskId": "14a94bca20790ac087601454b3bb3e92",
"processId": "14a94bc6e7e8076056458de4f00a46d6",
"activityType": "reviewNode",
"operationType": "admin_jump",// 前后跳转操作（固定值）
"param": {
"operationName": "前后跳转",
"notifyType": "todo",
"notifyLevel": "3",
"auditNote": "",
"jumpToNodeId": "N8" // 跳转的目标节点编号（来源：接口2.11 GetOperationParam返回值中操
作参数jumpNodeList的id）
}
}
特权人 – 直接废弃操作
{
"taskId": "14a94c66d50dd717f20b9df46d4bb563",
"processId": "14a94bc6e7e8076056458de4f00a46d6",
"activityType": "reviewNode",
"operationType": "admin_abandon",// 直接废弃操作（固定值）


"param": {
"operationName": "直接废弃",
"notifyType": "todo",
"auditNote": ""
}
}
特权人 – 修改当前处理人操作
{
"taskId": "14a94cb2fb20c7e42c5ef064a6da43df",
"processId": "14a94cafc2e45dc471ecfa24484b08ba",
"activityType": "reviewNode",
"operationType": "admin_changeCurHandler",// 修改当前处理人操作（固定值）
"param": {
"operationName": "修改当前处理人",
"notifyType": "todo",
"auditNote": "",
"repHandlerIds":
"149e4dfc930459e05fc845a40d4982b9;149e4df9096933cb8937092489292415", // 被替换的处理人，异构
系统调用JSON数组格式为：[{\"LoginName\":\"test002\"},{\"LoginName\":\"test003\"}]
"taskIds": "14a94cb2fc89e7579f6328a4b7da2484;14a94cb2fc89e7579f6328a4b7da4590" //
替换的原工作项，（来源：接口2.11 GetOperationParam返回值中操作参数currentWorkitemList的id）
}
}
特权人 – 流程暂停操作
{
"taskId": "14a94cb2fb20c7e42c5ef064a6da43df",
"processId": "14a94cafc2e45dc471ecfa24484b08ba",
"activityType": "reviewNode",
"operationType": "admin_processSuspend",// 流程暂停操作（固定值）
"param": {
"operationName": "流程暂停",
"notifyType": "todo",
"auditNote": ""
}
}
特权人 – 流程唤醒操作
{
"taskId": "14a94cb2fb20c7e42c5ef064a6da43df",
"processId": "14a94cafc2e45dc471ecfa24484b08ba",
"activityType": "reviewNode",
"operationType": "admin_processResume",// 流程唤醒操作（固定值）
"param": {
"operationName": "流程唤醒",
"notifyType": "todo",


"auditNote": ""
}
}
特权人 – 节点暂停操作
{
"taskId": "14a94cb2fb20c7e42c5ef064a6da43df",
"processId": "14a94cafc2e45dc471ecfa24484b08ba",
"activityType": "reviewNode",
"operationType": "admin_nodeSuspend",// 节点暂停操作（固定值）
"param": {
"operationName": "节点暂停",
"notifyType": "todo",
"auditNote": ""
}
}
特权人 – 节点唤醒操作
{
"taskId": "14a94cb2fb20c7e42c5ef064a6da43df",
"processId": "14a94cafc2e45dc471ecfa24484b08ba",
"activityType": "reviewNode",
"operationType": "admin_nodeResume",// 节点唤醒操作（固定值）
"param": {
"operationName": "节点唤醒",
"notifyType": "todo",
"auditNote": ""
}
}
已处理人 – 撤回审批操作
{
"taskId": "14a94cb2fb20c7e42c5ef064a6da43df",
"processId": "14a94cafc2e45dc471ecfa24484b08ba",
"activityType": "reviewNode",
"operationType": "history_handler_back",// 撤回审批操作（固定值）
"param": {
"operationName": "撤回审批",
"notifyType": "todo",
"auditNote": ""
}
}
已处理人 – 追加意见操作


{
"taskId": "14a94e0dc65cf69cf5601fa4fcea8399",
"processId": "14a94e059ac70d805cfe74745b58bbac",
"activityType": "reviewNode",
"operationType": "history_handler_addOpinion",// 抄送人追加意见操作（固定值）
"param": {
"operationName": "追加意见",
"notifyType": "todo",
"auditNote": ""
}
}
修改节点处理人附加操作
修改流程节点N4、N5处理人
[
{
"type": "additions_modifyNodeAttribute",
"param": {
"N4": [
{"LoginName": "zhangsan"},
{"LoginName": "lisi"}
],
"N5": [
{"LoginName": "zhangsan"}
]
}
}
]


