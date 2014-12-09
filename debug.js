var chunkingStreams = require('chunking-streams'),
   chunker = new chunkingStreams.SeparatorChunker({ separator: '\r\n' }),
   FilterStream = chunkingStreams.FilterStream;

module.exports = function(uart) {
   process.stdin.resume();
   process.stdin.on('data', function (data) {
      data = String(data).replace(/[\r\n]*$/, '');  //  Removes the line endings

      uart.write(data + '\r\n');
   });

   var filterVoltage = new FilterStream({
      filter: function(line) {
         return line.toString() != 'UNDER-VOLTAGE WARNNING';

      }
   });
   uart.pipe(chunker).pipe(filterVoltage).on('data', function(line){
      console.log(line.toString());
   });
};