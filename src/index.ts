import express from 'express'
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
// 
async function init() {
    const app = express();
    const PORT = process.env.PORT || 8001;
    app.use(express.json());

    // Create GraphQL server

    const gqlServer = new ApolloServer({
        typeDefs: `
            type Query {
                hello: String
                sayHello(name: String): String
            }
        `,// Schema
        resolvers: {
            Query: {
                hello: () => 'Hey there, I am a GraphQL Server!',
                // sayHello: (root, args) => `Hey ${args.name}!`,
                sayHello: (_, {name}: { name: string }) => `Hey ${name}!`,
            }
        }
    })

    // Start the server
    await gqlServer.start();

    app.get('/', (req, res) => {
        res.json({ message: 'Server is up and running!' })
    })

    app.use('/graphql', expressMiddleware(gqlServer));

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
}

init();