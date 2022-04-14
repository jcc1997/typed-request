import request from './index';
import { describe, it, expect } from 'vitest';

describe('typed-request 单元测试', () => {
    it.skip('should get back json', async () => {
        const resp = await request({
            url: `https://example.com?json=${JSON.stringify({
                json: 'json'
            })}`,
            method: 'GET'
        });
        if (resp) {
            expect(resp.data).toEqual({
                json: 'json'
            });
        }
    });
});
