require('dotenv').config()

import { Client } from 'discord.js'

const client = new Client()

client.on('ready', () => {
	console.log('I\'m ready master OwO')
})

client.login(process.env.token)
