const service = require('mesg-js').service()
const application = require('mesg-js').application({ endpoint: process.env.MESG_ENDPOINT })
const { buildSchema  }  = require('graphql')
const { parseFields } = require('./utils/fields')

if (!process.env.SCHEMA) {
  console.error('graphql schema must be set into SCHEMA env var')
  process.exit(1)
}

// validate schema
buildSchema(process.env.SCHEMA)

service.listenTask({
  completeQuery: require('./tasks/completeQuery')(application)
})

application.listenEvent({
  serviceID: 'http-server',
  eventFilter: 'request'
})
  .on('data', onRequest)
  .on('error', (err) => console.error('error while listening requests:', err))

async function onRequest ({ eventData }) {
  const { sessionID, path, method, body, qs} = JSON.parse(eventData)

  if (path === '/graphql' && (method === 'POST' || (method === 'GET' && process.env.ALLOW_GET))) {
    try {
      const queryStr = method === 'POST' ? body : JSON.parse(qs).query[0]
      const { query, variables } = JSON.parse(queryStr)
      if (query.includes('__schema')) {
        responseSchemaData(sessionID, query)
        return
      }

      const fields = parseFields(query, variables)
      service.emitEvent('query', { sessionID, fields })
    } catch(err) {
      responseError(sessionID, err)
    }
  }
}

async function responseSchemaData(sessionID, query) {
  const { outputData } = await application.executeTaskAndWaitResult({
    serviceID: 'graphql-introspection',
    taskKey: 'introspect',
    inputData: JSON.stringify({ 
      query,
      schema: process.env.SCHEMA
    })
  })

  const { data } = JSON.parse(outputData)

  await application.executeTaskAndWaitResult({
    serviceID: 'http-server',
    taskKey: 'completeSession',
    inputData: JSON.stringify({ 
      sessionID,
      mimeType: 'application/json',
      content: data
    })
  })
}

async function responseError(sessionID, err) {
  await application.executeTaskAndWaitResult({
    serviceID: 'http-server',
    taskKey: 'completeSession',
    inputData: JSON.stringify({ 
      sessionID,
      mimeType: 'application/json',
      code: 400,
      content: JSON.stringify({ message: err.message })
    })
  })
}
