import { TavilySearch } from "@langchain/tavily";
import { Document, type DocumentInterface } from "@langchain/core/documents";
import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { pull } from "langchain/hub";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { formatDocumentsAsString } from "langchain/util/document";
import { StateGraph } from "@langchain/langgraph";
import { SubStateAnnotation } from "./subState.ts";
import fs from "fs/promises";

const retrieve = async (state: typeof SubStateAnnotation.State) => {
    console.log("---RETRIEVE---");

    const retriever = state.vectorStore.asRetriever({ k: 3 });

    const documents = await retriever
        .withConfig({ runName: "FetchRelevantDocuments" })
        .invoke(state.question);

    return {
        documents,
    };
}

const gradeDocuments = async (state: typeof SubStateAnnotation.State) => {
    console.log("---CHECK RELEVANCE---");

    const llmWithTool = state.model.withStructuredOutput(
        z.object({
            binaryScore: z
                .enum(["yes", "no"])
                .describe("Relevance score 'yes' or 'no'"),
        })
            .describe(
                "Grade the relevance of the retrieved documents to the question. Either 'yes' or 'no'."
            ),
        {
            name: "grade",
        }
    );

    const prompt = ChatPromptTemplate.fromTemplate((await fs.readFile("./src/graderPrompt.txt", "utf-8")));

    const chain = prompt.pipe(llmWithTool);

    const filteredDocs: Array<DocumentInterface> = [];
    for await (const doc of state.documents) {
        const grade = await chain.invoke({
            context: doc.pageContent,
            question: state.question,
        });
        if (grade.binaryScore === "yes") {
            console.log("---GRADE: DOCUMENT RELEVANT---");
            filteredDocs.push(doc);
        } else {
            console.log("---GRADE: DOCUMENT NOT RELEVANT---");
        }
    }

    return {
        documents: filteredDocs,
    };
}

const decideToGenerate = (state: typeof SubStateAnnotation.State) => {
    console.log("---DECIDE TO GENERATE---");

    const filteredDocs = state.documents;
    if (filteredDocs.length === 0) {
        console.log("---DECISION: TRANSFORM QUERY---");
        return "transformQuery";
    }

    console.log("---DECISION: GENERATE---");
    return "generate";
}

const generate = async (state: typeof SubStateAnnotation.State) => {
    console.log("---GENERATE---");

    const prompt = await pull<ChatPromptTemplate>("rlm/rag-prompt");
    const ragChain = prompt.pipe(state.model).pipe(new StringOutputParser());

    const generation = await ragChain.invoke({
        context: formatDocumentsAsString(state.documents),
        question: state.question,
    });

    return {
        generation,
    };
}

const transformQuery = async (state: typeof SubStateAnnotation.State) => {
    console.log("---TRANSFORM QUERY---");

    const prompt = ChatPromptTemplate.fromTemplate((await fs.readFile("./src/transformQueryPrompt.txt", "utf-8")));

    const chain = prompt.pipe(state.model).pipe(new StringOutputParser());
    const betterQuestion = await chain.invoke({ question: state.question });

    return {
        question: betterQuestion,
    };
}

const webSearch = async (state: typeof SubStateAnnotation.State) => {
    console.log("---WEB SEARCH---");

    const tool = new TavilySearch();
    const docs = await tool.invoke({ query: state.question });
    const webResults = new Document({ pageContent: docs });
    const newDocuments = state.documents.concat(webResults);

    return {
        documents: newDocuments,
    };
}

const graph = new StateGraph(SubStateAnnotation)
    .addNode("retrieve", retrieve)
    .addNode("gradeDocuments", gradeDocuments)
    .addNode("generate", generate)
    .addNode("transformQuery", transformQuery)
    .addNode("webSearch", webSearch);

graph.addEdge('__start__', "retrieve");
graph.addEdge("retrieve", "gradeDocuments");
graph.addConditionalEdges("gradeDocuments", decideToGenerate);
graph.addEdge("transformQuery", "webSearch");
graph.addEdge("webSearch", "generate");
graph.addEdge("generate", '__end__');
graph._

export const cragAgent = graph.compile().description;