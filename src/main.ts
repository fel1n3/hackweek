require('dotenv').config()

import { Client, User } from 'discord.js'
import * as _ from 'lodash'

import { Creature } from './creature'
import './database'


const client = new Client()

client.on('ready', () => {
	console.log('I\'m ready master OwO')
	new Creature('charlie', 'Charlemange')
})

client.on('message', msg => {
	let arg = _.split(msg.content, ' ')
	let args = _.drop(arg)

	switch(_.head(arg)){
		case '!start':

			if(!_.head(args)) return msg.reply('Provide a name for your kid after \`\`!start\`\`')

			let name = _.join(args, ' ')

			msg.channel.send(`Congratulations ${msg.author}, your first child is named \`\`${name}\`\``)
			let a = new Creature(name, msg.author.username)

			console.log(a.name, a.owner)
	}
})

client.login(process.env.token)
