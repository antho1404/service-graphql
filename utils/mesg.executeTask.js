module.exports = (liteflow) => async (serviceID, taskKey, data) => {
  const result = await liteflow.executeTaskAndWaitResult({
    serviceID,
    taskKey,
    inputData: JSON.stringify(data)
  })
  return JSON.parse(result.outputData)
}