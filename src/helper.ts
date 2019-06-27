import {randomFillSync} from 'crypto'

export function felRandom(max: number): number{
	let _ = randomFillSync(new Uint32Array(1))[0] / ( Math.pow(2,32) - 1 )
	return Math.floor(_ * Math.floor(max))
}