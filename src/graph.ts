import { StateGraph, MemorySaver, interrupt, Command } from "@langchain/langgraph";
import { StateAnnotation } from "./state.ts";
import *  as model from "./model.ts"
import fs from "fs/promises";
import * as tools from "./tools.ts"
import { ToolNode } from "@langchain/langgraph/prebuilt";
import type { AIMessage } from "@langchain/core/messages";

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

    // const inputs = {
    //     question: "Explain how the different types of agent memory work.",
    // };
    // const config = { recursionLimit: 50 };
    // let finalGeneration;
    // for await (const output of await app.stream(inputs, config)) {
    //     for (const [key, value] of Object.entries(output)) {
    //         console.log(`Node: '${key}'`);
    //         // Optional: log full state at each node
    //         // console.log(JSON.stringify(value, null, 2));
    //         finalGeneration = value;
    //     }
    //     console.log("\n---\n");
    // }

    // // Log the final generation.
    // console.log(JSON.stringify(finalGeneration, null, 2));



    const response = await model.genSurgeonModel.invoke([genSurgeonPrompt, ...state.messages]);
    return { messages: response, next: "generalSurgeon" }



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
    .addConditionalEdges("generalSurgeon", diagnosis)
    .addConditionalEdges("tools", augment)

export const agent = graph.compile({ checkpointer: new MemorySaver() });