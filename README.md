# 王智 · 工业设计作品集 · 网站

由 `常用及工具/工作合集/王智作品集.pptx`（41 页）整理而来，抽取其中的作品与文字，重构为响应式个人作品集网站。

## 打开方式

- 直接双击 `index.html` 即可浏览（无需服务器、无需联网）。
- 双击 `start.bat`：菜单式启动本地预览，选 2 可让同 Wi-Fi 的手机 / 同事一起看。
- 或运行本地服务器（推荐，已修正 webp 的 MIME 类型 + 多线程，避免并发请求图片超时）：
  ```
  python serve.py                     # 本机 6123 端口
  python serve.py --host 0.0.0.0      # 局域网（手机可访问，会打印局域网地址）
  python serve.py --port 8000 --open  # 换端口并自动打开浏览器
  ```
- 部署到公网 / 拷给别人：见 [DEPLOY.md](DEPLOY.md)（GitHub Pages、Netlify、对象存储都写了步骤）。

> 旧的 `python -m http.server` 是单线程的，首屏并发加载 30+ 张作品图时会排队超时，
> 表现为图片显示不出来；`serve.py` 已改为多线程并补全 MIME 映射。

## 目录结构

```
portfolio_site/
├── index.html        页面结构（文案在 HTML 中，可直接改）
├── styles.css        设计系统：tokens（色板/字体/字号）→ 组件 → 分节 → 细节 → 无障碍 → 响应式
├── app.js            交互：图片容错、渐显、数字、作品渲染、筛选、灯箱、导航
├── serve.py          本地预览服务器（多线程 + 正确 MIME + 免缓存）
├── data.js           由 projects.json 生成的作品数据（请勿手改）
├── projects.json     作品数据源：标题、描述、标签、图片列表
├── extract_images.py 从原 PPT 抽取作品原图到 assets/raw/
├── optimize_images.py 把 assets/raw/ 的原图压成 img/ 与 thumb/ 两种尺寸
├── patch_data.py     projects.json → data.js（自动补封面尺寸）
└── assets/
    ├── img/          作品大图（webp，长边 1800px）
    ├── thumb/        列表缩略图（webp，宽 760px）
    ├── bg/           工业氛围背景照片（webp，来自 Pexels，见下方授权）
    ├── fonts/        标题手写字体（woff2 子集，OFL）
    └── favicon.svg
```

## 可用性 / 无障碍

- 键盘：`Tab` 遍历，卡片 `Enter` 打开图集，灯箱内 `←` `→` 切换、`Esc` 关闭，`Tab` 焦点被锁在灯箱内
- 首页顶部有「跳到作品」skip link；所有可交互元素有 `:focus-visible` 描边
- 灯箱打开时背景 `inert`、滚动锁定；关闭后焦点回到刚才的卡片
- 图片带 `width/height` 与 `decoding="async"`，减少布局抖动；加载失败会自动重试一次
- 支持 `prefers-reduced-motion`（关闭渐显与数字动画）；附打印样式（隐藏导航与背景大图）
- 筛选按钮使用 `aria-pressed`，导航当前项使用 `aria-current`，页面带 Person 结构化数据

## 修改作品

1. 编辑 `projects.json`（分类、标题、年份、描述、标签、图片序号）。
2. 需要新图时：把 PPT 里的原图放到 `assets/raw/`（或先跑 `extract_images.py` 重新抽取），
   在 `projects.json` 里引用文件名，再运行 `optimize_images.py` 生成两种尺寸。
3. 运行 `patch_data.py` 把 `projects.json` 转成 `data.js`（会自动补上封面尺寸）。

## 设计说明

- 配色取自原 PPT 的企业视觉：纸白 `#F4F3EF`、墨黑 `#14161A`、品牌红 `#C8102E`、品牌蓝 `#1B3EA8`。
- 标题是「小字 + 大字」的混排：连接词「设备会 / 产线才有」用方正兰亭黑小字
  （`--hei`，缺失时回退 PingFang / 思源黑体 / 雅黑），只有「呼吸」「生命」用手写毛笔楷书大字
  （马善政楷书 `MaShan`，96px），其中「生命」为品牌红；第二行整体右移形成错位；标题不带标点。
- 字号/颜色只有四档，全站复用（`--fs-*` / `--c-*` 变量）：
  | 层级 | 字号 | 颜色 | 用在哪 |
  | --- | --- | --- | --- |
  | 导语 lead | `clamp(16px,1.28vw,19px)` / 行高 1.95 | `#4C5059` | 首屏导语、关于我开篇 |
  | 正文 body | 14.5px / 行高 1.9 | `#4C5059` | 项目描述、历程、专长、关于我 |
  | 副标题/注脚 caption | 11px / 字距 .14em | `#73777F` | 分节副标题、卡片副题与年份、图注、页脚 |
  | 技术标签 micro | 9px / 字距 .2em 等宽 | 品牌红或半透明白 | 图号、区位号、编号、计数 |
- 统一细节元素：分节标题下沿的刻度尺、卡片编号前的红色短横、主推项目图的裁切角标、
  卡片悬停时出现的角标、图纸编号 / 比例 / 区位号、警示条、铆钉、页脚标题栏。
- 首屏数据：7+ 年经验、50+ 个参与项目、1000+ 张效果图、2 项外观专利
  （作品区实际展示的是其中精选的 27 组）。
- 工业风细节：蓝图网格、裁切标记、标尺刻度、等宽技术标签（`FIG. 00` / `P—01`）、
  红黑警示条、铆钉、图纸编号与比例、工程剖面线、注册十字标记、点阵与混凝土底纹、细扫描线、
  以及页脚的「图纸标题栏」（Project / Designer / Scale / Drawing No.）。
- 图片不采用四边实线边框：改为**切角形状**（`clip-path`，网格中交替右上 / 左上切角）
  + **边缘渐隐**（`mask-image`，向页面底色或文案侧淡出）+ 形状跟随的柔和投影，
  让作品图融入纸面，而不是被"框"住。
- 作品分四类：AGV / 车体外观、系统与场景效果图、监控界面、方案与设计过程。
- 支持键盘：灯箱内 `←` `→` 切换、`Esc` 关闭；卡片可 Tab 聚焦后回车打开。

## 字体授权（SIL Open Font License）

`assets/fonts/` 内为按页面用字裁剪（subset）后的 woff2，体积约 52KB：

| 文件 | 字体 | 来源 |
| --- | --- | --- |
| `mashan-subset.woff2` | 马善政毛笔楷书 Ma Shan Zheng | [Google Fonts](https://fonts.google.com/specimen/Ma+Shan+Zheng) · OFL |

标题小字用的「方正兰亭黑」是商业字体，未嵌入文件，只做字体栈的首选（本机已安装则生效）；
需要统一呈现时可换成思源黑体 / Noto Sans SC 并将其加入 `--hei`。

## 背景照片授权（Pexels License）

`assets/bg/` 中的氛围照片来自 Pexels，可免费商用、无需署名（此处仍标注来源）：

| 文件 | 用途 | 来源 |
| --- | --- | --- |
| `factory.webp` | 设计主张大图 | [Pexels #12747016](https://www.pexels.com/photo/12747016/) |
| `pipes.webp` | 「我的专长」底纹 | [Pexels #13100561](https://www.pexels.com/photo/13100561/) |
| `warehouse.webp` | 联系区底图 | [Pexels #18395054](https://www.pexels.com/photo/18395054/) |
| `concrete.webp` | 历程底纹 | [Pexels #14070662](https://www.pexels.com/photo/14070662/) |
| `concrete-smooth.webp` | 作品区底纹 | [Pexels #13778388](https://www.pexels.com/photo/13778388/) |

这些照片仅作背景氛围使用，与作者本人作品无关，页面已标注 `PHOTO · PEXELS`。

## 来源与版权

作品图片与文字均来自王智本人的作品集 PPT，版权归原作者所有。
