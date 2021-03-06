// @flow
import {
    resolveCreate,
    resolveDelete,
    resolveGet,
    resolveList,
    resolveUpdate
} from "webiny-api/graphql";

import resolveLoginUser from "./userResolvers/loginUser";
import resolveLoginUsingToken from "./userResolvers/loginUsingToken";
import resolveGetCurrentUser from "./userResolvers/getCurrentUser";
import resolveUpdateCurrentUser from "./userResolvers/updateCurrentUser";
import resolveGetCurrentUserSettings from "./userResolvers/getCurrentUserSettings";
import resolveUpdateCurrentUserSettings from "./userResolvers/updateCurrentUserSettings";

const userFetcher = ctx => ctx.security.entities.User;
const userSettingsFetcher = ctx => ctx.security.entities.UserSettings;

import Role from "./Role";
import Group from "./Group";

export default {
    typeDefs: () => [
        Role.typeDefs,
        Group.typeDefs,
        /* GraphQL */ `
            type Avatar {
                name: String
                size: Int
                type: String
                src: String
            }

            type UserLogin {
                token: String
                expiresOn: Int
                user: User
            }

            type UserAccess {
                scopes: [String]
                roles: [String]
                fullAccess: Boolean
            }

            type User {
                id: ID
                email: String
                firstName: String
                lastName: String
                fullName: String
                gravatar: String
                avatar: File
                enabled: Boolean
                groups: [Group]
                roles: [Role]
                scopes: [String]
                access: UserAccess
                createdOn: DateTime
            }

            # Contains user settings by specific key, ex: search-filters.
            type UserSettings {
                key: String
                data: JSON
            }

            # This input type is used by administrators to update other user's accounts
            input UserInput {
                email: String
                password: String
                firstName: String
                lastName: String
                avatar: FileInput
                enabled: Boolean
                groups: [ID]
                roles: [ID]
            }

            # This input type is used by the user who is updating his own account
            input CurrentUserInput {
                email: String
                firstName: String
                lastName: String
                avatar: FileInput
                password: String
            }

            type UserResponse {
                data: User
                error: Error
            }

            type UserListResponse {
                data: [User]
                meta: ListMeta
                error: Error
            }

            type UserLoginResponse {
                data: UserLogin
                error: Error
            }
        `
    ],
    typeExtensions: `
        extend type SecurityQuery {
            "Get current user"
            getCurrentUser: UserResponse
            
            "Get settings of current user"
            getCurrentUserSettings(key: String!): JSON
            
            "Get a single user by id or specific search criteria"
            getUser(
                id: ID 
                where: JSON
                sort: String
            ): UserResponse
            
            "Get a list of users"
            listUsers(
                page: Int
                perPage: Int
                where: JSON
                sort: JSON
                search: SearchInput
            ): UserListResponse
        }
        
        extend type SecurityMutation {
            "Login user"
            loginUser(
                username: String! 
                password: String! 
                remember: Boolean
            ): UserLoginResponse
            
            "Login user using token"
            loginUsingToken(
                token: String! 
            ): UserLoginResponse
            
            "Update current user"
            updateCurrentUser(
                data: CurrentUserInput!
            ): UserResponse
            
            "Update settings of current user"
            updateCurrentUserSettings(
                key: String!
                data: JSON!
            ): JSON
            
            createUser(
                data: UserInput!
            ): UserResponse
            
            updateUser(
                id: ID!
                data: UserInput!
            ): UserResponse
        
            deleteUser(
                id: ID!
            ): DeleteResponse
        }
    `,
    resolvers: {
        SecurityQuery: {
            getCurrentUser: resolveGetCurrentUser(userFetcher),
            getCurrentUserSettings: resolveGetCurrentUserSettings(userSettingsFetcher),
            getUser: resolveGet(userFetcher),
            listUsers: resolveList(userFetcher)
        },
        SecurityMutation: {
            loginUser: resolveLoginUser(userFetcher),
            loginUsingToken: resolveLoginUsingToken(userFetcher),
            updateCurrentUser: resolveUpdateCurrentUser(userFetcher),
            updateCurrentUserSettings: resolveUpdateCurrentUserSettings(userSettingsFetcher),
            createUser: resolveCreate(userFetcher),
            updateUser: resolveUpdate(userFetcher),
            deleteUser: resolveDelete(userFetcher)
        }
    }
};
