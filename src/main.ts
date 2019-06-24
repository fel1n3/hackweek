require('dotenv').config()

import { Client, User } from 'discord.js'

import './creature.ts'

const client = new Client()

client.on('ready', () => {
	console.log('I\'m ready master OwO')
})

client.login(process.env.token)
