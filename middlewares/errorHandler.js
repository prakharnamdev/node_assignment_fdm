const { v4: uuidv4 } = require('uuid');

module.exports = (err, req, res, next) => {
  const traceId = uuidv4();
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  console.error(`[Error][${traceId}]`, err);
  res.status(status).json({ traceId, code: status, message });
};
