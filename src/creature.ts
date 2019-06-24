import { User } from "discord.js";

interface Gene{
	name: string
	dominant: boolean
	value: number
}

//speed
//stamina
//color


class Creature {
	name: string
	owner: string /*User*/
	genes: Gene[]

	constructor(name: string, owner: string /*User*/, genes?: Gene[] ){

		this.name = name
		this.owner = owner

	}	

}

export { Creature }