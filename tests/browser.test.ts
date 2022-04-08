import request from '../browser';
import fetchMock from 'jest-fetch-mock';
import { TRequestMiddleware } from '../interface';

describe('typed-request 单元测试', () => {
    beforeEach(() => {
        fetchMock.resetMocks();
    });

    test('json', async () => {
        fetchMock.mockResponseOnce(
            JSON.stringify([{ name: 'naruto', average_score: 79 }]),
            { status: 200, headers: { 'Content-Type': 'application/json;charset=utf-8' } }
        );

        const [resp, error] = await request.to({
            url: '/test',
            method: 'GET'
        });
        if (resp) {
            expect(resp.data).toEqual([{ name: 'naruto', average_score: 79 }]);
        }
    });

    test('error', async () => {
        fetchMock.mockResponseOnce(
            () => { throw new Error('fetch error'); }
        );

        const [resp, error] = await request.to({
            url: '/test',
            method: 'GET'
        });

        expect(!!error).toBeTruthy();
        if (error) {
            expect(error.error.message).toEqual('fetch error');
        }
    });

    test('create & middleware', async () => {
        fetchMock.mockResponseOnce(
            JSON.stringify([{ name: 'naruto', average_score: 79 }]),
            { status: 404, headers: { 'Content-Type': 'application/json;charset=utf-8' } }
        );
        const middleware: TRequestMiddleware = async function (options, next) {
            const resp = await next!(options);
            return resp;
        };
        const newRequest = request.create(middleware);
    });
});
