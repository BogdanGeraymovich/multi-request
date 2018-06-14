import _ from 'lodash';
import fs from 'fs';
import chai from 'chai';
import MultiJsonStream from '../src/MultiJsonStream';

const keys = [
  'users',
  'countries',
  'customers',
];

const streams = [{
  key: keys[0],
  src: fs.createReadStream(`${process.cwd()}/test/mocks/users.json`),
}, {
  key: keys[1],
  src: fs.createReadStream(`${process.cwd()}/test/mocks/countries.json`),
}, {
  key: keys[2],
  src: fs.createReadStream(`${process.cwd()}/test/mocks/customers.json`),
}];


describe('Multi JSON Stream', () => {

  let fetchedData = null;

  before(done => {
    let streamData = '';
    const multiJsonStream = new MultiJsonStream(streams);
    multiJsonStream.on('data', data => {
      streamData += data.toString()
    });
    multiJsonStream.on('end', () => {
      fetchedData = JSON.parse(streamData);
      done()
    });
  });

  it('Stream data is object', done => {
    chai.expect(fetchedData).to.be.an('object');

    done();
  });

  it('Stream object has keys', done => {
    chai.expect(fetchedData).to.have.all.keys(keys);

    done();
  });

  it('Stream object elements is array of objects', done => {
    _.each(fetchedData, item => {
      chai.expect(item).to.be.an('array');
      _.each(item, itemValue => {
        chai.expect(itemValue).to.be.an('object');
      });
    });

    done();
  });

});