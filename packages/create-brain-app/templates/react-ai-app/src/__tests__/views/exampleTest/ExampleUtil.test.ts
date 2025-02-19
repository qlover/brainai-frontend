import { ExampleUtil } from '@/views/exampleTest/ExampleUtil';

describe('ExampleUtil', () => {
  describe('calc', () => {
    it('应该正确计算两个正数的和', () => {
      expect(ExampleUtil.calc(1, 2)).toBe(3);
    });

    it('应该正确计算正数和负数的和', () => {
      expect(ExampleUtil.calc(5, -3)).toBe(2);
    });

    it('应该正确计算两个负数的和', () => {
      expect(ExampleUtil.calc(-2, -4)).toBe(-6);
    });

    it('应该正确处理零', () => {
      expect(ExampleUtil.calc(0, 5)).toBe(5);
      expect(ExampleUtil.calc(5, 0)).toBe(5);
      expect(ExampleUtil.calc(0, 0)).toBe(0);
    });

    it('应该正确处理小数', () => {
      expect(ExampleUtil.calc(1.5, 2.3)).toBeCloseTo(3.8);
    });
  });
});
