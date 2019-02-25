const { parse  }  = require('graphql')
const graphqlFields = require('graphql-fields')

// parseFields parses GraphQL query by applying optional variables
// to a simple data format.
exports.parseFields = (query, variables) => {
  const ast = parse(`{ master ${query} }`)
  const selections = ast.definitions[0].selectionSet.selections
  const nestedFields = graphqlFields({ fieldASTs: selections }, variables, { processArguments: true })
  return sanitizeFields(nestedFields)
}

function sanitizeFields(nestedFields) {
  return Object.keys(nestedFields).map((key) => {
    const field =  {}
    field.name = key
    const child = nestedFields[field.name]
    if (child.__arguments) {
      const args = child.__arguments
      delete child.__arguments
      field.args = sanitizeArgs(args)
    }
    const fields = sanitizeFields(child)
    if (Object.keys(fields).length) field.fields = fields
    return field
  })
}

function sanitizeArgs(args) {
  return args.map((arg) => {
    const name = Object.keys(arg)[0]
    const value = arg[name].value
    return { name, value }
  })
}