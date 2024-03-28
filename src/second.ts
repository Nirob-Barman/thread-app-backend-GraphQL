import express from 'express'
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServer } from '@apollo/server';
import { prismaClient } from './lib/db';

async function init() {
    const app = express();
    const PORT = process.env.PORT || 8000;
    app.use(express.json());


    // Create GraphQL server
    const gqlServer = new ApolloServer({
        typeDefs: `
            type Query {
                hello: String
                sayHello(name: String): String
                getUsers: [User]
            }
            type Mutation {
                createUser(firstName: String!, lastName: String!, email: String!, password: String!): Boolean
                deleteUser(id: String!): Boolean
                deleteAllUsers: Boolean
            }
            type User {
                id: String
                firstName: String
                lastName: String
                profileImageURL: String
                email: String
            }
        `,// Schema
        resolvers: {
            Query: {
                hello: () => 'Hey there, I am a GraphQL Server!',
                // sayHello: (root, args) => `Hey ${args.name}!`,
                sayHello: (_, { name }: { name: string }) => `Hey ${name}!`,
                getUsers: async () => {
                    return await prismaClient.user.findMany();
                }
            },
            Mutation: {
                createUser: async (_, {
                    firstName,
                    lastName,
                    email,
                    password
                }: {
                    firstName: string,
                    lastName: string,
                    email: string,
                    password: string
                }) => {
                    await prismaClient.user.create({
                        data: {
                            firstName,
                            lastName,
                            email,
                            password,
                            salt: "random_salt",
                        },
                    });
                    return true;
                },
                deleteUser: async (_, { id }: { id: string }) => {
                    try {
                        await prismaClient.user.delete({
                            where: {
                                id: id
                            }
                        });
                        return true;
                    } catch (error) {
                        console.error("Error deleting user:", error);
                        return false;
                    }
                },
                deleteAllUsers: async () => {
                    try {
                        await prismaClient.user.deleteMany();
                        return true;
                    } catch (error) {
                        console.error("Error deleting all users:", error);
                        return false;
                    }
                }
            }
        }
    });

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