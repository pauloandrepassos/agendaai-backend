import { NextFunction, Request, Response } from 'express';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

function convertDatesToLocalTimezone(data: unknown): unknown {
    if (Array.isArray(data)) {
        return data.map(item => convertDatesToLocalTimezone(item));
    } else if (data && typeof data === 'object') {
        const newData: Record<string, unknown> = { ...data };
        
        for (const key in newData) {
            if (newData[key] instanceof Date) {
                newData[key] = dayjs(newData[key] as Date).tz('America/Sao_Paulo').format();
            } else if (typeof newData[key] === 'object' && newData[key] !== null) {
                newData[key] = convertDatesToLocalTimezone(newData[key]);
            }
        }
        
        return newData;
    }
    return data;
}

function timezoneMiddleware(req: Request, res: Response, next: NextFunction) {
    const originalJson = res.json;
    
    res.json = function (data: unknown) {
        const transformedData = convertDatesToLocalTimezone(data);
        return originalJson.call(this, transformedData);
    };
    
    next();
}

export default timezoneMiddleware;
