# Short-URL-WEB

version: `0.4.1` 

縮短網址服務---一個基於 TypeScript、Express 和 MariaDB 的簡單縮短網址服務。用戶可以將長網址縮短為固定長度的短網址，並使用生成的短網址檢索原始網址。
## 功能
* 將長網址縮短為唯一的固定長度短網址。
* 通過短網址檢索原始網址。
* 通過 Hash 和唯一性檢查，保證不會生成重複的短網址。
* 使用 MariaDB 作為存儲網址的數據庫。
* 用 TypeScript 提供更好的類型安全和可維護性。
## 使用
### 前置條件
* Node.js (version: `18.18.2`)
* MariaDB
* npm
### 安裝模組
    npm i
### 啟動
    npm run start
