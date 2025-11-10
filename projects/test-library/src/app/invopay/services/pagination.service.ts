import { Injectable } from "@angular/core";
import { IPagination } from "../../shared/models/pagination";

export type QueryParams = {
    [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
};

@Injectable({
    providedIn: 'root'
})
export class PaginationService {
    constructor() { }

    getPageableParams(pagination: IPagination,
        sortFieldName?: string | string[],
        sortOrder?: string | string[]): QueryParams {
        const queryParameters: QueryParams = {
            page: pagination.page,
            size: pagination.size
        };
        if (
            sortFieldName &&
            typeof (sortFieldName) === 'string' &&
            sortFieldName.trim() !== '' &&
            sortOrder &&
            typeof (sortOrder) === 'string' &&
            sortOrder.trim() !== ''
        ) {
            queryParameters['sort'] = `${sortFieldName},${sortOrder}`;
        }
        if (
            sortFieldName &&
            Array.isArray(sortFieldName) &&
            sortOrder &&
            Array.isArray(sortOrder) &&
            sortFieldName.length === sortOrder.length
        ) {
            let sort: string[] = [];
            for (let i = 0; i < sortFieldName.length; i++) {
                sort.push(`${sortFieldName[i]},${sortOrder[i]}`)
            }
            queryParameters['sort'] = sort;

        }
        return queryParameters;
    }


}