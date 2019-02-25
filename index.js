const service = require('mesg-js').service()
const application = require('mesg-js').application({ endpoint: process.env.MESG_ENDPOINT })
const { buildSchema  }  = require('graphql')
const { parseFields } = require('./utils/fields')
const executeTask = require('./utils/mesg.executeTask')(application)
const listenEvent = require('./utils/mesg.listenEvent')(application)
const listenTask = require('./utils/mesg.listenTask')(service)
const emitEvent = require('./utils/mesg.emitEvent')(service)

if (!process.env.SCHEMA) {
  console.error('graphql schema must be set into SCHEMA env var')
  process.exit(1)
}

// validate schema
buildSchema(process.env.SCHEMA)

listenTask({
  completeQuery: require('./tasks/completeQuery')(application)
})

listenEvent('http-server', 'request')
  .on('data', onRequest)
  .on('error', (err) => console.error('error while listening requests:', err))

function onRequest ({ eventData }) {
  const { sessionID, path, method, body, qs} = JSON.parse(eventData)

  if (path === '/graphql' && (method === 'POST' || (method === 'GET' && process.env.ALLOW_GET))) {
    try {
      const queryStr = method === 'POST' ? body : JSON.parse(qs).query[0]
      const { query, variables } = JSON.parse(queryStr)
      if (queryStr.includes('__schema')) {
        responseSchemaData(sessionID, query)
        return
      }
      const fields = parseFields(query, variables)
      emitEvent('query', { sessionID, fields })
    } catch(err) {
      responseError(sessionID, err)
    }
  }
}

async function responseSchemaData(sessionID, query) {
  const { outputData } = await executeTask('graphql-introspection', 'introspect', {
    query,
    schema: process.env.SCHEMA
  })
  return executeTask('http-server', 'completeSession', { 
    sessionID,
    mimeType: 'application/json',
    content: outputData
  })
}

function responseError(sessionID, err) {
  return executeTask('http-server', 'completeSession', { 
    sessionID,
    mimeType: 'application/json',
    code: 400,
    content: JSON.stringify({ message: err.message })
  })
}
