import { GraphQLResolveInfo } from "graphql";
import { Transaction } from "sequelize";
import { DbConnection } from "../../../interfaces/DbConnectionInterface";
import { UserInstance } from "../../../models/UserModel";
import { handleError, throwError } from "../../../utils/utils";
import { authResolvers } from "../../composable/auth.resolver";
import { compose } from "../../composable/composable.resolver";
import { AuthUser } from "../../../interfaces/AuthUserInterface";
import { RequestedFields } from "../../ast/RequestedFields";

export const userResolvers = {

    User: {

        posts: (user, {first = 10, offset = 0}, {db, requestFields}: {db: DbConnection, requestFields: RequestedFields}, info: GraphQLResolveInfo) => {
            return db.Post
                .findAll({
                    where: {author: user.get('id')},
                    limit: first,
                    offset: offset,
                    attributes: requestFields.getFields(info, {keep: ['id'], exclude: ['comments']})
                }).catch(handleError)
        }
    },

    Query: {

        users: (parent, {first = 10, offset = 0}, {db, requestFields}: {db: DbConnection, requestFields: RequestedFields}, info: GraphQLResolveInfo) => {            
            return db.User
                .findAll({
                    limit: first,
                    offset: offset,
                    attributes: requestFields.getFields(info, {keep: ['id'], exclude: ['posts']})
                }).catch(handleError)
        },

        user: (parent, {id}, {db, requestFields}: {db: DbConnection, requestFields: RequestedFields}, info: GraphQLResolveInfo) => {
            id = parseInt(id)
            return db.User
                .findById(id, {
                    attributes: requestFields.getFields(info, {keep: ['id'], exclude: ['posts']})
                })
                .then((user: UserInstance) => {
                    throwError(!user, `User with id ${id} not found!`)
                    return user
                }).catch(handleError)
        },

        currentUser: compose(...authResolvers) 
        ((parent, args, {db, authUser, requestFields}: {db: DbConnection, authUser: AuthUser, requestFields: RequestedFields}, info: GraphQLResolveInfo) => {            
            return db.User
                .findById(authUser.id, {
                    attributes: requestFields.getFields(info, {keep: ['id'], exclude: ['posts']})
                })
                .then((user: UserInstance) => {
                    throwError(!user, `User with id ${authUser.id} not found!`)
                    return user
                }).catch(handleError)
        })

    },

    Mutation: {
        
        createUser: (parent, args, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .create(args.input, {transaction: t})
            }).catch(handleError)
        },

        //args substituido por {id, input}
        updateUser: compose(...authResolvers) 
        ((parent, {input}, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {            
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(authUser.id)
                    .then((user: UserInstance) => {
                        throwError(!user, `User with id ${authUser.id} not found!`)                        
                        return user.update(input, {transaction: t})
                    })
            }).catch(handleError)
        }),

        updateUserPassword: compose(...authResolvers) 
        ((parent, {input}, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {            
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(authUser.id)
                    .then((user: UserInstance) => {
                        throwError(!user, `User with id ${authUser.id} not found!`)
                        return user.update(input, {transaction: t})
                            .then((user: UserInstance) => !!user)
                    })
            }).catch(handleError)
        }),

        deleteUser: compose(...authResolvers) 
        ((parent, args, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {            
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(authUser.id)
                    .then((user: UserInstance) => {
                        throwError(!user, `User with id ${authUser.id} not found!`)
                        return user.destroy({transaction: t})
                            .then(user => !!user)
                    })
            }).catch(handleError)
        }),
    }
}