import { z } from "zod";
import { TavilySearch } from "@langchain/tavily";
import { tool } from "@langchain/core/tools";
import { getVectorStore } from "./ingest/vectorStoreClient.ts";
import { createRetrieverTool } from "langchain/tools/retriever";

export const searchTool = new TavilySearch({
    maxResults: 3,
    topic: "general",
});

const medicineKSRetriever = (await getVectorStore(process.env.PINECONE_INDEX_GEN_MEDICINE!)).asRetriever({ k: 2 });
export const retrieveMedicineKnowledge = createRetrieverTool(medicineKSRetriever,
    {
        name: "retrieveMedicineKnowledge",
        description: "Call to retrieve the quick guide and knowledge source on General Medicine.",
    }
);

const surgeonKSRetriever = (await getVectorStore(process.env.PINECONE_INDEX_GEN_SURGEON!)).asRetriever({ k: 3 });
export const retrieveSurgeonKnowledge = createRetrieverTool(surgeonKSRetriever,
    {
        name: "retrieveSurgeonKnowledge",
        description: "Call to retrieve the quick guide and knowledge source on General Surgery.",
    }
);