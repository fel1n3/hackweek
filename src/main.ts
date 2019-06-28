require('dotenv').config()

import { Client, Message } from 'discord.js'
import * as _ from 'lodash'
const moniker = require('moniker')

import { DB } from './database'
import { randomGenes, Gene } from './creature';
import { felRandom } from './helper';

const client = new Client()

client.on('ready', () => {
	console.log('I\'m ready master OwO')
})

const colors = ['```','```fix','```css','```yaml']

let waiting: Object[] = []

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
				let b = new DB.Models.Inventory({
					_id: msg.author.id,
					creatures: [a.id]
				})

				a.save(err => {
					if(err) throw err
				})
				b.save(err => {
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
				//if(msg.mentions.users.first().id === msg.author.id) return msg.reply('you can\'t breed with your pet, weirdo.')

				DB.Models.Creature.find({owner:msg.mentions.users.first().id}, (err: Error, resb) => {
					if(err) throw err
					if(resb.length == 0) return msg.reply('the person you tried to breed with does not have a creature.')

					msg.channel.send(`${msg.mentions.users.first()} do you consent? Type \`\`!y\`\` or \`\`!n\`\``)
					waiting.push({user: msg.mentions.users.first().id, partner: msg.author.id, resa: resa, resb:resb,msg:msg})				
				})
			})

			break
		case '!y':
			let data  = _.find(waiting, {user: msg.author.id})

			if(!data) return 

			waiting.pop()
			breed(data['msg'], data['resa'],data['resb'])
			break
		case '!n':
			let a = _.find(waiting, {user:msg.author.id})
			if(!a) return

			let deny = waiting.pop()['msg']
			msg.channel.send(`${msg.author} denied your breeding attempts ${deny.author}`)

			break
		case '!rename':
			const regex = /(?<=\')(.*?)(?=\')|(?<=\")(.*?)(?=\")/g

			let before = args[0]
			let after = args[1]
	
			let match = args.join(' ').match(regex)

			if(match){
				before = match[0]
				after = match[2]
			}

			if(args.length>2){
				if(!match) return msg.reply('wrong syntax please use \`\`!rename \'<before>\' \'<after>\'\`\` for names with multiple words.')
			}
			
			DB.Models.Creature.updateOne({owner: msg.author.id, name:before}, {name: after}, (err,res)=> {
				if(err) throw err
				if(res.n == 0) return msg.reply(`you do not own a creature named \`\`${before}\`\``)
				msg.reply(`${before} has been renamed to ${after}`)
			})
			break
		case '!sleep': //temp command
			DB.Models.Creature.deleteOne({owner:msg.author.id}, (err: Error) => {
				if(err) throw err;
				msg.reply('goodnight sweet prince')
				DB.Models.Inventory.remove({_id: msg.author.id})
			})

			break
	}
})

client.login(process.env.token)
function breed(msg: Message, resa, resb) {
	//msg.channel.send(`\`\`${resa[0].name}\`\` breeds with \`\` ${resb[0].name}\`\``);
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
		if (chosen[0] == chosen[1]) outcome = chosen[1];
		let gene: Gene = { name: dd[i], alleles: [chosen[0], chosen[1]], outcome: outcome };
		childgene[dd[i]] = gene;
	}
	let cname = moniker.choose()
	msg.channel.send(`Congratulations ${msg.author}, ${cname} is born. It\s color is ${childgene.color.outcome}, it's resist is ${childgene.resist.outcome}, and it's attack type is ${childgene.attack.outcome}`);
	
	let gen = Math.max(resa[0].generation, resb[0].generation)+1
	let a = new DB.Models.Creature({
		name: cname,
		owner: msg.author.id,
		genes: childgene,
		generation: gen
	})

	DB.Models.Inventory.findByIdAndUpdate(msg.author.id, {$push: {creatures: a.id}}, (err, k) => {
		if(err) throw err
	})

	a.save(err => {
		if(err) throw err
	})
}

