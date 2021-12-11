import {ChangeStream, Document, MongoClient} from "mongodb"
import * as stream from "stream"

async function main() {
  const uri: string = "mongodb://localhost:27017/?readPreference=primary&directConnection=true&ssl=false";
  const client: MongoClient = new MongoClient(uri);
  try {
    await client.connect();
    console.log("already connected");

    const pipeline: Document[] = [{
      "$match": {
        "operationType": "delete",
      }
    }];
    await monitorListingsUsingStreamAPI(client, 600000,pipeline);
  } finally {
    console.log("error on connection");
    await client.close();
  }
}

main().catch(console.error);

function closeChangeStream(timeInMs: number, changeStream: any) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log("closing the change stream");
      changeStream.close();
      resolve();
    }, timeInMs)
  });
}

async function monitorListingsUsingStreamAPI(client: MongoClient, timeInMs: number = 600000, pipeline: Document[] = []) {
  const collection = client.db("test").collection("user");
  const changeStream: ChangeStream = collection.watch(pipeline);

  changeStream.stream().pipe(
    new stream.Writable({
      objectMode: true,
      write: function (doc, _, cb) {
        console.log(doc);
        cb();
      }
    })
  )
  await closeChangeStream(timeInMs, changeStream)
}
