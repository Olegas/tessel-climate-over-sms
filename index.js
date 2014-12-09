var tesselate = require('tesselate'),
    commander = require('uart-commander');

tesselate({
   modules: {
      D: ['ambient-attx4', 'ambient'],
      C: ['climate-si7005', 'climate']
   }
}, function(tessel, modules){

   var
      portA = tessel.port.A,
      climate = modules.climate,
      ambient = modules.ambient,
      latestData = {},
      uart = new portA.UART({
         baudrate: 115200
      });

   // uncomment this to see all AT-commands in/out
   // require('./debug')(uart);

   (function loopAmbient() {
      setImmediate(function() {
         ambient.getLightLevel( function(err, ldata) {
            ambient.getSoundLevel( function(err, sdata) {
               latestData.light = ldata.toFixed(2);
               latestData.sound = sdata.toFixed(2);
               setTimeout(loopAmbient, 250);
            });
         });
      })
   })();

   (function loopClimate() {
      setImmediate(function loop () {
         climate.readTemperature('c', function (err, temp) {
            climate.readHumidity(function (err, humid) {
               latestData.temp = temp.toFixed(2);
               latestData.humid = humid.toFixed(2);
               setTimeout(loopClimate, 300);
            });
         });
      });
   })();

   commander(uart, function(){
      ctrlz();
      ctrlz();
      ctrlz();
      linemode();

      at('z');
      wait('OK');
      label('waitSMS');
      linemode();
      timeout(0);
      perform(function(){
         console.log('Waiting for incoming SMS');
      });
      wait(/\+CMTI: "SM",(\d+)/);
      perform(function(){
         console.log('SMS message received');
      });
      rawmode();
      timeout(1000);
      at('+CMGR=$1');
      wait(/\+CMGR: "[^"]+","([+0-9]*)","[^"]*","([^"]+)"([\s\S]*)OK/);
      performAsync(function(line, wholeMatch, from, date, text, done) {
         if (text.trim().toLowerCase() == 'report') {
            console.log('Sending report to ' + from);
            commander(uart, function() {
               linemode();
               timeout(1000);
               at('+cmgf=1');
               wait('OK');
               rawmode();
               at('+cmgs="' + from + '"');
               wait('>');
               write('Light: ' + latestData.light +
                  ', Sound: ' + latestData.sound +
                  ', Temperature: ' + latestData.temp +
                  ', Humidity: ' + latestData.humid);
               ctrlz();
               linemode();
               timeout(0);
               wait(/\+CMGS: \d+/);
            }, done);
         }
      });
      ifOk('waitSMS');
   });

});