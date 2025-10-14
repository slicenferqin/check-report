# Unified Project Structure

```plaintext
checkReport/
├── .github/                          # CI/CD workflows
│   └── workflows/
│       ├── ci.yml                    # 持续集成
│       └── deploy.yml                # 部署流程
├── apps/                             # 应用层
│   ├── web/                          # 前端应用
│   │   ├── src/
│   │   │   ├── components/           # UI 组件
│   │   │   │   ├── common/
│   │   │   │   ├── public/
│   │   │   │   └── admin/
│   │   │   ├── pages/                # 页面组件
│   │   │   ├── services/             # API 客户端
│   │   │   ├── hooks/                # 自定义 Hooks
│   │   │   ├── contexts/             # Context API
│   │   │   ├── types/                # 类型定义
│   │   │   ├── utils/                # 工具函数
│   │   │   ├── styles/               # 全局样式
│   │   │   ├── App.tsx               # 根组件
│   │   │   └── main.tsx              # 入口文件
│   │   ├── public/                   # 静态资源
│   │   ├── index.html                # HTML 模板
│   │   ├── vite.config.ts            # Vite 配置
│   │   ├── tailwind.config.js        # TailwindCSS 配置
│   │   ├── tsconfig.json             # TypeScript 配置
│   │   └── package.json
│   └── api/                          # 后端应用
│       ├── src/
│       │   ├── routes/               # 路由定义
│       │   ├── controllers/          # 控制器
│       │   ├── services/             # 业务逻辑
│       │   ├── repositories/         # 数据访问
│       │   ├── middleware/           # 中间件
│       │   ├── utils/                # 工具函数
│       │   ├── types/                # 类型定义
│       │   └── server.ts             # 服务器入口
│       ├── prisma/                   # Prisma 配置
│       │   ├── schema.prisma         # 数据库模型
│       │   ├── migrations/           # 数据库迁移
│       │   └── seed.ts               # 数据库种子
│       ├── tests/                    # 测试文件
│       ├── tsconfig.json
│       └── package.json
├── packages/                         # 共享包
│   ├── shared/                       # 共享类型和工具
│   │   ├── src/
│   │   │   ├── types/                # TypeScript 接口
│   │   │   │   ├── report.ts
│   │   │   │   ├── admin.ts
│   │   │   │   └── index.ts
│   │   │   ├── constants/            # 常量定义
│   │   │   └── utils/                # 共享工具函数
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── config/                       # 共享配置
│       ├── eslint/
│       │   └── .eslintrc.js
│       ├── typescript/
│       │   └── tsconfig.base.json
│       └── prettier/
│           └── .prettierrc.js
├── docs/                             # 文档
│   ├── prd.md                        # 产品需求文档
│   ├── brief.md                      # 项目简介
│   └── architecture.md               # 架构文档（本文件）
├── scripts/                          # 构建和部署脚本
│   ├── deploy-frontend.sh            # 前端部署脚本
│   └── deploy-backend.sh             # 后端部署脚本
├── .env.example                      # 环境变量模板
├── .gitignore                        # Git 忽略文件
├── pnpm-workspace.yaml               # pnpm workspace 配置
├── package.json                      # 根 package.json
├── tsconfig.json                     # 根 TypeScript 配置
└── README.md                         # 项目说明
```

---
