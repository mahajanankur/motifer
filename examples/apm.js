const { ApmFactory } = require('../index');

try {
    new ApmFactory('test', 'http://localhost:8300', 'error');
    console.log('APM started.');
} catch (error) {
    console.log(`APM initilization error ${error}`);
}