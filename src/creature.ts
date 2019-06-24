import { User, Collector } from "discord.js";
import { create } from "domain";

interface Gene{
	name: string
	dominant: boolean
	value: number
}

class Creature {
	name: string
	owner: string /*User*/
	genes: Gene[]

	constructor(name: string, owner: string /*User*/, genes?: Gene[] ){
		this.name = name
		this.owner = owner


	}	

}


let a = new Creature('joe', 'fel')
let b = new Creature('charlie', 'fel')
