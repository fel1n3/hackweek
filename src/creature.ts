import { Document, Model, Schema, model } from 'mongoose'
import { felRandom } from './helper';
import { ObjectID } from 'bson';

export interface Gene{
	name: string,
	alleles: number[],
	outcome: number
}
//types 
// none , magic, physical, pure
export function randomGenes(): {[key: string]: Gene}{

	const dd = ['color','resist','attack']
	let childgene:any = {}

	for (let i = 0; i < 3; i++) {
		let ca = felRandom(3) + 1
		let cb = felRandom(3) + 1
	
		let outcome = 0
		if(ca==cb) outcome = ca
		
		let gene : Gene = { name: dd[i], alleles: [ca,cb], outcome: outcome}
		
		childgene[dd[i]] = gene
		
	}
	return childgene
}

declare interface ICreature extends Document{ 
	name: String,
	owner: String
	genes: {[key: string]: Gene},
	generation: number
}

declare interface IInventory extends Document{
	_id: ObjectID
	creatures: string[]
}

export interface CreatureModel extends Model<ICreature>{}
export interface InventoryModel extends Model<IInventory>{}

export class Creature {
	private _model: Model<ICreature>

	constructor(){
		const schema = new Schema({
			name: { type: String, required: true },
			owner: { type: String, required: true },
			genes: { type: Object, required: true },
			generation: {type: Number, default:'0'}
		})

		this._model = model<ICreature>('Creature', schema)
	}	

	public get model(): Model<ICreature> {
		return this._model
	}

}

export class Inventory {
	private _model: Model<IInventory>

	constructor(){
		const schema = new Schema({
			_id: {type: Number, required: true},
			creatures: { type: Object, required:true}
		}, { _id: false })

		this._model = model<IInventory>('Inventory', schema)
	}	

	public get model(): Model<IInventory> {
		return this._model
	}

}
