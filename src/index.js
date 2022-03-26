const {ApolloServer} = require('apollo-server')
const typeDefs = require('./typedefs')
const resolvers = require('./resolvers')
const {createToken, getUserFromToken} = require('./auth')
const db = require('./db')

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context({req, connection}) {
    const context = {...db}
    if(connection){
      return {...context, ...connection.context} // connection.context is the result of what subscriptions return below
    }
    const token = req.headers.authorization
    const user = getUserFromToken(token)
    return {...db, user, createToken}
  },

  subscriptions:{
    onConnect(params){
      const token = params.authToken
      const user = getUserFromToken(token)

      if(!user){
        throw new Error('not authorized ')
      }
      return {user}
    }
  }
})

server.listen(4000).then(({url}) => {
  console.log(`🚀 Server ready at ${url}`)
})
