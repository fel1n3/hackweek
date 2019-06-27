require('dotenv').config()

import { Client, User } from 'discord.js'
import * as _ from 'lodash'

import { Creature } from './creature'
import { /*checkifnew, addcreature,*/ DB } from './database'


const client = new Client()

client.on('ready', () => {
	console.log('I\'m ready master OwO')
})

client.on('message', msg => {
	let arg = _.split(msg.content, ' ')
	let args = _.drop(arg)

	switch(_.head(arg)){
		case '!start':

			if(!_.head(args)) return msg.reply('Provide a name for your kid after \`\`!start\`\`')

			DB.Models.Creature.find({owner: msg.author.id}, (err: Error, res) => {
				if(err) throw err
				console.log(res.length, res)
				if(res.length > 0) return msg.reply('You\'ve already made your first creature!')
				let name = _.join(args, ' ')

				msg.channel.send(`Congratulations ${msg.author}, your first child is named \`\`${name}\`\``)
				let a = new DB.Models.Creature({
					name: name,
					owner: msg.author.id
				})

				a.save(err => {
					if(err) throw err
				})
	
			})
			
	}
})

client.login(process.env.token)
