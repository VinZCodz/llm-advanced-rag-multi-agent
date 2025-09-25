import { Annotation } from "@langchain/langgraph";
import * as DocInterface from "@langchain/core/documents";
import type { PineconeStore } from "@langchain/pinecone";
import type { ChatGroq } from "@langchain/groq";

export const SubStateAnnotation = Annotation.Root({
    vectorStore: Annotation<PineconeStore>,
    model: Annotation<ChatGroq>,
    documents: Annotation<DocInterface.DocumentInterface[]>,
    question: Annotation<string>,
    generation: Annotation<string>,
});