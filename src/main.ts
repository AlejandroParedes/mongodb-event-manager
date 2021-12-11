import { ChangeStream, Document, MongoClient } from "mongodb";

/**
 * Entry point to start client and react to data
 */
async function main() {
  const uri =
    "mongodb://localhost:27017/?readPreference=primary&directConnection=true&ssl=false";
  const client: MongoClient = new MongoClient(uri);
  try {
    await client.connect();

    const pipeline: Document[] = [
      {
        $match: {
          operationType: "delete",
        },
      },
    ];
    await monitorListingsUsingStreamAPI(client, pipeline);
  } catch (e) {
    console.log(e);
  }
}

main().catch(console.error);

/**
 * List collection changes
 * @param {MongoClient} client - Client to listen events
 * @param {Document[]} pipeline - Agregation to filter events
 */
async function monitorListingsUsingStreamAPI(
  client: MongoClient,
  pipeline: Document[] = []
) {
  const collection = client.db("test").collection("user");
  const changeStream: ChangeStream = collection.watch(pipeline);

  changeStream.on("change", (change) => {
    console.log(change);
  });
}
