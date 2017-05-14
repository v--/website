const chai = require('chai');
const chaiIterator = require('chai-iterator');

chai.use(chaiIterator);
global.expect = chai.expect;
