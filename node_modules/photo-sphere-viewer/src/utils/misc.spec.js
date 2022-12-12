import assert from 'assert';

import { dasherize, deepEqual, deepmerge } from './misc';

describe('utils:misc:deepmerge', () => {
  it('should merge basic plain objects', () => {
    const one = { a: 'z', b: { c: { d: 'e' } } };
    const two = { b: { c: { f: 'g', j: 'i' } } };

    const result = deepmerge(one, two);

    assert.deepStrictEqual(one, { a: 'z', b: { c: { d: 'e', f: 'g', j: 'i' } } });
    assert.strictEqual(result, one);
  });

  it('should merge arrays by replace', () => {
    const one = { a: [1, 2, 3] };
    const two = { a: [2, 4] };

    const result = deepmerge(one, two);

    assert.deepStrictEqual(one, { a: [2, 4] });
    assert.strictEqual(result, one);
  });

  it('should clone object', () => {
    const one = { b: { c: { d: 'e' } } };

    const result = deepmerge(null, one);

    assert.deepStrictEqual(result, { b: { c: { d: 'e' } } });
    assert.notStrictEqual(result, one);
    assert.notStrictEqual(result.b.c, one.b.c);
  });

  it('should clone array', () => {
    const one = [{ a: 'b' }, { c: 'd' }];

    const result = deepmerge(null, one);

    assert.deepStrictEqual(result, [{ a: 'b' }, { c: 'd' }]);
    assert.notStrictEqual(result[0], one[1]);
  });

  it('should accept primitives', () => {
    const one = 'foo';
    const two = 'bar';

    const result = deepmerge(one, two);

    assert.strictEqual(result, 'bar');
  });

  it('should stop on recursion', () => {
    const one = { a: 'foo' };
    one.b = one;

    const result = deepmerge(null, one);

    assert.deepStrictEqual(result, { a: 'foo' });
  });
});

describe('utils:misc:dasherize', () => {
  it('should dasherize from camelCase', () => {
    assert.strictEqual(dasherize('strokeWidth'), 'stroke-width');
  });

  it('should not change existing dash-case', () => {
    assert.strictEqual(dasherize('stroke-width'), 'stroke-width');
  });
});

describe('utils:misc:deepEqual', () => {
  it('should compare simple objects', () => {
    assert.strictEqual(deepEqual(
      { foo: 'bar' },
      { foo: 'bar' },
    ), true);

    assert.strictEqual(deepEqual(
      { foo: 'bar' },
      { foo: 'foo' },
    ), false);

    assert.strictEqual(deepEqual(
      { foo: 'bar' },
      { foo: 'bar', baz: 'bar' },
    ), false);
  });

  it('should compare nested objects', () => {
    assert.strictEqual(deepEqual(
      { foo: { bar: 'baz' } },
      { foo: { bar: 'baz' } },
    ), true);

    assert.strictEqual(deepEqual(
      { foo: { bar: 'baz' } },
      { foo: { bar: 'foo' } },
    ), false);

    assert.strictEqual(deepEqual(
      { foo: { bar: 'baz' } },
      { foo: { bar: 'baz', baz: 'bar' } },
    ), false);
  });

  it('should compare arrays', () => {
    assert.strictEqual(deepEqual(
      { foo: ['bar', 'baz'] },
      { foo: ['bar', 'baz'] },
    ), true);

    assert.strictEqual(deepEqual(
      { foo: ['bar', 'baz'] },
      { foo: ['bar', 'bar'] },
    ), false);
  });

  it('should compare standard types', () => {
    assert.strictEqual(deepEqual(
      { a: 'foo', b: false, c: -4 },
      { a: 'foo', b: false, c: -4 },
    ), true);

    assert.strictEqual(deepEqual(
      { a: 'foo', b: false, c: -4 },
      { a: 'foo', b: 'false', c: -4 },
    ), false);

    assert.strictEqual(deepEqual(
      { a: 'foo', b: false, c: -4 },
      { a: 'foo', b: false, c: '-4' },
    ), false);
  });
});
