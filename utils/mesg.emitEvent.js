module.exports = (mesg) => (name, data) => {
  return mesg.emitEvent(name, data)
}