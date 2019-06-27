require('dotenv').config()

import { Client, Message } from 'discord.js'
import * as _ from 'lodash'

import { DB } from './database'
import { randomGenes, Gene } from './creature';
import { felRandom } from './helper';

const client = new Client()

client.on('ready', () => {
	console.log('I\'m ready master OwO')
})

const colors = ['```','```fix','```css','```yaml']

client.on('message', msg => {
	let arg = _.split(msg.content, ' ')
	let args = _.drop(arg)

	switch(_.head(arg)){
		case '!birth':

			if(!_.head(args)) return msg.reply('provide a name for your kid after \`\`!start\`\`')

			DB.Models.Creature.find({owner: msg.author.id}, (err: Error, res) => {
				if(err) throw err
				if(res.length > 0) return msg.reply('you\'ve already made your first creature!')

				let name = _.join(args, ' ')

				let genes = randomGenes()
				msg.channel.send(`Congratulations ${msg.author}, your first child is named \`\`${name}\`\`. It\s color is ${genes.color.outcome}, it's resist is ${genes.resist.outcome}, and it's attack type is ${genes.attack.outcome}`)
				let a = new DB.Models.Creature({
					name: name,
					owner: msg.author.id,
					genes: genes
				})

				a.save(err => {
					if(err) throw err
				})
	
			})
			break
		case '!inspect':
			const affname = ['none', 'physical', 'magic', 'pure']
			DB.Models.Creature.find({owner: msg.author.id}, (err: Error, res) => {
				if(err) throw err
				if(res.length == 0) return msg.reply('you don\'t have a creature to inspect! Type \`\`!birth <name>\`\` to get started')
				let c = res[0].genes.color.outcome
				return msg.reply(`${colors[c]}
|\\---/|		Name   - ${res[0].name}
| o_o |        Resist - ${affname[res[0].genes.resist.outcome]}
 \\_^_/		 Attack - ${affname[res[0].genes.attack.outcome]}\`\`\``)
			})
			break
		
		case '!breed':
			DB.Models.Creature.find({owner:msg.author.id}, (err: Error, resa) => {
				if(err) throw err
				if(resa.length == 0) return msg.reply('you don\'t have a creature to breed! Type \`\`!birth <name>\`\` to get started')
				if(msg.mentions.users.array().length < 1) return msg.reply('please tag someone to breed with.')
				if(msg.mentions.users.first().id === msg.author.id) return msg.reply('you can\'t breed with your pet, weirdo.')

				DB.Models.Creature.find({owner:msg.mentions.users.first().id}, (err: Error, resb) => {
					if(err) throw err
					if(resb.length == 0) return msg.reply('the person you tried to breed with does not have a creature.')

					msg.channel.send(`${msg.mentions.users.first()} do you consent? Type \`\`!y\`\` or \`\`!n\`\``)
					

					//insert consent here
					newFunction(msg, resa, resb);
					
				})
			})
			break
		case '!sleep': //temp command
			DB.Models.Creature.deleteOne({owner:msg.author.id}, (err: Error) => {
				if(err) throw err;
				msg.reply('goodnight sweet prince')
			})
			break
	}
})

client.login(process.env.token)
function newFunction(msg: Message, resa, resb) {
	msg.channel.send(`\`\`${resa[0].name}\`\` has passionate family friendly sex with \`\` ${resb[0].name}\`\``);
	const dd = ['color', 'resist', 'attack'];
	let childgene: any = {};
	for (let i = 0; i < 3; i++) {
		let allelea = resa[0].genes[dd[i]].alleles;
		let allelab = resb[0].genes[dd[i]].alleles;
		let results = [
			[[allelea[0], allelab[0]], [allelea[1], allelab[0]]],
			[[allelea[0], allelab[1]], [allelea[1], allelab[1]]]
		];
		let x = felRandom(2);
		let y = felRandom(2);
		let chosen = results[x][y];
		let outcome = 0;
		if (results[x][y][0] == results[x][y][1])
			outcome = results[x][y][1];
		let gene: Gene = { name: 'resist', alleles: [results[x][y][0], results[x][y][1]], outcome: outcome };
		childgene[dd[i]] = gene;
	}
	msg.channel.send(`Congratulations ${msg.author}, a child is born. It\s color is ${childgene.color.outcome}, it's resist is ${childgene.resist.outcome}, and it's attack type is ${childgene.attack.outcome}`);
}

