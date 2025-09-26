import { StateGraph, MemorySaver, interrupt, Command } from "@langchain/langgraph";
import { StateAnnotation } from "./state.ts";
import *  as model from "./model.ts"
import fs from "fs/promises";
import * as tools from "./tools.ts"
import { ToolNode } from "@langchain/langgraph/prebuilt";
import type { AIMessage } from "@langchain/core/messages";
import { cragAgent } from "./subGraph.ts";

const today = new Date();

const receptionistPrompt = { role: "system", content: (await fs.readFile("./src/receptionistPrompt.txt", "utf-8")) + `\n Todays Date: ${today}` };
const receptionist = async (state: typeof StateAnnotation.State) => {
    const response = await model.receptionistModel.invoke(
        [receptionistPrompt, ...state.messages],
        { response_format: { type: 'json_object' } }
    );
    const responseJson = JSON.parse(response.content as string);

    return {
        messages: response,
        next: responseJson.redirect
    }
};

const nextResponder = (state: typeof StateAnnotation.State) => {
    switch (state.next) {
        case "MEDICINE":
            state.messages = [state.messages[state.messages.length - 2]!];
            return "generalMedicine";
        case "SURGEON":
            state.messages = [state.messages[state.messages.length - 2]!];
            return "generalSurgeon";
        case "GREET":
            return "__end__";
        default:
            return "__end__";
    }
}

const askPatient = (state: typeof StateAnnotation.State) => {
    const patientMessage: string = interrupt({
        doctor: state.messages[state.messages.length - 1]?.content
    });
    return new Command({
        goto: patientMessage !== '/bye' ? state.next : '__end__',
        update: {
            messages: [{
                role: "human",
                content: patientMessage,
            }]
        }
    });
}

const toolNode = new ToolNode([tools.searchTool, tools.retrieveMedicineKnowledge, tools.retrieveSurgeonKnowledge]);

const diagnosis = (state: typeof StateAnnotation.State) => {
    const lastMessages = state.messages[state.messages.length - 1] as AIMessage;
    const toolCalls = lastMessages.tool_calls;

    if (toolCalls?.length) {
        return "tools"
    }
    else
        return "askPatient"
}

const augment = (state: typeof StateAnnotation.State) => state.next;

const genMedicinePrompt = { role: "system", content: (await fs.readFile("./src/genMedicinePrompt.txt", "utf-8")) + `\n Todays Date: ${today}` };
const generalMedicine = async (state: typeof StateAnnotation.State) => {
    const response = await model.genMedicineModel.invoke([genMedicinePrompt, ...state.messages]);
    return { messages: response, next: "generalMedicine" }
};

const genSurgeonPrompt = { role: "system", content: (await fs.readFile("./src/genSurgeonPrompt.txt", "utf-8")) + `\n Todays Date: ${today}` };
const generalSurgeon = async (state: typeof StateAnnotation.State) => {
    const response = await model.genSurgeonModel.invoke([genSurgeonPrompt, ...state.messages], { response_format: { type: 'json_object' } });
    const responseJson = JSON.parse(response.content as string);

    if (responseJson.callSenior) {
        const subgraphOutput = await cragAgent.invoke({
            vectorIndex: process.env.PINECONE_INDEX_GEN_SURGEON,
            model: model.genSurgeonModel,
            question: responseJson.question
        });
        return { messages: subgraphOutput.generation, next: "generalSurgeon" }
    }
    else {
        return { messages: responseJson.message, next: "generalSurgeon" }
    }
};

const graph = new StateGraph(StateAnnotation)
    .addNode("receptionist", receptionist)
    .addNode("generalMedicine", generalMedicine)
    .addNode("generalSurgeon", generalSurgeon)
    .addNode("tools", toolNode)
    .addEdge("__start__", "receptionist")
    .addConditionalEdges("receptionist", nextResponder)
    .addNode("askPatient", askPatient)
    .addConditionalEdges("generalMedicine", diagnosis)
    .addEdge("generalSurgeon", "askPatient")
    .addConditionalEdges("tools", augment)

export const agent = graph.compile({ checkpointer: new MemorySaver() });