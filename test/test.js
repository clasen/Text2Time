const assert = require('assert');
const { Text2Time } = require('../index');
const { format } = require('date-fns');

const DATE_FORMAT = 'yyyy-MM-dd EEEE HH:mm:ss';

describe('Text2Time', function () {
    describe('#next()', function () {
        const testCases = [
            { input: 'now', expected: '2023-05-15 Monday 12:00:00', now: new Date('2023-05-15T12:00:00') },
            { input: 'add 1 day', expected: '2023-05-16 Tuesday 12:00:00', now: new Date('2023-05-15T12:00:00') },
            { input: 'add 7 days', expected: '2023-05-22 Monday 12:00:00', now: new Date('2023-05-15T12:00:00') },
            { input: 'add 7 days 15:00', expected: '2023-05-22 Monday 15:00:00', now: new Date('2023-05-15T12:00:00') },
            { input: 'add 1 week', expected: '2023-05-22 Monday 12:00:00', now: new Date('2023-05-15T12:00:00') },
            { input: 'add 2 week', expected: '2023-05-29 Monday 12:00:00', now: new Date('2023-05-15T12:00:00') },
            { input: 'add 1 week 15:00', expected: '2023-05-22 Monday 15:00:00', now: new Date('2023-05-15T12:00:00') },
            { input: 'add 2 week 15:00', expected: '2023-05-29 Monday 15:00:00', now: new Date('2023-05-15T12:00:00') },
            { input: 'tuesday', expected: '2023-05-16 Tuesday 12:00:00', now: new Date('2023-05-15T12:00:00') },
            { input: 'july week monday', expected: '2024-07-01 Monday 12:00:00', now: new Date('2023-08-15T12:00:00') },
            { input: 'july first week monday', expected: '2024-07-01 Monday 12:00:00', now: new Date('2023-08-15T12:00:00') },
            { input: 'july second week friday', expected: '2023-07-14 Friday 12:00:00', now: new Date('2023-05-15T12:00:00') },
            {
                input: 'august monday to thursday', expected: {
                    date: '2023-08-07 Monday 12:00:00',
                    ends: '2023-08-10 Thursday 12:00:00'
                }, now: new Date('2023-05-15T12:00:00')
            },
            {
                input: 'august monday to thursday 15:00', expected: {
                    date: '2023-08-07 Monday 15:00:00',
                    ends: '2023-08-10 Thursday 15:00:00'
                }, now: new Date('2023-05-15T12:00:00')
            },
            {
                input: 'september second monday to thursday', expected: {
                    date: '2023-09-11 Monday 12:00:00',
                    ends: '2023-09-14 Thursday 12:00:00'
                }, now: new Date('2023-05-15T12:00:00')
            },
            { input: 'add 1 month', expected: '2023-06-15 Thursday 12:00:00', now: new Date('2023-05-15T12:00:00') },
            { input: '16 september', expected: '2023-09-16 Saturday 12:00:00', now: new Date('2023-05-15T12:00:00') },
            { input: '16 september 12:00', expected: '2023-09-16 Saturday 12:00:00', now: new Date('2023-05-15T15:00:00') },
            { input: 'thursday', expected: '2023-05-18 Thursday 12:00:00', now: new Date('2023-05-15T12:00:00') },
            { input: '16 february', expected: '2024-02-16 Friday 12:00:00', now: new Date('2023-05-15T12:00:00') },
            { input: '30', expected: '2024-08-30 Friday 12:00:00', now: new Date('2024-08-01T12:00:00') },
            { input: '30 11:11:11', expected: '2024-08-30 Friday 11:11:11', now: new Date('2024-08-01T12:00:00') },
            { input: 'saturday', expected: '2023-05-20 Saturday 12:00:00', now: new Date('2023-05-15T12:00:00') },
        ];

        testCases.forEach(({ input, expected, now }, index) => {
            it(`should correctly parse "${input}"`, function () {
                const parser = new Text2Time({ now });
                const result = parser.next(input);

                if (typeof expected === 'object' && expected.date && expected.ends) {
                    assert.deepStrictEqual(
                        {
                            date: format(result.date, DATE_FORMAT),
                            ends: format(result.ends, DATE_FORMAT)
                        },
                        expected
                    );
                } else {
                    assert.strictEqual(
                        format(result.date, DATE_FORMAT),
                        expected
                    );
                }
            });
        });
    });

    describe('#every()', function () {
        const testCases = [
            { input: "August At 00:05:10", expected: "10 5 0 * 8 *" },
            { input: "August At 00:05", expected: "0 5 0 * 8 *" },
            { input: "day 3 At 14:15:00", expected: "0 15 14 3 * *" },
            { input: "day from mon to fri", expected: "0 0 0 * * 1-5" },
            { input: "sun At 04:05:20", expected: "20 5 4 * * 0" },
            { input: "5 days on Sunday At 04:05:00", expected: "0 5 4 */5 * 0" },
            { input: "day from Sunday to Wednesday At 04:00", expected: "0 0 4 * * 0-3" },
            { input: "Friday and Monday At 04:05", expected: "0 5 4 * * 1,5" },
            { input: "friday", expected: "0 0 0 * * 5" },
            { input: "At 4:04", expected: "0 4 4 * * *" },
            { input: "5 minutes", expected: "0 */5 * * * *" },
            { input: "5 sec", expected: "*/5 * * * * *" },
            { input: "5 seconds", expected: "*/5 * * * * *" },
            { input: "1 hour", expected: "0 0 */1 * * *" },
            { input: "3 hours", expected: "0 0 */3 * * *" },
            { input: "1 day", expected: "0 0 0 */1 * *" },
            { input: "3 days", expected: "0 0 0 */3 * *" },
            { input: "1 month", expected: "0 0 0 1 */1 *" },
            { input: "3 months", expected: "0 0 0 1 */3 *" },
            { input: "3 months at 4:04", expected: "0 4 4 1 */3 *" },
            { input: "3 months day 5 at 4:04", expected: "0 4 4 5 */3 *" },
        ];

        testCases.forEach(({ input, expected }, index) => {
            it(`should correctly parse "${input}"`, function () {
                const parser = new Text2Time();
                const result = parser.every(input);
                assert.strictEqual(result, expected);
            });
        });
    });

    describe('parsing regressions', function () {
        it('keeps the reference date and later calls unchanged after an explicit time', function () {
            const now = new Date('2023-05-15T12:00:00');
            const parser = new Text2Time({ now });
            const result = parser.next('add 1 day 15:30:20');
            assert.strictEqual(format(result.date, DATE_FORMAT), '2023-05-16 Tuesday 15:30:20');
            assert.strictEqual(format(now, DATE_FORMAT), '2023-05-15 Monday 12:00:00');
            assert.strictEqual(format(parser.next('add 1 day').date, DATE_FORMAT), '2023-05-16 Tuesday 12:00:00');
        });

        it('returns an independent date for now', function () {
            const parser = new Text2Time({ now: new Date('2023-05-15T12:00:00') });
            parser.next('now').date.setFullYear(2000);
            assert.strictEqual(parser.now.getFullYear(), 2023);
        });

        it('finds Sunday, including the following week when today is Sunday', function () {
            for (const day of [15, 21]) {
                const parser = new Text2Time({ now: new Date(2023, 4, day, 12) });
                assert.strictEqual(format(parser.next('sunday').date, DATE_FORMAT),
                    day === 15 ? '2023-05-21 Sunday 12:00:00' : '2023-05-28 Sunday 12:00:00');
            }
        });

        it('normalizes whitespace and case at the public entry points', function () {
            const parser = new Text2Time({ now: new Date('2023-05-15T12:00:00'), every: { next: 2 } });
            assert.strictEqual(format(parser.next('  NEXT   Tuesday  ').date, DATE_FORMAT), '2023-05-16 Tuesday 12:00:00');
            assert.strictEqual(format(parser.parse('  ADD   1 DAY  ').date, DATE_FORMAT), '2023-05-16 Tuesday 12:00:00');
            assert.strictEqual(parser.every('  5   minutes  '), '0 */5 * * * *');
            assert.strictEqual(parser.parse('  EVERY   5 minutes  ').next.length, 2);
        });

        it('matches complete month and weekday words in cron expressions', function () {
            const parser = new Text2Time({ now: new Date('2023-05-15T12:00:00'), every: { next: 2 } });
            assert.strictEqual(parser.every('October at 04:00'), '0 0 4 * 10 *');
            assert.strictEqual(parser.every('day from monday to friday in october'), '0 0 0 * 10 1-5');
            assert.strictEqual(parser.every('day in january'), '0 0 0 * 1 *');
            const result = parser.parse('every October at 04:00');
            assert.strictEqual(result.next.length, 2);
            assert.strictEqual(format(new Date(result.date), DATE_FORMAT), '2023-10-01 Sunday 04:00:00');
        });
    });

    describe('#parse()', function () {
        it('should correctly parse and return next occurrences for "every 3 months day 5 at 4:04:04"', function () {
            const parser = new Text2Time({
                now: new Date('2023-05-15T12:00:00'),
                every: { next: 6 }
            });
            const result = parser.parse('every 3 months day 5 at 4:04:04');

            const expectedDates = [
                '2023-07-05 Wednesday 04:04:04',
                '2023-10-05 Thursday 04:04:04',
                '2024-01-05 Friday 04:04:04',
                '2024-04-05 Friday 04:04:04',
                '2024-07-05 Friday 04:04:04',
                '2024-10-05 Saturday 04:04:04'
            ];

            assert.strictEqual(result.next.length, 6);
            result.next.forEach((date, index) => {
                assert.strictEqual(format(date, DATE_FORMAT), expectedDates[index]);
            });
        });
    });
});
