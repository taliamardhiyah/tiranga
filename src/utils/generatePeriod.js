module.exports = function generatePeriod() {
  const d = new Date();
  return d.toISOString().slice(0, 10).replace(/-/g, '') + '-' + d.getHours();
};