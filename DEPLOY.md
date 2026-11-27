# 部署 / 在别处打开

这个站点是纯静态的（HTML + CSS + JS + 图片 + 字体），**不需要后端、不需要构建、不需要联网**。
下面按「给别人看」的距离从近到远排。

---

## 方式零：发个临时链接（1 分钟，不用注册）

适合「现在就想发给别人点开看看」。

1. 双击 **`share.bat`**
2. 等 10 秒左右，窗口会显示一条 `https://xxxx.trycloudflare.com` 的链接（已自动复制到剪贴板）
3. 把链接发给对方，手机电脑都能直接打开

- ✅ 不用注册、不用上传，HTTPS 链接
- ⚠️ **电脑要开着**，`share.bat` 开出的两个最小化窗口不要关
- ⚠️ 关掉就失效；重新运行会得到一条**新链接**（旧链接作废）
- 底层是 Cloudflare 的免费快速隧道（`tools/cloudflared.exe`），不保证长期在线
- 想要固定网址：往下看方式三 / 四

---

## 方式一：拷走就能看（U 盘 / 网盘 / 发给别人）

把**整个 `portfolio_site` 文件夹**拷过去，双击 `index.html` 即可。

- ✅ 完全离线，字体和图片都在本地
- ⚠️ 一定要拷**整个文件夹**，只发 `index.html` 会没有图片（图片在 `assets/` 里）
- ⚠️ 微信直接发文件夹不行，先压缩成 zip；或上传网盘把链接发给对方
- 适合：发给面试官、放进 U 盘带去现场演示

---

## 方式二：同一 Wi-Fi 下用手机 / 同事电脑看（不用上传）

1. 双击 `start.bat`，选 **2**
2. 窗口里会打印两个地址：
   ```
   本机：   http://127.0.0.1:6123/
   局域网： http://192.168.x.x:6123/    ← 手机浏览器输入这个
   ```
3. 手机连**同一个 Wi-Fi**，输入「局域网」那行地址（可以生成二维码扫）

命令行等价写法：

```bash
python serve.py --host 0.0.0.0 --open
```

- ⚠️ Windows 首次运行可能弹防火墙提示，选「允许」
- ⚠️ 电脑不能休眠；公司网络若隔离了设备互访，手机可能连不上（换手机热点再试）
- 适合：当面给客户/领导看，或自己手机上检查移动端效果

---

## 方式三：GitHub Pages（免费、固定网址，最推荐）

**网址形如** `https://你的用户名.github.io/portfolio/`

1. 注册 / 登录 GitHub
2. 新建仓库，名字随意（例如 `portfolio`），选 **Public**
3. 页面上点 **uploading an existing file**，把 `portfolio_site` 里的**所有内容**（不是文件夹本身）拖进去，Commit
   - 必须包含 `index.html`、`styles.css`、`app.js`、`data.js`、`assets/`
4. 仓库 **Settings → Pages** → Source 选 `Deploy from a branch`，Branch 选 `main`、目录 `/ (root)`，Save
5. 等 1～2 分钟，刷新 Settings → Pages，就能看到网址

更新内容：重新上传改过的文件并 Commit，1 分钟后自动生效。

> 注：GitHub 在国内访问可能偏慢，介意的话用方式四或五。

---

## 方式四：Netlify / Vercel（拖拽上传，1 分钟）

1. 打开 <https://app.netlify.com/drop>（或 <https://vercel.com/new>）
2. 把 `portfolio_site` **文件夹**直接拖进页面
3. 等几十秒，得到一个 `https://xxx.netlify.app` 网址
4. 可以在设置里改站点名，或绑定自己的域名

- 不需要 Git、不需要命令行，适合临时投递 / 作品集链接
- Netlify 免费额度足够个人作品集

---

## 方式五：国内对象存储（访问快、可绑域名）

阿里云 OSS、腾讯云 COS、七牛都可以做「静态网站托管」：

1. 新建 Bucket，读写权限设为**公共读**
2. 开启「静态网站托管」，默认首页填 `index.html`
3. 把 `portfolio_site` 里的所有文件上传到 Bucket 根目录
4. 用 Bucket 的访问域名打开

- ⚠️ 绑定自己的域名需要**域名备案**（中国大陆节点）
- ⚠️ 上传时确认 `.webp` 的 Content-Type 是 `image/webp`（一般会自动识别）

---

## 三个容易踩的坑

| 坑 | 现象 | 解决 |
| --- | --- | --- |
| 只拷了 `index.html` | 页面有字没图 | 拷整个文件夹（`assets/` 必须一起） |
| 服务器 MIME 不对 | 图片显示不出来 | 用 `serve.py`；或确认托管平台返回 `image/webp` |
| 用 `python -m http.server` | 首屏图片偶发空白 | 这个内置服务器是单线程的，用 `serve.py`（多线程） |

## 改完之后怎么更新

- 只改文案：编辑 `index.html` 直接保存
- 改作品：编辑 `projects.json` → 运行 `python patch_data.py`
- 加图：原图放 `assets/raw/` → 运行 `python optimize_images.py`
- 上传过公网的话，记得把改动过的文件重新上传（或重新拖一次整个文件夹）
