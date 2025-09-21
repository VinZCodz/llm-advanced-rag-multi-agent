import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { getVectorStore } from "./vectorStoreClient.ts";
import { FILE_PATH } from './constants.ts';

const ingestDocument = async (filePath: string) => {
    const loader = new PDFLoader(filePath, { splitPages: false });
    const document = await loader.load();
    const metadata = document[0]?.metadata;

    const textSplitter = new CharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 100,
    });
    const texts = await textSplitter.splitText(document[0]?.pageContent ?? "");

    const documents = texts.map((chunk) => {
        return {
            pageContent: chunk,
            metadata: { source: metadata?.source }
        }
    });

    if (process.env.DO_EMBED_COSTLY_OP == "ENABLED")
        return await (await getVectorStore(process.env.PINECONE_INDEX_GEN_MEDICINE!)).addDocuments(documents);
    else {
        console.warn(`\nFeature flag DO_EMBED_COSTLY_OP is DISABLED, set to ENABLED for actual ingestion Run!`);
        console.warn(`Thus perform: Dummy Ingestion Run`);
    }
}

const runIngest = async () => {
    console.warn(`\nRunning ingestion pipeline!`);
    console.log(`Document from path: ${FILE_PATH}\n`);
    try {
        var doc = await ingestDocument(FILE_PATH);
        console.log(`\nDocument Embedding Done::: ${FILE_PATH}`);
        console.warn(`\nSuccessful Ingestion Run!`);

    } catch (error) {
        console.warn(`\nDocument failed to embed!!`);
        console.warn(`Ingestion pipeline failed!!\n\n${error}\n`);
    }
}

runIngest();