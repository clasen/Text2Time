const { addDays, addWeeks, addMonths, getDay } = require('date-fns');
const cronParser = require('cron-parser');


class Text2Time {
    constructor(args = {}) {
        this.now = args.now || new Date();
        this.everyOptions = args.every || { next: 60, seconds: true };

        // Constants for days
        this.DAYS = {
            sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6
        };

        // Constants for months
        this.MONTHS = {
            january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
            july: 7, august: 8, september: 9, october: 10, november: 11, december: 12
        };

        // Constants for week numbers
        this.WEEK_NUMBERS = {
            first: 1, second: 2, third: 3, fourth: 4
        };
    }

    next(input) {
        input = input.toLowerCase();
        const skipPrefixes = ['next', 'add', 'now', 'every'];
        const skip = skipPrefixes.some(prefix => input.startsWith(prefix));
        return this.parse(skip ? input : 'next ' + input);
    }

    parse(input) {
        const parts = input.toLowerCase().split(' ');
        const now = this.now;
        let result = { date: now, ends: null, next:[] };

        if (parts[0] === 'every') {
            const cron = this.every(input);
            result.next = this.getNextDates(cron, this.now, this.everyOptions.next);
            result.date = result.next[0];
            return result;
        }

        if (parts[0] === 'next') {
            if (parts.includes('week')) {
                const month = this.MONTHS[parts[1]];
                const week = parts[2] in this.WEEK_NUMBERS ? this.WEEK_NUMBERS[parts[2]] : this.WEEK_NUMBERS.first;
                const dayOfWeek = this.DAYS[parts[parts.length - 1]];
                result.date = this.nextWeek(month, week, dayOfWeek);
            } else if (parts.includes('to')) {
                const month = this.MONTHS[parts[1]];
                const week = parts[2] in this.WEEK_NUMBERS ? this.WEEK_NUMBERS[parts[2]] : undefined;
                const startDayOfWeek = this.DAYS[parts[parts.length - 3]];
                const endDayOfWeek = this.DAYS[parts[parts.length - 1]];
                const interval = this.nextWeekInterval(month, week, startDayOfWeek, endDayOfWeek);
                result = { date: interval.start, ends: interval.end };
            } else if (parts[2] && this.MONTHS[parts[2]]) {
                const day = parseInt(parts[1], 10);
                const month = this.MONTHS[parts[2]];
                result.date = this.nextDate(day, month);
            } else if (this.DAYS[parts[1]]) {
                const dayOfWeek = this.DAYS[parts[1]];
                result.date = this.nextDayOfWeek(dayOfWeek);
            } else if (parts.length === 2 && !isNaN(parseInt(parts[1], 10))) {
                const day = parseInt(parts[1], 10);
                result.date = this.nextDayOfMonth(day);
            }
        } else if (parts[0] === 'add') {
            const amount = parseInt(parts[1], 10);
            const unit = parts[2];

            if (unit === 'day' || unit === 'days') {
                result.date = this.nextDay(amount);
            } else if (unit === 'week' || unit === 'weeks') {
                result.date = this.nextWeeks(amount);
            } else if (unit === 'month' || unit === 'months') {
                result.date = this.nextMonth(amount);
            }
        }

        return result;
    }

    every(input) {
        const days = {
            sunday: 0, sun: 0, monday: 1, mon: 1, tuesday: 2, tue: 2, wednesday: 3, wed: 3,
            thursday: 4, thu: 4, friday: 5, fri: 5, saturday: 6, sat: 6
        };

        const months = {
            january: 1, jan: 1, february: 2, feb: 2, march: 3, mar: 3, april: 4, apr: 4,
            may: 5, june: 6, jun: 6, july: 7, jul: 7, august: 8, aug: 8, september: 9, sep: 9,
            october: 10, oct: 10, november: 11, nov: 11, december: 12, dec: 12
        };

        let [minute, hour, dayOfMonth, month, dayOfWeek] = ['0', '0', '*', '*', '*'];
        let second = '0';  // Declare second variable

        const lowercaseInput = input.toLowerCase();

        // Parse time
        const timeMatch = lowercaseInput.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
        if (timeMatch) {
            [, hour, minute, second = '0'] = timeMatch;
            minute = parseInt(minute).toString();
            hour = parseInt(hour).toString();
            second = parseInt(second).toString();
        }

        // Parse month
        for (const [monthName, monthNumber] of Object.entries(months)) {
            if (lowercaseInput.includes(monthName)) {
                month = monthNumber.toString();
                break;
            }
        }

        // Parse day of week
        if (lowercaseInput.includes('to')) {
            const [start, end] = lowercaseInput.split('to').map(part => {
                for (const [dayName, dayNumber] of Object.entries(days)) {
                    if (part.includes(dayName)) return dayNumber;
                }
            });
            dayOfWeek = `${start}-${end}`;
        } else {
            const weekDays = [...new Set(Object.entries(days)
                .filter(([dayName]) => lowercaseInput.includes(dayName))
                .map(([, dayNumber]) => dayNumber))];
            if (weekDays.length > 0) {
                dayOfWeek = weekDays.join(',');
            }
        }

        // Parse day of month
        const dayMatch = lowercaseInput.match(/day (\d+)/);
        if (dayMatch) {
            dayOfMonth = dayMatch[1];
        }

        // Parse intervals
        const intervalMatch = lowercaseInput.match(/(\d+) (month|day|hou|min|sec)/);
        if (intervalMatch) {
            const [, value, unit] = intervalMatch;
            switch (unit) {
                case 'month':
                    month = `*/${value}`;
                    if (dayOfMonth === '*') dayOfMonth = '1';
                    dayOfWeek = '*';
                    break;
                case 'day':
                    dayOfMonth = `*/${value}`;
                    break;
                case 'hou':
                    hour = `*/${value}`;
                    break;
                case 'min':
                    minute = `*/${value}`;
                    hour = '*';
                    break;
                case 'sec':
                    second = `*/${value}`;
                    minute = '*';
                    hour = '*';
                    break;
            }
        }

        // Convert numeric day of week to cron format
        if (dayOfWeek !== '*') {
            dayOfWeek = dayOfWeek.split(',').map(d => d).join(',');
            if (dayOfWeek.includes('-')) {
                const [start, end] = dayOfWeek.split('-');
                if (parseInt(start) > parseInt(end)) {
                    dayOfWeek = `${start}-7,0-${end}`;
                }
            }
        }

        // Modify the return statement based on the everyOptions
        const cronParts = [second, minute, hour, dayOfMonth, month, dayOfWeek];
        if (!this.everyOptions.seconds) {
            cronParts.shift();
        }
        return cronParts.join(' ');
    }

    // Get a specific day relative to today
    nextDay(days) {
        return addDays(this.now, days);
    }
    nextWeeks(weeks) {
        return addWeeks(this.now, weeks);
    }

    // Get the next specific day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    nextDayOfWeek(dayOfWeek) {
        const currentDayOfWeek = this.now.getDay();
        const daysUntilNextDayOfWeek = (dayOfWeek - currentDayOfWeek + 7) % 7;
        return addDays(this.now, daysUntilNextDayOfWeek || 7);
    }

    // Get the next specific day of a month (1-31)
    nextDayOfMonth(day) {
        let nextDate = new Date(this.now.getFullYear(), this.now.getMonth(), day);
        if (nextDate <= this.now) {
            nextDate = new Date(this.now.getFullYear(), this.now.getMonth() + 1, day);
        }
        // Preserve the time from this.now
        nextDate.setHours(this.now.getHours(), this.now.getMinutes(), this.now.getSeconds(), this.now.getMilliseconds());
        return nextDate;
    }

    // Get the next day of the week in a specific month
    nextDayOfWeekInMonth(monthStart, dayOfWeek) {
        let date = monthStart;
        while (getDay(date) !== dayOfWeek) {
            date = addDays(date, 1);
        }
        return date;
    }

    // Get a specific date
    date(day, month, year) {
        return new Date(year, month - 1, day); // Month is 0-indexed
    }

    nextDate(day, month) {
        let targetDate = this.date(day, month, this.now.getFullYear());
        if (targetDate <= this.now) {
            targetDate = this.date(day, month, this.now.getFullYear() + 1);
        }
        // Preserve the time from this.now
        targetDate.setHours(this.now.getHours(), this.now.getMinutes(), this.now.getSeconds(), this.now.getMilliseconds());
        return targetDate;
    }

    // Get the interval from Monday to Thursday of a specific week of a specific month and year
    getWeekInterval(month, year, weekNumber, startDayOfWeek, endDayOfWeek) {
        const firstStartDay = this.nextDayOfWeekInMonth(new Date(year, month - 1, 1), startDayOfWeek);
        const start = addDays(firstStartDay, (weekNumber - 1) * 7);
        const end = addDays(start, (endDayOfWeek - startDayOfWeek + 7) % 7);
        return { start, end };
    }

    nextWeekInterval(month, weekNumber, startDayOfWeek, endDayOfWeek) {
        const currentMonth = this.now.getMonth() + 1; // getMonth() is zero-indexed
        const targetYear = (month < currentMonth) ? this.now.getFullYear() + 1 : this.now.getFullYear();

        // If weekNumber is not provided, default to the first week
        weekNumber = weekNumber || this.WEEK_NUMBERS.first;

        const { start, end } = this.getWeekInterval(month, targetYear, weekNumber, startDayOfWeek, endDayOfWeek);

        // Preserve the time from this.now
        start.setHours(this.now.getHours(), this.now.getMinutes(), this.now.getSeconds(), this.now.getMilliseconds());
        end.setHours(this.now.getHours(), this.now.getMinutes(), this.now.getSeconds(), this.now.getMilliseconds());

        return { start, end };
    }

    nextMonth(months) {
        return addMonths(this.now, months);
    }

    nextWeek(month, weekNumber, dayOfWeek) {
        const currentMonth = this.now.getMonth() + 1; // getMonth() is zero-indexed
        const targetYear = (month < currentMonth) ? this.now.getFullYear() + 1 : this.now.getFullYear();
        const firstDayOfMonth = new Date(targetYear, month - 1, 1);
        const firstDesiredDay = this.nextDayOfWeekInMonth(firstDayOfMonth, dayOfWeek);
        const result = addDays(firstDesiredDay, (weekNumber - 1) * 7);

        // Preserve the time from this.now
        result.setHours(this.now.getHours(), this.now.getMinutes(), this.now.getSeconds(), this.now.getMilliseconds());

        return result;
    }

    getNextDates(cronPattern, startDate, numDates) {
        const options = {
            currentDate: startDate,
        };

        const interval = cronParser.parseExpression(cronPattern, options);
        const dates = [];

        for (let i = 0; i < numDates; i++) {
            dates.push(interval.next().toString());
        }

        return dates;
    }
}

module.exports = { Text2Time };
