import { createSecureServer } from "node:http2";
import { readFileSync, watch } from "node:fs";

const CURRENT_DIR = "./";

const server = createSecureServer({
  key: readFileSync("./localhost-privkey.pem"),
  cert: readFileSync("./localhost-cert.pem"),
});

server.on("error", (err) => console.error(err));

server.on("stream", (stream, headers) => {
  if (headers[":path"]?.endsWith(".mjs")) {
    // stream is a Duplex
    stream.respond({
      "content-type": "application/javascript; charset=utf-8",
      ":status": 200,
    });
    stream.end(readFileSync(CURRENT_DIR + headers[":path"]));
  } else if (headers[":path"] === "/hot") {
    stream.respond({
      "content-type": "text/event-stream",
      ":status": 200,
    });
    watch(`${CURRENT_DIR}`, (_, filename) =>
      stream.write(`data: ${filename}\n\n`)
    );
  } else {
    stream.respond({
      "content-type": "text/html; charset=utf-8",
      ":status": 200,
    });
    stream.end(readFileSync(CURRENT_DIR + "index.html"));
  }
});

console.info("Server listening on port 8000");
server.listen(8000);
