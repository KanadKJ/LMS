/**
 *
 * @param {*} status
 * @param {*} value
 * @param {*} errors
 * @returns
 */

function responseGenerator(
  status,
  value = [],
  errors = "Something went worng"
) {
  return {
    statusCode: status,
    value: value,
    errors: [errors.toString()],
  };
}
module.exports = responseGenerator;
