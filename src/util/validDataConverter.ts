import { formatDate } from "./formatDate.js";
import { RequestParameterFormat } from "../@types/Express.types.js";


/**
 * 如果請求參數為空值佔位符('EMPTY_DATA'), 則轉換成 'null' 字串
 * 用於寫 sql query 的 function
 * @param {string | number} data - 請求參數
 * @returns {string | number} - 如果為空值佔位符則 return 'null' 字串, 
 *                              其他字串則會添加雙引號回傳
 */
const emptyDataConvert = (data: string | number): string | number | null => {
    if (typeof data === 'string') {
        return data === RequestParameterFormat.EmptyData ? null : `"${data}"`;
    }
    else {
        return data;
    }
}

/**
 * 如果 DATE 參數為空值佔位符('EMPTY_DATA'), 則轉換成 'null' 字串
 * 用於寫 sql 的 query 有 DATE 格式
 * @param {string | number} data - 請求參數
 * @returns {string | number} - 如果為空值佔位符則 return 'null' 字串, 
 *                              其他則會 return DATE
 */
const emptyDataDateConvert = (data: string): string | null => {
    return data === RequestParameterFormat.EmptyData ? null : `"${formatDate(data)}"`;
}

/**
 * 檢查請求參數是否為空值佔位符('EMPTY_DATA')
 * @param data - 請求參數
 * @returns {boolean}- 如果為空值佔位符則 return true
 */
const isEmptyData = (data: string): boolean => {
    return data === RequestParameterFormat.EmptyData ? true : false;
};

export { emptyDataConvert, emptyDataDateConvert, isEmptyData };