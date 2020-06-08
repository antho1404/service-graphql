module.exports = (liteflow) => (serviceID, eventFilter) => {
  return liteflow.listenEvent({ serviceID, eventFilter })
}