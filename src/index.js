import _ from 'lodash';
import validUrl from 'valid-url';
import MultiJsonStream from './MultiJsonStream';
import { PassThrough } from 'stream';
import request from 'request';

const createUrlMapping = (query, baseUrl) => {
  const mapping = {};

  _.forEach(_.keys(query), key => {
    const url = `${baseUrl}/${query[key]}`;

    if (validUrl.isUri(url)) {
      mapping[key] = url;
    }
  });

  return mapping;
};

const startStreams = (urls) => {
    const streams = [];

    _.forEach(_.keys(urls), key => {
      const stream = request(urls[key]).pipe(new PassThrough());
      streams.push({
        key,
        src: stream,
      });
    });

    return streams;
};

const handleError = (error, res) => {
  res.status(400).send({ error })

};

export default (baseUrl) => (req, res, next) => {
  const { query } = req;

  if (!_.size(query)) {
    handleError('Missing query params!', res);
  }

  try {
    const resUrls = createUrlMapping(query, baseUrl);
    const streams = startStreams(resUrls);
    const result = new MultiJsonStream(streams);

    res.contentType('application/json');

    result.pipe(res);
    next();
  } catch (error) {
    handleError(error, res);
  }
};
