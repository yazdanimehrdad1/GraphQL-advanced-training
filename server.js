const {ApolloServer, 
       PubSub, 
       AuthenticationError, 
       UserInputError, 
       ApolloError,
       SchemaDirectiveVisitor
    } = require('apollo-server')
const gql = require('graphql-tag')
const {defaultFieldResolver} = require('graphql')
const { fieldsConflictMessage } = require('graphql/validation/rules/OverlappingFieldsCanBeMerged')
const pubsub = new PubSub()
const NEW_ITEM = 'NEW_ITEM'

class LogDirective extends SchemaDirectiveVisitor{
    // visitFieldDefinition(field){
    //     console.log(field)
    //     return field.resolve()
    // }
    visitFieldDefinition(field){

        const resolver = fieldsConflictMessage.resolve || defaultFieldResolver
        field.resolve = (args) => {
            console.log('****----> Directives filed resolver')
            return resolver.apply(this, args)
        }
    }
}
const typeDefs = gql`
    directive @log on FIELD_DEFINITION

    type User {
        id : ID! @log
        error:String!
        userName: String!
        createdAt: Int!
    }

    type Settings {
        user: User!
        theme: String!
    }

    type Query {
        me: User!
        settings(user : ID!): Settings!
    }

    input NewSettingsInput{
        user: ID!
        theme: String!
    }

    type Mutation{
        settings(input: NewSettingsInput!): Settings!
        createItem(task:String!):Item
    }


    type Item{
        task: String!
    }

    type Subscription {
        newItem: Item
    }

`
// creating resolvers for almost each typeDefs including:
// 1- Query
// 2- Mutation
// 3- Field level
const resolvers = {
    Query:{
        me(){
            return {
                id : '1',
                userName: 'Mehrdad.Yazdani',
                createdAt: '1/16/22'
            }
        },

        settings(_, {user}){
            return {
                user,
                theme:'Light'
            }
        },

    }, 

    User:{
        error(){
            throw new AuthenticationError("Nope error handeling")
        }
    },


    Mutation:{
        settings(_, {input} ){
            return input
        },

        createItem(_,{task}){
            const item = {task}
            pubsub.publish(NEW_ITEM, {newItem:{item}})
            return item
        }
    },



    Subscription:{
        newItem:{
            subscribe: ()=>pubsub.asyncIterator(NEW_ITEM)
        }
    },


    Settings:{
        user(settings){
            return {
                id : '1',
                userName: 'Mehrdad.Yazdani',
                createdAt: '1/16/22'
            }
        }
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
    schemaDirectives:{
        log: LogDirective
    },
    formatError(e){
        console.log(e)
        return new Error('my error')
    },
    context({connection , req}){
        if(connection){
            return {...connection.context}
        }
    },
    subscriptions:{
        onConnect(params){

        }
    }
})

server.listen().then(({url}) => console.log(`server at ${url}`))