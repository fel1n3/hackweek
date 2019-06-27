import { connect, connection, Connection } from 'mongoose'
import { Creature, CreatureModel } from './creature'

declare interface IModels{
	Creature: CreatureModel
}

export class DB {
	private static instance: DB

	private _db: Connection
	private _models: IModels
	
	private constructor() {
		connect(process.env.url, {useNewUrlParser: true})
		this._db = connection
		this._db.on('open', this.connected)
		this._db.on('error', this.error)

		this._models = {
			Creature: new Creature().model
		}
	}

	public static get Models(){
		if(!DB.instance) {
			DB.instance = new DB()
		}
		return DB.instance._models
	}

	private connected(){
		console.log('Connected to database')
	}

	private error(err: Error){
		console.log('Error connecting to database:', err)
	}
}