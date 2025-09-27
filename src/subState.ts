import { Annotation } from "@langchain/langgraph";
import * as DocInterface from "@langchain/core/documents";
import type { ChatGroq } from "@langchain/groq";

export const SubStateAnnotation = Annotation.Root({
    vectorIndex: Annotation<string>,
    model: Annotation<ChatGroq>,
    documents: Annotation<DocInterface.DocumentInterface[]>,
    summary: Annotation<string>,
    generation: Annotation<string>,
});