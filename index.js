var convert = require('./convert'),
	express = require('express'),
	fs = require('fs'),
	app = express(),
	ready = false,
	jsonData,
	lastIMap = {},
	currDate;

app.get('/init/:id', function (req, res) {
	res.header('Access-Control-Allow-Origin', '*');
	if (!ready) {
		res.json({});
	}
	res.json(getInitData(jsonData, req.params.id));
});

app.get('/next/:id', function (req, res) {
	res.header('Access-Control-Allow-Origin', '*');
	if (!ready) {
		res.json({});
	}
	res.json(getImmediateData(jsonData, req.params.id));
});

app.listen(3003, function () {
	console.log('Starting...');

	jsonData = convert(function (data) {
		jsonData = data;
		fs.writeFileSync('jsonData.json', JSON.stringify(jsonData, null, 4));
		ready = true;
		console.log('http://localhost:3003');
	});
});


function getInitData(jsonData, id) {
	var i,
		l,
		key,
		keys,
		lastI,
		respCat,
		respSer,
		dataCat = [],
		dataSer = [],
		response = {},
		d = new Date(),
		sec = 0,
		dateHash = [d.getDate(), d.getMonth() + 1, d.getFullYear(), d.getHours(), d.getMinutes(), sec].join('-'),
		_toDay = [d.getDate(), d.getMonth() + 1, d.getFullYear()].join('-');

	
	for (i = 0, l = jsonData.histDS.length; i < l; i++) {
		if(jsonData.date !== _toDay) {
			var _curtTime = jsonData.histDS[i];
			jsonData.histDS[i] = _curtTime.replace(jsonData.date, _toDay);
			
			if((i+1) == l) jsonData.date = _toDay;
		}
	}

	for (i = 0, l = jsonData.histDS.length; i < l; i++) {
		
		key = jsonData.histDS[i];
		keys = key.split('-').map(k => parseInt(k, 10));

		if (keys[2] === d.getFullYear() && keys[1] === d.getMonth() + 1 && keys[0] === d.getDate()) {
			dataCat.push(key);
			dataSer.push(jsonData.histVal[i]);	
		}

		sec = (sec + 5) % 60;
		
		if (key === dateHash) {
			lastI = i;
			break;
		}
	}

	response.cat = dataCat;
	response.series = dataSer;

	lastIMap[id] = lastI;
	return response;
}

function getImmediateData(jsonData, id) {
	var i,
		l,
		key,
		keys,
		respCat,
		respSer,
		dataCat = [],
		dataSer = [],
		response = [],
		d = new Date(),
		sec = 0,
		lastI;

	lastI = (lastIMap[id]) || 0;
	lastI += 1;
	lastIMap[id] = lastI;
	console.log(id, lastI);
	return {
		x: jsonData.histDS[lastI],
		y: [jsonData.histVal[lastI]]
	};
}