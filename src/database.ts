const MongoClient = require('mongodb').MongoClient

let db
(async function() {
	const client = new MongoClient(process.env.url, { useNewUrlParser: true })
	try{
		await client.connect()
		db = client.db('hackweek')
	}catch(err){
		console.log(err.stack)
	}
})();

function checkifnew(uid: string){
	const collection = db.collection('data')
	collection.findOne({uid: uid}, (err,_) => {
		if(err) throw err
		if(_) return false
		return true
	})
}

export {checkifnew}

