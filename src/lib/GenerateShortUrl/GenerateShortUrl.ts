/**
 * 生成短網址
 */

const GenerateShortUrl = {
    /**
     * generateUrl
     * @param length - The Url length
     * @returns {string} - The generateUrl.
     */
    generateUrl: (length: number) : string => {
        const availableChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let cryptoUrl = '';
    
        for(var i = 0; i < length; i++){
            cryptoUrl += availableChars.charAt(Math.floor(Math.random() * availableChars.length));
        }
    
        return cryptoUrl;
    }
}

export { GenerateShortUrl };