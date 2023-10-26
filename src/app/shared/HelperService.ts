import { Inject, Injectable } from '@angular/core';
@Injectable({
    providedIn: 'root'
})

export class HelperService {
    constructor(
    ) { }

    public dateFormat(date_item) {
        if (date_item) {
            let d = new Date(date_item);
            let month = '' + (d.getMonth() + 1);
            let day = '' + d.getDate();
            let year = d.getFullYear();

            if (month.length < 2) {
                month = '0' + month;
            }
            if (day.length < 2) {
                day = '0' + day;
            }

            return [day, month, year].join('/');
        }
        else {
            return '';
        }
    }

    public dateTimeFormat(date_time_item) {
        if (date_time_item) {
            let d = new Date(date_time_item);
            let month = '' + (d.getMonth() + 1);
            let day = '' + d.getDate();
            let year = d.getFullYear();
            let hours = d.getHours().toString();
            let minutes = d.getMinutes().toString();

            if (month.length < 2) {
                month = '0' + month;
            }

            if (day.length < 2) {
                day = '0' + day;
            }

            if (parseInt(hours) < 10) {
                hours = '0' + hours;
            }

            if (parseInt(minutes) < 10) {
                minutes = '0' + minutes;
            }

            return [day, month, year].join('/') + ' ' + hours + ':' + minutes;
        }
        else {
            return '';
        }
    }

    public generateUniqueNum(len) {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < len; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result + new Date().getTime();
    }

    public removeExtraSymbols(str) {
        return str.replace(/[^a-zA-Z0-9 ]/g, '').trim();
    }



    public extractModulusSubstring(input: string): [string, string] {
        if (input === null) {
            return ['', ''];
        }

        const startIndex = input.indexOf('%');
        const endIndex = input.lastIndexOf('%');
        let placeHolder = '';
        let name: string;

        if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
            placeHolder = `%${input.substring(startIndex + 1, endIndex)}%`;
        }

        name = input.replace(placeHolder, '');

        return [name, placeHolder];
    }

}
