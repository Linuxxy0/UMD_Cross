# Deployment Guide

## 推荐仓库名

```text
transmigrator-wuxia
```

项目展示名建议保持为：**一念穿越：江湖初卷**。

## 本地运行

```bash
python3 -m http.server 8080
```

访问：`http://localhost:8080/`

## GitHub Pages

1. 新建仓库，例如 `transmigrator-wuxia`
2. 推送代码到 `main`
3. 在仓库 `Settings -> Pages` 中将 `Source` 设为 `GitHub Actions`
4. 等待 `.github/workflows/deploy-pages.yml` 执行完成
5. 打开 `https://<username>.github.io/transmigrator-wuxia/`

## 版本页

项目根目录已经包含：

```text
version.html
```

可用于：
- GitHub Pages 对外版本展示
- Release 说明中的版本入口
- README 中的版本说明跳转

## 自定义域名

如需绑定自定义域名：
1. 在仓库根目录添加 `CNAME`
2. 内容填写你的域名
3. 在域名服务商处配置指向 GitHub Pages 的记录

## 发布建议
- 每次发布同步更新 `package.json`、`js/core/namespace.js` 与 `CHANGELOG.md`
- 若存档结构调整，请同步升级 `STORAGE_KEY`
- 保持静态资源相对路径，避免子路径部署异常
- 若仓库名不是 `transmigrator-wuxia`，请同步更新 README 中的访问地址
