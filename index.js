const admin = require('./node_modules/firebase-admin');
const fs = require('fs');
// Provides csv functions
const fcsv = require('./node_modules/fast-csv');
const csvtojson =require("./node_modules/csvtojson");

const serviceAccount = require("./service-key.json");
//name of the collection
let collectionKey = undefined; 
// Put CSV here, make sure the headers are appropriately labelled.
let csv = undefined;

// Replace credentials with our own, this one is a dummy sandbox I made
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fir-project-c19b4.firebaseio.com"
});

const firestore = admin.firestore();
const settings = {timestampsInSnapshots: true};

firestore.settings(settings);

process.argv.forEach(function (val, index, array) {
  if (index < 2) {
  	return;
  }

  if (val.startsWith('csv=')) {
  	let res = val.split('csv=');
  	csv = res[1] + '.csv';
  } 
  else if (val === '--help') {
  	console.log('Format: node index.js [collection] csv=[fileName]]');
  } 
  else if (collectionKey === undefined) {
  	collectionKey = val;
  }

});

if (collectionKey === undefined) {
	console.log('Argument \'collection\' is required');
	console.log('Format: node index.js [collection] csv=[fileName]]');
}
else if (csv === undefined) {
	console.log('Argument \'csv\' is required');
	console.log('Format: node index.js [collection] csv=[fileName]]');
} 
else {
	fs.createReadStream(csv).on('data', function(data) {
		readCsv();
	}).on('error', function(err) {
		console.log('Error!');
	});
}

function readCsv() {
	csvtojson().fromFile(csv).on('data', data => {
		const stringData = data.toString('utf8');
		upload(stringData);
	})
	.on('end', () => console.log('done'));

	// fcsv.fromPath(csv, {headers: true, ignoreEmpty: true}).on('data', function(data){
	// 	console.log(Object.keys(data));
	// 	const stringData = JSON.stringify(data);
	// 	//  upload(stringData);
	// })
	// .on("end", function(){
	//      console.log("done");
	// });
}

function upload(data) {
	const parsedData = JSON.parse(data);
	if (parsedData) {
		firestore.collection(collectionKey)
		.doc()
		.set(parsedData)
		.then((res) => {
		    console.log("Document successfully written!");
		}).catch((error) => {
			console.error("Error writing document: ", error);
		});
	}
}

// unused
function uploadWithDocKey(data) {
	const parsedData = JSON.parse(data);
	if (parsedData) {
		Object.keys(parsedData).forEach(docKey => {
			firestore.collection(collectionKey)
			.doc(docKey)
			.set(parsedData[docKey])
			.then((res) => {
		    	console.log("Document successfully written!");
			}).catch((error) => {
			   	console.error("Error writing document: ", error);
			});
		});
	}
}