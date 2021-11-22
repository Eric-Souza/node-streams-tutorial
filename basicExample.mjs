import http from 'http';
import { readFileSync, createReadStream } from 'fs';
import net from 'net';

// Using basic std
const stdin = process.stdin.on('data', (msg) =>
  console.log('entrada terminal', msg.toString()),
);

const stdout = process.stdout.on('data', (msg) =>
  console.log('saida terminal', msg.toString()),
);

stdin
  .pipe(stdout)

  .on('error')
  .on('end')
  .on('close');

// Using http server, run "node -e "process.stdout.write(crypto.randomBytes(1e9))" > big.file" to create 100000 bytes into big.file
http
  .createServer((req, res) => {
    // Using readFileSync
    // The code below'll not compile because the file'll be too big
    const file = readFileSync('big.file').toString();
    res.write(file);
    res.end;

    // Using createReadStream
    // Separates file into smaller chunks
    createReadStream('big.file').pipe(res);
  })
  .listen(3000, () => console.log('Server running at port 3000'));

// Using socket, run "node -e "process.stdin.pipe(require('net').connect(1338))""
net.createServer((socket) => socket.pipe(process.stdout)).listen(1338);
