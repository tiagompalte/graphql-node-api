import * as fs from 'fs'
import * as path from 'path'
import * as Sequelize from 'sequelize'
import { DbConnection } from '../interfaces/DbConnectionInterface';

const basename: string = path.basename(module.filename)
const env: string = process.env.NODE_ENV || 'development'
let config = require(path.resolve(`${__dirname}./../config/config.json`))[env]

//Instância singleton, para manter uma única conexão
let db = null

if(!db) {
    db = {}
    
    const operatorAliases = false
    config = Object.assign({operatorAliases}, config)

    const sequelize: Sequelize.Sequelize = new Sequelize(
        config.database,
        process.env.DB_USER || config.username,
        process.env.DB_PASSWORD || config.password,
        {
            host: process.env.DB_HOST || config.host,
            dialect: config.dialect
        }
    )

    fs.readdirSync(__dirname)
        .filter((file: string) => {
            return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
        })
        .forEach((file: string) => {
            const model = sequelize.import(path.join(__dirname, file))
            db[model['name']] = model
        })
    
    Object.keys(db).forEach((modelName: string) => {
        if(db[modelName].associate) {
            db[modelName].associate(db)
        }
    })

    db['sequelize'] = sequelize
}

export default <DbConnection> db