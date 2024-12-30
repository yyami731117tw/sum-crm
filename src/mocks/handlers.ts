import { rest } from 'msw';

export const handlers = [
  // 獲取會員統計
  rest.get('/api/stats/members', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        totalMembers: 13,
        investorMembers: 0,
        genderStats: {
          male: 10,
          female: 3
        },
        managerStats: {
          total: 13
        }
      })
    );
  }),
]; 