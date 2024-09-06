# 🕰️ Text2Time: Natural Language Date Parser 🚀

Text2Time is a rad JavaScript class that turns human-friendly date expressions into actual dates and cron expressions. It's like having a time-traveling assistant in your code! 😎

## 🌟 Features

- Parse natural language date inputs
- Generate cron expressions
- Supports various time formats and intervals

## 🚀 Getting Started

First, import the `Text2Time` class:

```javascript
const t2t = new Text2Time();
```

## 🔮 Parsing Dates

Use the `parse` method to convert text to dates:

```javascript
const result = t2t.parse('next tuesday');
console.log(result.date); // Next Tuesday's date
```

## 🔮 Parsing Dates

### 🎭 Examples for `next`

```javascript
const t2t = new Text2Time({ now: new Date('2023-05-15T12:00:00') });

t2t.next('tuesday').date // -> 2023-05-16 Tuesday 12:00
t2t.next('july second week friday').date // -> 2023-07-14 Friday 12:00
t2t.next('16 september').date // -> 2023-09-16 Saturday 12:00
t2t.next('july second week friday 15:15:10').date // -> 2023-07-14 Friday 15:15:10
t2t.next('30 11:11:11').date // -> 2023-05-30 Friday 11:11:11

// For date ranges
const result = t2t.next('august monday to thursday');
result.date // -> 2023-08-07 Monday 12:00
result.ends // -> 2023-08-10 Thursday 12:00
```

### 🎭 Examples for `add`
```javascript
const t2t = new Text2Time({ now: new Date('2023-05-15T12:00:00') });

t2t.next('add 1 day').date // -> 2023-05-16 Tuesday 12:00
t2t.next('add 7 days').date // -> 2023-05-22 Monday 12:00
t2t.next('add 1 week').date // -> 2023-05-22 Monday 12:00
t2t.next('add 1 month 15:00').date // -> 2023-06-15 Thursday 15:00
```

### 🎭 Example with `parse` for `next` Occurrences
```javascript
const t2t = new Text2Time({
    now: new Date('2023-05-15T12:00:00'),
    every: { next: 6 } // how many in next
});

const result = t2t.parse('every 3 months day 5 at 4:04');

result.next.forEach(date => { // Next 6 occurrences:
    // 2023-07-05 Wednesday 04:04
    // 2023-10-05 Thursday 04:04
    // 2024-01-05 Friday 04:04
    // 2024-04-05 Friday 04:04
    // 2024-07-05 Friday 04:04
    // 2024-10-05 Saturday 04:04
});
```

## ⏰ Generating Cron Expressions

Use the `every` method to create cron expressions:

```javascript
const t2t = new Text2Time({ every:{ seconds:true } });

t2t.every('August At 00:05:10') // -> '10 5 0 * 8 *'
t2t.every('Friday and Monday At 04:05') // -> '0 5 4 * * 1,5'
t2t.every('5 minutes') // -> '0 */5 * * * *'
t2t.every('3 months day 5 at 4:04:01') // -> '1 4 4 5 */3 *'
```

## 🎉 Why Text2Time is Awesome

- 🧠 Understands human language
- 🔧 Flexible and customizable
- 🚀 Easy to integrate
- 🎨 Makes working with dates and cron expressions fun!

Give Text2Time a spin and make your date parsing groovy! 🕺💃

## 📄 License

The MIT License (MIT)

Copyright (c) Martin Clasen

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.