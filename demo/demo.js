const { Text2Time } = require('../index');
const { format } = require('date-fns');

const parser = new Text2Time({
    now: new Date('2023-05-15T12:00:00')
});

const result = parser.parse('every 3 months day 5 at 4:04');

console.log('\nNext occurrences:');
result.next.forEach(date => {
    console.log(format(date, 'yyyy-MM-dd EEEE HH:mm'));
});
