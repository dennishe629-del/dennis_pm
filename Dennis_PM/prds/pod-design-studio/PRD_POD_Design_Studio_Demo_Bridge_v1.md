# PRD POD Design Studio Demo Bridge v1

> 用途：将 POD 卖家设计器 PRD 转译为页面、组件、交互、状态与 Demo 的可执行说明。

---

## 1. 基本信息

- 模块名称：POD Design Studio
- 对应 PRD：`5-PRD-20260324-v5-ShipSage-卖家设计器.md`
- Bridge 版本：v2.0
- 适用范围：OMS 卖家端 / Admin 配置端 / WMS POD 作业端
- 最近更新：2026-03-31

---

## 2. 关联文档

- PRD：`01_Product/03_PRD/POD/5-PRD-20260324-v5-ShipSage-卖家设计器.md`
- Demo：`03_Design/04_Demo/ShipSage_POD_Design_Studio_Demo_v1.html`
- 前端主规范：`03_Design/03_Design_System/Frontend_Standards_v1.md`
- 页面模板目录：`03_Design/03_Design_System/Page_Template_Catalog_v1.md`
- Bridge 模板：`01_Product/03_PRD/00_General/PRD_Demo_Bridge_Spec_v1.md`

---

## 3. 页面清单（Page Inventory）

| 页面ID | 页面名称 | 页面类型 | 模板ID | 目标用户 | 核心任务 | Demo锚点 |
| --- | --- | --- | --- | --- | --- | --- |
| P-OMS-001 | POD产品管理 | 列表页 | PT-01 | 卖家 | 创建POD产品、管理产品列表、进入设计 | `scheme` |
| P-OMS-002 | 创建POD产品向导 | 弹窗向导页 | PT-07 | 卖家 | 选底板、确认底衫Customer SKU、生成POD产品 | `wizard modal` |
| P-OMS-003 | 多面设计器 | Studio页 | PT-08 | 卖家 | 上传图、加字、调层级、看 DPI、保存方案 | `designer` |
| P-OMS-004 | 下载中心 | 详情/导出页 | PT-02 + PT-08扩展 | 卖家 | 按平台规格预览并下载 Mockup | `download` |
| P-OMS-005 | OMS-WMS 履约流转总览 | 流程监控页 | PT-10 | 卖家/内部 | 看订单匹配、印刷链路、取消模拟 | `flow` |
| P-OMS-006 | 买家设计审核 | 详情子区块 | — | 卖家 | 查看买家设计图DPI、替换上传 | `buyerDesign` |
| P-OMS-007 | TEMU上架 | 操作弹窗 | — | 卖家 | 授权TEMU、上传效果图 | `temuListing` |
| P-ADM-001 | 底板管理列表 (已移至OMS) | 列表页 | PT-01 | 卖家 | 创建/管理底板、关联底衫SKU | `admin` |
| P-ADM-002 | 底板编辑 (已移至OMS) | 编辑页 | PT-03 | 卖家 | 编辑底板、上传模板图/Mockup、管理变体关联 | `adminCreate` / `adminEdit` |
| P-ADM-003 | 设计师管理 | 列表页 | PT-01 | Admin | 创建/编辑设计师、查看费用 | `adminDesigners` |
| P-ADM-004 | 设计师费用结算 | 列表/操作页 | PT-01 | Admin | 查看费用明细、执行结算 | `adminDesignerFees` |
| P-WMS-001 | 膜打印批次列表 | 流程监控页 | PT-10 | WMS操作员 | 查看批次、认领、推进步骤 | `wmsBatches` |
| P-WMS-002 | 膜打印批次详情 | 详情页 | PT-02 + PT-10扩展 | WMS操作员 | 看订单、条码、位置、批次步骤 | `wmsBatchDetail` |
| P-WMS-003 | Film Pre-Pick 扫码 | 作业台页 | PT-09 | WMS操作员 | 扫码膜片、定位 Bin、确认放入 | `wmsFilmPrePick` |
| P-WMS-004 | Heat Press Queue | 列表作业页 | PT-01 + PT-09扩展 | 热压操作员 | 筛选待热压任务并进入作业 | `wmsHeatQueue` |
| P-WMS-005 | Heat Press Task | 作业台页 | PT-09 | 热压操作员 | 扫码复核、逐面热压、提交 QC | `wmsHeatTask` |

---

## 4. 页面-PRD 功能映射（Feature Mapping）

| PRD 功能ID | 需求摘要 | 页面ID | 输出结果 | 备注 |
| --- | --- | --- | --- | --- |
| T1 / US-101~108 | 多面设计、上传图片、文字编辑、DPI、图层管理 | P-OMS-003 | 可保存 Canvas JSON 和设计元素状态 | 卖家核心编辑体验 |
| T2 / US-201~208 | POD产品管理、创建POD产品向导、方案保存回列表 | P-OMS-001 / P-OMS-002 / P-OMS-003 | 建立产品与设计方案关联 | OMS 主流程主干 |
| T3 / US-301~307 | 底板管理CRUD + 关联产品 | P-ADM-001 / P-ADM-002 | 底板CRUD + 变体关联底衫SKU | OMS 底板管理 |
| T4 / US-401~406 | 设计方案列表、默认方案、编辑恢复 | P-OMS-001 / P-OMS-003 | 形成 scheme 管理闭环 | 与 T1/T2 串联 |
| T5 / US-501~506 | 多平台效果图生成与下载 | P-OMS-004 | 按规格导出 Mockup / ZIP | 输出页 |
| T5b | TEMU 直接上架 | P-OMS-007 | 效果图上传到 TEMU | TEMU 渠道扩展 |
| T8 | 膜打印批次、膜预拣、热压作业 | P-WMS-001 ~ P-WMS-005 | 完成 WMS POD 作业闭环 | V5.4 重点 |
| T10 | 订单取消影响演示 | P-OMS-005 / P-WMS-001 | 展示取消对批次和状态的影响 | Demo 可先展示关键分支 |
| T12 | 买家设计审核 | P-OMS-006 | DPI 检测 + 替换 | 卖家审核买家上传设计 |
| T13 | 设计师管理 | P-ADM-003 / P-ADM-004 | 设计师管理 + 费用结算 | Admin 设计师运营 |

---

## 5. 组件映射表（Component Mapping）

| 页面ID | 区块 | 使用组件 | 状态 | 数据来源 |
| --- | --- | --- | --- | --- |
| P-OMS-001 | 筛选区 | FilterBar / Input / Select / Button | default / no-result | `design-schemes` |
| P-OMS-001 | 方案表格 | DataTable / Tag / ActionButton | loading / empty / error | `design-schemes` |
| P-OMS-002 | 步骤导航 | Stepper / SummaryCard / OptionCard | active / blocked / completed | `product-groups`, `print-profiles` |
| P-OMS-003 | 工具栏 | Toolbar / ButtonGroup / Toast | default / saving / save-success | 本地状态 |
| P-OMS-003 | 图层与面切换 | Chip / LayerList / FaceCard | active / disabled | 当前 draft JSON |
| P-OMS-003 | 画布区 | CanvasStage / UploadAction / TextPreset | selected / empty-canvas | 当前方案元素 |
| P-OMS-003 | 属性面板 | PropertyPanel / Table / DPIBadge | normal / warning / danger | 计算值 + profile |
| P-OMS-004 | 预览区 | MockupPreview / FaceTabs | default / empty | `mockup` 预览 |
| P-ADM-001 | 模板筛选 | FilterBar / Input / Select | default | `print-profiles` |
| P-ADM-002 | 模板表单 | FormSection / Input / Checkbox / Table | editing / validation-error | `print-profiles` |
| P-WMS-001 | 批次指标区 | MetricCard / Tag / ProgressRail | default / alerting | `pod_print_batches` |
| P-WMS-002 | 批次详情 | SummaryCard / BarcodeList / ProcessStep | default / partial-data | batch detail |
| P-WMS-003 | 扫码作业区 | ScanInput / BinHero / MockupCard | waiting-scan / scan-error / scan-success | `pod_film_task` |
| P-WMS-004 | 队列表格 | FilterBar / DataTable / PriorityTag | default / empty / no-result | `heat queue` |
| P-WMS-005 | 热压任务区 | TaskHeader / FaceMatrix / QCChecklist / ActionBar | blocked / processing / qc-pass / qc-fail | `shipment_pod_detail` |

---

## 6. 关键交互流程（Interaction Flows）

### IF-001 创建POD产品 2 步向导

- 触发条件：卖家在POD产品管理页点击”创建POD产品”
- 前置条件：卖家已开通 POD 功能
- 系统行为：
  1. Step 1：选底板（ShipSage底板 / 自有底板），浏览并选择底板
  2. Step 2：确认底板关联的底衫Customer SKU，填写产品名，完成后创建POD产品并进入设计器
- 失败回退：
  - 底板无关联SKU：提示先在底板管理中关联产品
  - 底板无可用底板：提示创建自有底板或联系ShipSage

### IF-002 卖家保存设计方案

- 触发条件：卖家在设计器点击“保存方案”
- 前置条件：至少一面存在设计元素
- 系统行为：
  1. 校验方案名、颜色绑定、必要元素
  2. 按面保存相对坐标 Canvas JSON
  3. 关闭编辑器并刷新方案列表
  4. 异步触发印刷文件预生成和 Mockup 缓存
- 失败回退：
  - 校验失败：字段级提示
  - 保存失败：保留当前 draft，Toast 提示重试

### IF-003 Film Pre-Pick 扫码

- 触发条件：操作员扫描膜条码
- 前置条件：当前 Pick Run 已完成 Bin 分配
- 系统行为：
  1. 校验膜条码是否属于当前 Pick Run
  2. 命中后显示订单、Bin、Mockup、印刷面
  3. 点击确认后，将该面状态置为 `pre_picked`
  4. 全部 Bin 完成膜预拣后，解锁衣物拣货
- 失败回退：
  - 条码不属于当前 Pick Run：保留当前页并提示切换
  - 重复扫码：显示“已在 Bin 中”

### IF-004 Heat Press Task 作业

- 触发条件：操作员从 Heat Queue 进入作业
- 前置条件：衣物与膜均已在同一 Bin 中
- 系统行为：
  1. 扫订单条码、扫膜条码
  2. 显示当前待热压面及参数
  3. 逐面完成热压
  4. 提交 QC Pass / Fail
- 失败回退：
  - 扫码不一致：阻止提交
  - QC Fail：退回重印链路

### IF-005 TEMU 上架流程

- 触发条件：卖家在POD产品详情点击"TEMU上架"
- 前置条件：产品已有可用效果图
- 系统行为：
  1. 打开上架弹窗，检测TEMU授权状态
  2. 未授权时引导完成OAuth授权
  3. 已授权后选择效果图并上传至TEMU
  4. 上传成功后显示TEMU商品链接
- 失败回退：
  - 授权失败：提示重试或联系支持
  - 上传失败：保留选择状态并提示重试

### IF-006 买家设计 DPI 校验 + 替换流程

- 触发条件：卖家查看买家提交的设计图
- 前置条件：买家已上传设计文件
- 系统行为：
  1. 系统自动检测设计图DPI并显示结果
  2. DPI合格：显示绿色通过标识，可直接确认
  3. DPI不合格：显示红色警告，卖家可选择替换上传
  4. 替换上传后重新检测DPI
- 失败回退：
  - 文件格式不支持：提示支持的格式列表
  - 上传失败：保留当前状态并提示重试

---

## 7. 状态机与可视化状态（UI State Matrix）

| 对象 | 状态 | UI 表现 | 可执行动作 | 限制 |
| --- | --- | --- | --- | --- |
| 设计方案 | `draft` | 黄色 Tag | 编辑、设默认、继续保存 | 不参与默认方案命中 |
| 设计方案 | `active` | 绿色 Tag | 编辑、下载、设默认 | 可参与订单匹配 |
| 向导步骤 | `blocked` | 下一步按钮 disabled | 返回上一步 | 需补全当前步骤 |
| 图片 DPI | `>=150` | 绿色提示 | 可继续保存 | 推荐状态 |
| 图片 DPI | `100-149` | 黄色提示 | 允许保存 | 有质量风险 |
| 图片 DPI | `<100` | 红色提示 | 允许继续但强提示 | 需用户确认 |
| 膜任务 | `film_ready` | 待预拣态 | 扫码放入 Bin | 未放入 Bin 前不能继续 |
| 膜任务 | `pre_picked` | 已预拣态 | 等待衣物入 Bin | 可进入后续链路 |
| 热压任务 | `ready_to_press` | 队列待处理 | 进入作业 | 需扫码复核 |
| 热压任务 | `qc_pass` | 完成态 | 进入 Pack 流程 | 不可再次热压 |
| 热压任务 | `reprint` | 失败态 | 回到重印流程 | 需重新生成膜任务 |

---

## 8. 字段级规范（首批必补）

| 页面ID | 字段名 | 类型 | 必填 | 说明 | 来源 |
| --- | --- | --- | --- | --- | --- |
| P-OMS-002 | `initial_customer_sku` | string | 是 | 向导起始产品 | OMS product search |
| P-OMS-002 | `base_template_id` | int | 是 | 选中的底板 | base templates |
| P-OMS-002 | `size_code` | string | 是 | 确认后的尺寸映射 | SKU / manual |
| P-OMS-003 | `face` | enum | 是 | 当前印刷面 | profile support |
| P-OMS-003 | `elements[].x/y/w/h` | number | 是 | 相对坐标百分比 | Canvas JSON |
| P-OMS-003 | `elements[].fontFamily` | string | 否 | 文本字体 | 字体库 |
| P-ADM-002 | `company_id` | string | 是 | 模板所属客户 | Admin |
| P-ADM-002 | `category_id` | string | 是 | 模板所属品类 | Admin |
| P-WMS-003 | `barcode` | string | 是 | 膜条码 | WMS |
| P-WMS-003 | `bin_code` | string | 是 | 膜应放入的 Bin | Pick Run |
| P-WMS-005 | `press_position` | string | 是 | 热压定位参数 | SyncToWms |

---

## 9. API 契约索引（首批）

| 页面 | API | 用途 | 关键回退策略 |
| --- | --- | --- | --- |
| P-OMS-001 | `GET /api/pod/design-schemes` | 方案列表 | 保留筛选条件并提示重试 |
| P-OMS-002 | `GET /api/pod/print-profiles` | 加载模板 | 无模板时引导联系 Admin |
| P-OMS-003 | `POST /api/pod/design-schemes` | 创建方案 | 失败时保留 draft |
| P-OMS-004 | `POST /api/pod/design-schemes/{id}/mockup` | 生成效果图 | 提示稍后重试 |
| P-WMS-003 | `GET /api/wms/pod/film-pre-pick` | 扫码命中膜任务 | 保留当前页面与输入框 |
| P-WMS-005 | `POST /api/wms/pod/heat-press/qc` | 提交热压结果 | 失败时禁止丢失当前任务上下文 |

---

## 10. 异常与边界处理（首批）

| 场景 | 触发条件 | 期望反馈 | 恢复方式 |
| --- | --- | --- | --- |
| 无可用底板 | 底板列表为空 | 页面空态 + 提示创建底板或使用ShipSage底板 | 返回上一步或退出 |
| 图片分辨率过低 | DPI < 100 | 红色强提示 + 继续/取消 | 更换图片或继续保存 |
| 模板不支持该印刷面 | profile 中无当前 face | 面按钮 disabled + 说明文案 | 切换到支持面 |
| 膜条码错误 | 不属于当前 Pick Run | 页面级 warn + 保留输入内容 | 重扫或切换 Pick Run |
| 热压扫码不一致 | 订单与膜不匹配 | 禁止提交 + 错误提示 | 重新扫码 |
| QC Fail | 图案位置或质量不合格 | 明确进入重印链路 | 重新建膜任务 |

---

## 11. Demo 实现清单

- [ ] 所有 P0 页面均映射到模板 ID
- [ ] POD产品列表页和创建向导可完整演示
- [ ] 设计器支持至少 1 次完整保存流程
- [ ] 下载中心支持单面与 ZIP 演示
- [ ] Film Pre-Pick 支持成功与失败扫码路径
- [ ] Heat Press Task 支持 Pass / Fail 两条路径
- [ ] 关键页面具备 empty / error / blocked 至少 1 个可演示态
- [ ] TEMU上架弹窗可演示授权和上传路径
- [ ] 买家设计审核区块可演示DPI检测和替换
- [ ] 设计师管理列表和费用结算可演示

---

## 12. Bridge 验收标准

- [ ] PRD 的 T1/T2/T3/T4/T5/T8 已映射到页面
- [ ] T5b/T12/T13 已映射到页面
- [ ] 底板管理替代印刷区域配置的页面映射完整
- [ ] POD Demo 每个主页面均有页面 ID
- [ ] PT-07~PT-10 在本模块中有实际落点
- [ ] 关键状态与 PRD 状态语义一致
- [ ] 前端字段/API/回退策略至少完成首批关键页面定义

---

## 13. 下一步补充建议

1. 将本 Bridge 的页面 ID 回填到 Demo 注释和测试用例矩阵。
2. 为每个页面补充更细的字段字典和错误码表。
3. 将 P-WMS-001 ~ P-WMS-005 的状态标签颜色映射单独沉淀。
4. 后续继续扩展 T9 和 T10 的独立页面定义。
