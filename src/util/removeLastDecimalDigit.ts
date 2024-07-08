/**
 * 刪除小數點最後一位, 用於處理 DB float 的精度問題
 * @param decimal - 帶小數的數值
 * @returns - 刪除小數點最後一位的數值
 */
const removeLastDecimalDigit = (decimal: number) =>{
    if (typeof decimal !== 'number') {
        throw new Error('Input must be a number');
    }

    const numberString = decimal.toString();
    const indexOfDecimal = numberString.indexOf('.');

    // 若沒有小數點，則返回原始數字
    if (indexOfDecimal === -1) {
        return decimal;
    }

    const truncatedNumberString = numberString.slice(0, indexOfDecimal + 1) + numberString.slice(indexOfDecimal + 1, -1);

    return parseFloat(truncatedNumberString);
}

export { removeLastDecimalDigit };