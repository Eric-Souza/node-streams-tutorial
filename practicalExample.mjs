import { pipeline, Readable, Writable, Transform } from 'stream';
import { promisify } from 'util';
import { createWriteStream } from 'fs';

// Pipeline returns a callback, so we promisify it
const pipelineAsync = promisify(pipeline);

// Process 01
{
  const readableStream = Readable({
    read: function () {
      this.push('Test1');
      this.push('Test2');
      this.push('Test3');

      // Ends data
      this.push(null);
    },
  });

  const writableStream = Writable({
    write(chunk, encoding, cb) {
      console.log('msg', chunk.toString()); // Chunk returns a Buffer
      cb();
    },
  });

  await pipelineAsync(readableStream, writableStream);

  console.log('Process 01 finished');
}

// Process 02
{
  const readableStream = Readable({
    read() {
      for (let index = 0; index < 1e5; index++) {
        const person = { id: Date.now() + index, name: `TestName-${index}` };
        const data = JSON.stringify(person);

        this.push(data);
      }

      // Ends data
      this.push(null);
    },
  });

  const writableToCSV = Transform({
    transform(chunk, encoding, cb) {
      const data = JSON.parse(chunk);
      const result = `${data.id},${data.name.toUpperCase()}\n`;

      // cb(error, sucess)
      cb(null, result);
    },
  });

  const setHeader = Transform({
    transform(chunk, encoding, cb) {
      this.counter = this.counter ?? 0;

      if (this.counter > 0) {
        return cb(null, chunk);
      }

      this.counter += 1;

      cb(null, 'id,name\n'.concat(chunk));
    },
  });

  await pipelineAsync(
    readableStream,
    writableToCSV,
    setHeader,
    createWriteStream('my.csv'),
  );
}
