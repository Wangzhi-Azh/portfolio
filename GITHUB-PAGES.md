# 用 GitHub Pages 做一个永久链接

目标：得到一个可以印在简历上、发给任何人都能打开的固定网址，形如

```
https://你的用户名.github.io/portfolio/
```

全程免费，只需要一个 GitHub 账号。

> 本文对应的是 `portfolio_site` 这一版（2024 作品集）。改完内容后按「第 6 步：以后怎么更新」重新上传即可。

---

## 前置自检（1 分钟）

在动手之前，先确认本地这版是对的：

1. 双击 `portfolio_site\index.html`，确认首页、27 个作品、字体都正常
2. 如果哪里要改，先改完再上传（省得反复覆盖）

---

## 第 1 步：注册 / 登录 GitHub

打开 <https://github.com> → 右上角 **Sign up**。

- 用户名会出现在网址里，建议用英文名，例如 `wangzhi-design`
- 邮箱要能收信（后面可能验证）

已有账号直接 **Sign in**。

---

## 第 2 步：新建仓库

1. 右上角 **+** → **New repository**
2. 填写：
   - **Repository name**：`portfolio`
   - **Description**：可留空
   - **Public**（必须选公开，私有仓库的 Pages 需要付费）
   - **不要勾选** Add a README file（勾了会多一个文件，容易和我们的冲突）
3. 点 **Create repository**

创建后页面会显示一个空仓库，中间有一段 `Quick setup`，下面有个蓝色链接
**uploading an existing file** —— 点它。

---

## 第 3 步：上传文件（分成 6 批）

GitHub 网页一次最多上传 100 个文件，而站点一共 260 个，所以我在 `D:\王智\gh-upload\` 里按顺序切好了 6 个文件夹。
**依次把每一批拖进网页**，每次拖完点页面下方的绿色 **Commit changes**。

| 批次 | 打开这个文件夹 | 把里面的什么拖进网页 | 文件数 |
| --- | --- | --- | --- |
| 1 | `gh-upload\1-root\` | 里面的**全部文件**（不要拖文件夹本身） | 14 |
| 2 | `gh-upload\2-img-a\` | 把 **`assets` 文件夹** 拖进页面 | 60 |
| 3 | `gh-upload\3-img-b\` | 把 **`assets` 文件夹** 拖进页面 | 60 |
| 4 | `gh-upload\4-thumb-a\` | 把 **`assets` 文件夹** 拖进页面 | 60 |
| 5 | `gh-upload\5-thumb-b\` | 把 **`assets` 文件夹** 拖进页面 | 60 |
| 6 | `gh-upload\6-rest\` | 把 **`assets` 文件夹** 拖进页面 | 7 |

要点：

- **第 1 批最关键**：拖完之后仓库根目录必须直接看到 `index.html`，**不能**出现 `portfolio_site/index.html`
- 第 2～6 批拖的都是名为 `assets` 的文件夹，GitHub 会自动合并到同一个 `assets/` 目录里，不会互相覆盖
- 每批都要等上传进度条走完，再点 **Commit changes**（默认信息不用改）

全部传完后，仓库根目录应该是这样的结构：

```
index.html
styles.css
app.js
data.js
projects.json
README.md  DEPLOY.md  GITHUB-PAGES.md
serve.py  start.bat  share.bat
extract_images.py  optimize_images.py  patch_data.py
assets/
  img/ (120 张)
  thumb/ (120 张)
  bg/ (5 张)
  fonts/ (1 个字体)
  favicon.svg
```

> 传错/漏传怎么办：在网页上点进对应文件夹，右上角 **Add file → Upload files** 继续补，或者删掉重传。

---

## 第 4 步：开启 Pages

1. 仓库页面顶部点 **Settings**
2. 左侧栏找到 **Pages**
3. **Source** 选 **Deploy from a branch**
4. **Branch** 选 **main**，右边目录选 **/ (root)**
5. 点 **Save**

保存后页面顶部会出现一行提示，等 1～2 分钟刷新，会显示：

```
Your site is live at https://你的用户名.github.io/portfolio/
```

---

## 第 5 步：验证

用手机流量（不是 Wi-Fi）打开那个网址，逐项确认：

- [ ] 首屏标题「设备会 **呼吸** / 产线才有 **生命**」是手写体
- [ ] 往下滚，27 个作品卡片都有图
- [ ] 点任意作品能打开图集，`←` `→` 可翻页
- [ ] 手机上是「标题 → 产品图 → 导语」的顺序
- [ ] 底部邮箱、电话可点

有问题看文末「常见问题」。

---

## 第 6 步：以后怎么更新

只改了文案（`index.html`）：

1. 仓库里点进 `index.html` → 右上角铅笔图标 **Edit**
2. 改完拉到下面 **Commit changes**
3. 等 1 分钟刷新网站

改了作品（`projects.json` → `data.js`）或换了图：

1. 本地先跑一遍 `patch_data.py` / `optimize_images.py`
2. 把**改过的那几个文件**拖到仓库根目录（GitHub 会提示覆盖同名文件）→ Commit
3. 等 1 分钟生效

> 缓存在浏览器端比较顽固时，用 `Ctrl + Shift + R` 强刷，或在链接后加 `?v=2` 再打开。

---

## 常见问题

**1. 打开是 404 / 「There isn't a GitHub Pages site here」**

- Pages 刚开启要等 1～3 分钟；多刷新几次
- 确认 Settings → Pages 里 Branch 是 `main`、目录是 `/ (root)`，并且有绿色 "Your site is live" 提示

**2. 页面能打开，但没有图片 / 样式全乱**

- 检查仓库根目录是不是直接有 `assets/` 和 `styles.css`（而不是 `portfolio_site/assets`）
- 漏传了某一批：对照上表把缺的文件夹再拖一次

**3. 首页显示的是 README 的内容**

- 说明 `index.html` 不在根目录，或被放进了子文件夹：把它移到根目录（网页上可以点文件 → 铅笔旁边的 `...` → 没有移动功能，只能重传）
- 简单做法：删掉子文件夹，重新执行第 3 步第 1 批

**4. 中文文件名会不会有问题**

- 这一版所有文件名都是英文/数字（`start.bat` 不是 `预览.bat`），不会出问题

**5. 国内访问慢**

- GitHub Pages 在国内时快时慢。介意的话可以：
  - 给仓库绑自己的域名（见下）
  - 或同时用 Netlify / 阿里云 OSS 部署一份（见 `DEPLOY.md`）

---

## 可选：绑定自己的域名

1. 在域名服务商加一条 CNAME 记录：`portfolio.你的域名.com` → `你的用户名.github.io`
2. 仓库 Settings → Pages → **Custom domain** 填 `portfolio.你的域名.com` → Save
3. 勾选 **Enforce HTTPS**（证书自动签发，等几分钟）
4. 国内域名需要备案才能走大陆节点

---## 提醒

- 仓库是 **Public**，任何人能看到源码和图片。作品集本来就是公开的，一般没问题
- 图片合计 12MB，Pages 的限额是 1GB，完全够用
- 不想让别人看到 `extract_images.py` 这类脚本，可以删掉，不影响网页
