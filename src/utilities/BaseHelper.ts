import { Constants } from "../config/App";

export const toDateTime = (date: Date) : String => {

    let year = date.getFullYear();
    let month = (date.getMonth() + 1) > 9 ? (date.getMonth() + 1) : "0" + (date.getMonth() + 1);
    let day = date.getDate() > 9 ? date.getDate() : "0" + date.getDate();

    let hours = date.getHours() > 9 ? date.getHours() : "0" + date.getHours();
    let minutes = date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes();
    let seconds = date.getSeconds() > 9 ? date.getSeconds() : "0" + date.getSeconds();

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

};

export const getCurrentTS = () : any => {

    let dateNow = Date.now();
    let ts = module.exports.toDateTime(new Date(dateNow));
    let unixTs = Math.floor(dateNow / 1000);

    return {
        date: dateNow,
        timestamp: ts,
        unixTimestamp: unixTs
    };
    
};

export const decryptText = (text) => {
    
    let crypto = require('crypto');

    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(Constants.ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();

};