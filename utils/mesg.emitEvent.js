module.exports = (liteflow) => (name, data) => {
  return liteflow.emitEvent(name, data)
}