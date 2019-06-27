import { Document, Model, Schema, model } from 'mongoose'
import { felRandom } from './helper';

interface Gene{
	name: string,
	alleles: number[],
	outcome: number
}

export function randomGenes(): {[key: string]: Gene}{
	// Color
	//4 colors 
	// gray   -  		  any other combination not listed
	// yellow - (```fix)  YY 1
	// green  - (```css)  GG 2
	// blue   - (```yaml) BB 3
	let ca = felRandom(3) + 1
	let cb = felRandom(3) + 1

	let outcome = 0
	if(ca==cb) outcome = ca
	
	let cgene : Gene = { name: 'color', alleles: [ca,cb], outcome: outcome}

	//Resist
	//4 resists
	// none     - any other combination not listed
	// magic    - MM 0
	// physical - PhyPhy 1
	// pure     - PP 2
	let ra = felRandom(3) + 1
	let rb = felRandom(3) + 1

	outcome = 0
	if(ra==rb) outcome=ra
	
	let rgene : Gene = {name: 'resist', alleles: [ra,rb], outcome: outcome}

	//Attack Type
	//4 attack type
	// none     - any other combination not listed
	// magic    - MM 0
	// physical - PhyPhy 1
	// pure     - PP 2
	let aa = felRandom(3) + 1
	let ab = felRandom(3) + 1

	outcome = 0
	if(ra==rb) outcome=ra
	
	let agene : Gene = {name: 'resist', alleles: [aa,ab], outcome: outcome}

	return {
		color: cgene,
		resist: rgene,
		attack: agene
	}

}

declare interface ICreature extends Document{ 
	name: String,
	owner: String
	genes: {[key: string]: Gene}
}

export interface CreatureModel extends Model<ICreature>{}


export class Creature {
	private _model: Model<ICreature>

	constructor(){
		const schema = new Schema({
			name: { type: String, required: true },
			owner: { type: String, required: true },
			genes: { type: Object, required: true }
		})

		this._model = model<ICreature>('Creature', schema)
	}	

	public get model(): Model<ICreature> {
		return this._model
	}

}
