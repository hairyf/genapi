# 告别手写 API 调用！用 genapi 自动生成 TypeScript API

从前有一个 **genapi** 的工具，它能从 OpenAPI/Swagger，或者任意的数据源自动生成类型安全的 TS/JS API 代码。

今天他重构并且升级到了 4.0.0 版本，支持了很多新的功能，甚至有了文档、交互性浏览页面、测试也更加完善了。

## 手写 API 的痛

每次对接后端接口，我都要：
  1. 打开 Swagger 文档
  2. 复制接口路径和参数
  3. 手写请求函数
  4. 手动定义类型
  5. 接口变更后，再重复一遍

最麻烦就是后端改了接口但忘记通知前端，运行时才发现类型不匹配。这种重复劳动浪费时间，还容易出错。

genapi 可以直接读取 OpenAPI 文档，自动生成类型安全的 API 调用代码。接口变更后，重新运行一下命令就能同步更新。

## genapi 是什么？

是一个 API 代码生成器，能把 OpenAPI 2.0/3.x 规范转换成 TS/JS 的 API 调用代码。

它支持多种 HTTP 客户端：
- `axios` - 最常用的 Promise 请求库
- `fetch` - 浏览器原生 API
- `ky` - 轻量优雅的请求库
- `got` - Node.js 友好的请求库
- `ofetch` - 更好的 fetch，带 TypeScript 支持
- `uni` - uniapp 的网络请求库

每种客户端都支持生成 TypeScript 和 JavaScript 两种版本。

## 快速上手

```bash
npx genapi init
```

完成后会在项目根目录生成 `genapi.config.ts`，把 `input` 改成你的 API JSON 地址就行。

接着运行生成命令：

```bash
npm run genapi
```

## 配置文件（`genapi.config.ts`）

```ts
import { defineConfig } from '@genapi/core'
import { axios } from '@genapi/presets'

export default defineConfig({
  preset: axios.ts,
  // 你的 Swagger API 文档地址
  input: 'http://example.com/api-docs',
  output: {
    main: 'src/api/index.ts',
    type: 'src/api/index.type.ts',
  },
  meta: {
    // API 基础 URL，会传递给 axios
    baseURL: 'import.meta.env.VITE_APP_BASE_API',
    // 自定义响应类型提取，默认是 'T'
    responseType: 'T extends { data?: infer V } ? V : void',
  },
})
```

生成后的代码大概是这样的：

```ts
// src/api/index.ts
import axios from 'axios'

export function getUsersId(id: string) {
  return axios.get<User>(`/users/${id}`)
}

export function putUsersId(id: string, data: UpdateUserDto) {
  return axios.put<User>(`/users/${id}`, data)
}
```

类型定义会单独生成在 `src/api/index.type.ts`。

## 几个实用功能

### 多服务支持

项目有多个后端服务的话，可以这样配置：

```ts
export default defineConfig({
  meta: {
    baseURL: 'https://api.example.com',
  },
  servers: [
    {
      input: 'http://user-service/api-docs',
      output: { main: 'src/api/user.ts' }
    },
    {
      input: 'http://order-service/api-docs',
      output: { main: 'src/api/order.ts' }
    },
  ]
})
```

所有服务会继承顶层配置，但可以单独指定输出路径。

### Schema 模式

`fetch` 和 `ofetch` 预设支持 Schema 模式，生成基于 schema 的类型安全 fetch API。

先安装 `fetchdts`：

```bash
npm i -D fetchdts
```

配置：

```ts
import { defineConfig } from '@genapi/core'
import { fetch } from '@genapi/presets'

export default defineConfig({
  preset: fetch.schema,
  input: 'https://petstore.swagger.io/v2/swagger.json',
  output: {
    main: 'src/api/index.ts',
  },
})
```

生成后的 `$fetch` 函数会自动提示路径和参数（类型完整）：

```ts
import { $fetch } from './api'

// IDE 会提示路径和参数
const users = await $fetch('/users')
const user = await $fetch('/users/123')
```

### 自定义生成结果

生成的函数名或类型不符合命名规范时，可以用 `transform` 批量修改，或者用 `patch` 精确修改。两者可以组合使用，`transform` 先执行，`patch` 后执行：

```ts
export default defineConfig({
  preset: axios.ts,
  input: 'https://petstore.swagger.io/v2/swagger.json',
  transform: {
    // 批量给函数名加前缀
    operation: name => `api_${name}`,
    // 批量去掉 Dto 后缀
    definition: name => name.endsWith('Dto') ? name.slice(0, -3) : name
  },
  patch: {
    operations: {
      // 精确重命名函数（transform 执行后）
      api_getUserUsingGET: 'fetchUser',
      // 修改参数和返回类型
      api_postUpdateUserUsingPOST: {
        name: 'updateUserInfo',
        parameters: [{ name: 'id', type: 'string', required: true }],
        responseType: 'UserResponse'
      }
    },
    definitions: {
      // 精确重命名类型
      User: 'UserInfo',
      // 覆盖类型定义
      Session: {
        name: 'Session',
        type: '{ name: string, age: number }'
      }
    }
  }
})
```

### Mock 数据生成

开启 `mockjs` 后，会为每个 API 函数生成 mock 方法：

```ts
export default defineConfig({
  preset: axios.ts,
  input: 'https://petstore.swagger.io/v2/swagger.json',
  mockjs: true,
})
```

使用：

```ts
import { getUser } from './api'

// 返回符合类型定义的 mock 数据
const mockUser = getUser.mock()
```

> 需要注意以下，得安装 `better-mock`

## 自定义管道

genapi 的核心是管道系统，如果你有特殊需求，例如想自定义数据源之类的，那就可以自定义管道：

```ts
import pipeline, { compiler, dest, generate, original } from '@genapi/pipeline'
import { axios } from '@genapi/presets'

export default defineConfig({
  preset: pipeline(
    // 读取配置
    config => axios.ts.config(config),
    // 获取数据源
    configRead => original(configRead),
    // 解析为数据图
    configRead => axios.ts.parser(configRead),
    // 编译为 AST
    configRead => compiler(configRead),
    // 生成代码字符串
    configRead => generate(configRead),
    // 输出文件
    configRead => dest(configRead),
  ),
})
```

每个管道步骤都可以替换或扩展，灵活性很高。

## 写在最后

genapi 解决了 API 代码生成的痛点，把前端开发者从重复劳动里解放出来。虽然不能完全替代手写代码，但对于标准化的 REST API，确实能提升开发效率。

项目地址：[https://github.com/hairyf/genapi](https://github.com/hairyf/genapi)

大伙们在项目里是怎么处理 API 调用的？
