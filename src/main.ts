require('dotenv').config()

import { Client, RichEmbed } from 'discord.js'
import * as _ from 'lodash'
const moniker = require('moniker')
const Table = require('easy-table')

import { DB } from './database'
import { randomGenes, Gene } from './creature';
import { felRandom } from './helper';


const client = new Client()

client.on('ready', () => {
	console.log('I\'m ready master OwO')
})

const colors = ['```','```fix','```css','```yaml']
const affname = ['Normal', 'Physical', 'Magical', 'Pure']
const affshort = ['Norm.', 'Phys.', 'Mag.', 'Pure']
const gifts = ['None', 'Health', 'Damage', 'Crit']
const giftsshort = ['None', 'HP+', 'DMG+', 'Crit']


let waiting: Object[] = []
//{user,other,callback,...}

client.on('message', msg => {
	let arg = _.split(msg.content, ' ')
	let args = _.drop(arg)

	switch(_.head(arg)){
		case '!birth':

			if(!_.head(args)) return msg.reply('provide a name for your creature.')
			let name = _.join(args, ' ')
			if(name.length > 24) return msg.reply('that name is too long, try something shorter than 24 characters')

			DB.Models.Creature.find({owner: msg.author.id}, (err: Error, res) => {
				if(err) throw err
				if(res.length > 0) return msg.reply('you\'ve can only have one creature through this method, use \`\`!breed\`\` to get more!')

				

				let genes = randomGenes()
				msg.channel.send(`Congratulations ${msg.author}, your first creature is named \`\`${name}\`\`. Use \`\`!inspect\`\` to learn more about it!`)
				let a = new DB.Models.Creature({
					name: name,
					owner: msg.author.id,
					genes: genes,
					guild: {
						name: msg.guild.name,
						iconURL: msg.guild.iconURL
					}
				})
				DB.Models.Inventory.findByIdAndUpdate(msg.author.id, {$push: {creatures: a.id}}, (err, k) => {
					if(err) throw err
					if(!k) {
						let b = new DB.Models.Inventory({
							_id: msg.author.id,
							creatures: [a.id]
						})
						b.save(err => {
							if(err) throw err
						})
					}
				})

				a.save(err => {
					if(err) throw err
				})
				
	
	
			})

			break
		case '!inspect':
			let user = msg.author
			if(msg.mentions.users.array().length) user = msg.mentions.users.array()[0]
			DB.Models.Inventory.findById(user.id,(err, res) => {
				if(err) throw err
				if(!res) return msg.reply('you don\'t have a creature to inspect! Type \`\`!birth <name>\`\` to get started')
				DB.Models.Creature.findById(res.creatures[res.active], (err: Error, res) => {
					if(err) throw err
					if(!res) return msg.reply('you don\'t have a creature to inspect! Type \`\`!birth <name>\`\` to get started')
					let c = res.genes.color.outcome

					let embed = new RichEmbed({
						color: 7506394,
						author: {
							name: user.username,
							icon_url: user.avatarURL
						},
						description: `${colors[c]}\n|\\---/|\n| o_o |		${res.name}\n \\_^_/\n\`\`\``,
						fields:[
							{
								name: 'Resist',
								value: `${affname[res.genes.resist.outcome]} (${res.genes.resist.alleles[0]},${res.genes.resist.alleles[1]})`,
								inline: true
							},
							{
								name: 'Attack Affinity',
								value: `${affname[res.genes.attack.outcome]} (${res.genes.attack.alleles[0]},${res.genes.attack.alleles[1]})`,
								inline: true
							},
							{
								name: 'Gift',
								value: `${gifts[res.genes.gift.outcome]} (${res.genes.gift.alleles[0]},${res.genes.gift.alleles[1]})`,
								inline: true
							},
							{
								name: 'Attack Power',
								value:`${res.attackpower}`,
								inline: true
							}
						],
						timestamp: res.date,
						footer:{
							icon_url: res.guild.iconURL,
							text: `Born at ${res.guild.name}`
						}
					})
					return msg.channel.send(embed)
				})
			})

			break
		case '!breed':
			if(msg.mentions.users.array().length < 1) return msg.reply('please tag someone to breed with.')
			//if(msg.mentions.users.first().id === msg.author.id) return msg.reply('you can\'t breed with your pet, weirdo.')
			if(_.find(waiting, {partner: msg.author.id})) return msg.reply('you already have a pending breeding/battle request.')
			
			DB.Models.Creature.find({owner:msg.author.id}, (err: Error, resa) => {
				if(err) throw err
				if(resa.length == 0) return msg.reply('you don\'t have a creature to breed! Type \`\`!birth <name>\`\` to get started')

				DB.Models.Creature.find({owner:msg.mentions.users.first().id}, (err: Error, resb) => {
					if(err) throw err
					if(resb.length == 0) return msg.reply('the person you tried to breed with does not have a creature.')
					msg.channel.send(`${msg.mentions.users.first()} do you consent? Type \`\`!y\`\` or \`\`!n\`\``)
						.then(sent => {
						waiting.push({
							user: msg.mentions.users.first().id, 
							partner: msg.author.id,
							success: breed,
							failure: function(a) {msg.channel.send(`${a.author} denied your breeding attempts ${msg.author}`) },
							data: {
								resa: resa[0],
								resb: resb[0],
								msg: msg,
								replymsg: sent
							}
						})			
					})	
				})
			})

			break
		case '!y':
			let data  = _.find(waiting, {user: msg.author.id})

			if(!data) return 

			waiting = _.reject(waiting, {user:msg.author.id})
			data['success'](data['data'])

			break
		case '!n':
			let a = _.find(waiting, {user:msg.author.id})
			if(!a) return

			waiting = _.reject(waiting, {user:msg.author.id})
			a['failure'](msg)

			break
		case '!cancelrequest':
			let reqs = _.find(waiting, {partner: msg.author.id})
			if(!reqs) return msg.reply('you do not have any pending requests.')
			waiting = _.reject(waiting, {partner: msg.author.id})

			msg.reply('pending request cancelled.')
				.then(sent => {
					_.delay((...args) => {
						args.forEach(msg => {
							msg.delete()
						});
					}, 2000, msg, sent, reqs['data'].msg, reqs['data'].replymsg)
					
				})
			
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

			if(after.length > 24) return msg.reply('that name is too long, try something shorter than 24 characters')
			DB.Models.Creature.findOne({ name: after, owner: msg.author.id}, (err, res) =>{
				if(err) throw err
				if(res) return msg.reply(`you already have a creature named \`\`${after}\`\``)
				DB.Models.Creature.updateOne({owner: msg.author.id, name:before}, {name: after}, (err,res)=> {
					if(err) throw err
					if(res.n == 0) return msg.reply(`you do not own a creature named \`\`${before}\`\``)
					msg.reply(`\`\`${before}\`\` has been renamed to \`\`${after}\`\``)
				})
			})
			break
		case '!battle':
			if(msg.mentions.users.array().length < 1) return msg.reply('please tag someone to battle with.')
			if(_.find(waiting, {partner: msg.author.id})) return msg.reply('you already have a pending breeding/battle request.')
		//	if(msg.mentions.users.first().id === msg.author.id) return msg.reply('you can\'t fight yourself.')

			DB.Models.Inventory.find({
				_id: { $in: [
						msg.author.id,
						msg.mentions.users.array()[0].id
					]}
				}, (err, invs) => {
					if(err) throw err
					console.log(invs.length)
					if(invs.length != 2) return msg.reply('both players need a creature to battle! Type \`\`!birth <name>\`\` to get started')
					DB.Models.Creature.find({
						_id: { $in: [
							invs[0].creatures[invs[0].active],
							invs[1].creatures[invs[1].active]
						]}
					 }, (err, docs) => {
						if(err) throw err
						msg.channel.send(`${msg.mentions.users.first()} do you agree to battle? Type \`\`!y\`\` or \`\`!n\`\` *(remember the losing creature is lost forever)*`)
						.then(sent => {
						waiting.push({
							user: msg.mentions.users.first().id, 
							partner: msg.author.id,
							success: battle,
							failure: function(a) {msg.channel.send(`${a.author} denied your battle request ${msg.author}`) },
							data: {
								a: docs[0],
								b: docs[0],
								msg: msg
							}
						})		
					})
						/*battle({
							a: docs[0],
							b: docs[1],
							msg: msg
						})*/
					 })

					//if(resb.length == 0) return msg.reply('the person you tried to breed with does not have a creature.')
					
					/*msg.channel.send(`${msg.mentions.users.first()} do you agree to battle? Type \`\`!y\`\` or \`\`!n\`\` *(remember the losing creature is lost forever)*`)
						.then(sent => {
						waiting.push({
							user: msg.mentions.users.first().id, 
							partner: msg.author.id,
							success: battle,
							failure: function(a) {msg.channel.send(`${a.author} denied your battle request ${msg.author}`) },
							data: {
								a: resa[0],
								b: resb[0],
								msg: msg
							}
						})		
					})*/	
			})
			break
		case '!inventory':
			DB.Models.Inventory.findById(msg.author.id, (err, res) => {
				if(err) throw err
				if(!res) return msg.reply('you don\'t have any creatures! Type \`\`!birth <name>\`\` to get started')
				if(!res.creatures.length) return msg.reply('you don\'t have any creatures! Type \`\`!birth <name>\`\` to get started')

				DB.Models.Creature.find({'_id' : { $in: res.creatures }}, (err, creatureObject) => {
					if(err) throw err
					
					let t = new Table
					creatureObject.forEach((creature,i) => {
						let name = '- ' + creature.name
						if(res.active == i) name = '+ ' + creature.name
						t.cell('Name', name)
						t.cell('AP', creature.attackpower)
						t.cell('Res.', affshort[creature.genes.resist.outcome])
						t.cell('Type', affshort[creature.genes.attack.outcome])
						t.cell('Gift', giftsshort[creature.genes.gift.outcome])
						t.newRow() 
					});
					msg.channel.send(`\`\`\`diff\n${t.toString()}\`\`\``)
				})
			})
			break
		case '!setactive':
			let target = args
			if(!_.head(target)) return msg.reply('provide a name of the creature you want to set active.')

			let cname = _.join(target, ' ')

			DB.Models.Creature.find({owner: msg.author.id, name: {$regex: new RegExp(cname, 'i')}}, (err,res) => {
				if(err) throw err
				if(res.length == 0) return msg.reply(`you do not own a creature named \`\`${cname}\`\``)
				if(res.length >= 2) return msg.reply(`you own more than one creatures with \`\`${cname}\`\` in their name, try something more specific`)
				DB.Models.Inventory.findById(res[0].owner, (err, inv) => {
					if(err) throw err
					let i = _.findIndex(inv.creatures, (o) => { return o == res[0]._id})
					inv.active = i
					inv.save(err => {
						if(err)	throw err
						return msg.reply(`\`\`${res[0].name}\`\` is now your active creature!`)
					})
				})
			})

			break

		case '!sleep': //temp command
			DB.Models.Creature.deleteOne({owner:msg.author.id}, (err: Error) => {
				if(err) throw err;
				msg.reply('goodnight sweet prince')
				DB.Models.Inventory.deleteOne({_id: msg.author.id}, err => { if (err) throw err})
			})

			break
	}
})

function breed(data: {[key: string]: any}) {
	const dd = ['color', 'resist', 'attack', 'gift']
	let childgene: any = {}
	for (let i = 0; i < dd.length; i++) {
		let allelea = data.resa.genes[dd[i]].alleles
		let allelab = data.resb.genes[dd[i]].alleles
		let results = [
			[[allelea[0], allelab[0]], [allelea[1], allelab[0]]],
			[[allelea[0], allelab[1]], [allelea[1], allelab[1]]]
		];
		let x = felRandom(2)
		let y = felRandom(2)
		let chosen = results[x][y]
		let outcome = 0
		if (chosen[0] == chosen[1]) outcome = chosen[1]
		let gene: Gene = { name: dd[i], alleles: [chosen[0], chosen[1]], outcome: outcome }
		childgene[dd[i]] = gene
	}
	let cname = moniker.choose()
	data.msg.channel.send(`Congratulations ${data.msg.author}, \`\`${cname}\`\` is born. It\s color is ${childgene.color.outcome}, it's resist is ${childgene.resist.outcome}, it's gift is ${childgene.gift.outcome}, and it's attack type is ${childgene.attack.outcome}`);
	
	let gen = Math.max(data.resa.generation, data.resb.generation) + 1
	let a = new DB.Models.Creature({
		name: cname,
		owner: data.msg.author.id,
		genes: childgene,
		generation: gen,
		guild: {
			name: data.msg.guild.name,
			iconURL: data.msg.guild.iconURL
		}
	})

	DB.Models.Inventory.findByIdAndUpdate(data.msg.author.id, {$push: {creatures: a.id}}, (err, k) => {
		if(err) throw err
	})

	a.save(err => {
		if(err) throw err
	})
}

function battle(data: {[key: string]: any}){
	const outcomes = ['hp','dmg','crit']
	const factors = [1.1,1.1,2]
	let a = {
		hp: 100,
		dmg: data.a.attackpower,
		crit: 0.1
	}

	let b = {
		hp: 100,
		dmg: data.b.attackpower,
		crit: 0.1
	}
	for (let i = 1; i < 3; i++) {
		if(data.a.genes.gift.outcome == i) a[outcomes[i]] = a[outcomes[i]] * factors[i]
		if(data.b.genes.gift.outcome == i) b[outcomes[i]] = b[outcomes[i]] * factors[i]
	}
	
	if(data.a.genes.resist.outcome == data.b.genes.attack.outcome) b.dmg = b.dmg * 0.9 //b deals less damage
	if(data.b.genes.resist.outcome == data.a.genes.attack.outcome) a.dmg = a.dmg * 0.9 //a deals less damage 
		
	let i = 1
	let turns = []
	while(Math.min(a.hp, b.hp) > 0){
		let admgturn = a.dmg
		let bdmgturn = b.dmg

		let roll = felRandom(6)
		if(roll == 1) admgturn = a.dmg * (1 + a.crit)
		
		roll = felRandom(6)
		if(roll == 1) bdmgturn = b.dmg * (1 + b.crit)

		a.hp = _.round(a.hp - bdmgturn,1)
		b.hp = _.round(b.hp - admgturn,1)
		turns[i] = {a: a.hp, b: b.hp}
		i = i+1
	}
	
	let t = new Table
	turns.forEach((element, no) => {
		t.cell('Turn', no)
		t.cell(`${data.a.name} HP`, element.a)
		t.cell(`${data.b.name} HP`, element.b, Table.number(1))
		t.newRow()
	});
	data.msg.channel.send(`\`\`\`pf\n${t.toString()}\n\n${(Math.max(a.hp,b.hp) == a.hp) ? data.a.name : data.b.name } won the battle!\`\`\``)
	//data.msg.channel.send(`\`\`${(Math.max(a.hp,b.hp) == a.hp) ? data.a.name : data.b.name }\`\` won the battle! delta health was ${Math.abs(a.hp-b.hp)}`)
	
}	

client.login(process.env.token)