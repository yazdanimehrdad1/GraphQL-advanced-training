const gql = require('graphql-tag')
const createTestServer = require('./helper')
const CREATE_POST = gql`
    mutation{
        createPost(input:{message:"Hellooooo, test mutation"}){
            message
        }
    }
`

describe('mutations', () => {
  test('createPost', async () => {
    const {mutate} = createTestServer({
      user: {id: 1},
      models: {
        post: {
            createOne(){
                return {
                    message:"Hellooooo, test mutation"
                }
            }
        },
        user: { id:1}
      }
    })

    const res = await mutate({query:CREATE_POST })
    expect(res).toMatchSnapshot()
  })
})
