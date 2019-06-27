import { User } from "discord.js"
import { Document, Model, Schema, model } from 'mongoose'

interface Gene{
	name: string
	dominant: boolean
	value: number
}

//speed
//stamina
//color

declare interface ICreature extends Document{ 
	name: String,
	owner: String,
	//genes?: any[]
}

export interface CreatureModel extends Model<ICreature>{}


export class Creature {
	private _model: Model<ICreature>
	//name: string
	//owner: User
	//genes: Gene[]

	constructor(){
		const schema = new Schema({
			name: { type: String, required: true },
			owner: { type: String, required: true },
			//genes: { type: Object, required: true}
		})

		this._model = model<ICreature>('Creature', schema)
	}	

	public get model(): Model<ICreature> {
		return this._model
	}

}
