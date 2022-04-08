/* eslint-disable no-throw-literal */
import request from '../browser';
import fetchMock from 'jest-fetch-mock';
import { defineApi, defineApis, TRequestOptions } from '../index';

describe('typed-request 单元测试', () => {
    beforeEach(() => {
        fetchMock.resetMocks();
    });

    test('json', async () => {
        fetchMock.mockResponseOnce(
            JSON.stringify([{ name: 'naruto', average_score: 79 }]),
            { status: 200, headers: { 'Content-Type': 'application/json;charset=utf-8' } }
        );

        const apiDef = defineApi(
            async function (trq, options: { id: string }) {
                const { id } = options;
                const resp = await trq<TRequestOptions, { id: string }[]>({
                    url: '/api/:id',
                    method: 'GET',
                    params: { id }
                });
                return resp;
            }
        );

        const getData = apiDef(request);

        const resp = await getData({
            id: '1'
        });
        if (resp) {
            expect(resp.data).toEqual([{ name: 'naruto', average_score: 79 }]);
        }
    });

    test('json', async () => {
        fetchMock.mockResponseOnce(
            JSON.stringify([{ name: 'naruto', average_score: 79 }]),
            { status: 200, headers: { 'Content-Type': 'application/json;charset=utf-8' } }
        );

        const apiDefs = defineApis({
            async getData (trq, options: { id: string }) {
                const { id } = options;
                const resp = await trq<TRequestOptions, { id: string }[]>({
                    url: '/api/:id',
                    method: 'GET',
                    params: { id }
                });
                return resp;
            }
        });

        const apis = apiDefs(request);

        const resp = await apis.getData({
            id: '1'
        });
        if (resp) {
            expect(resp.data).toEqual([{ name: 'naruto', average_score: 79 }]);
        }
    });
});
