module.exports = (application) => async ({ sessionID, data }, { success, error }) => {
  try {
    const { outputData } = await application.executeTaskAndWaitResult({
      serviceID: 'http-server',
      taskKey: 'completeSession',
      inputData: JSON.stringify({ 
        sessionID,
        mimeType: 'application/json',
        content: JSON.stringify({data: JSON.parse(data)})
      })
    })
    const { elapsedTime } = JSON.parse(outputData)
    success({ sessionID, elapsedTime })
  } catch(err) {
    error({ message: err.message })
  }
}