import { StateGraph, MemorySaver } from "@langchain/langgraph";
import { StateAnnotation } from "./state.ts";
import { model } from "./model.ts"
import fs from "fs/promises";

const today = new Date();

const receptionistPrompt = { role: "system", content: (await fs.readFile("./src/receptionistPrompt.txt", "utf-8")) + `\n Todays Date: ${today}` };
const receptionist = async (state: typeof StateAnnotation.State) => {
    const response = await model.invoke(
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
        case "MEDICINE": return "generalMedicine";
        case "SURGEON": return "generalSurgeon";
        case "GREET": return "__end__";
        default: return "__end__";
    }
}

const genMedicinePrompt = { role: "system", content: (await fs.readFile("./src/genMedicinePrompt.txt", "utf-8")) + `\n Todays Date: ${today}` };
const generalMedicine = (state: typeof StateAnnotation.State) => {
    console.log(`redirected generalMedicine`);
    //const response = model.invoke([genMedicinePrompt, ...state.messages]);

    return state;
};

const genSurgeonPrompt = { role: "system", content: (await fs.readFile("./src/genSurgeonPrompt.txt", "utf-8")) + `\n Todays Date: ${today}` };
const generalSurgeon = (state: typeof StateAnnotation.State) => {
    console.log(`redirected generalSurgeon`);
    //const response = model.invoke([genSurgeonPrompt, ...state.messages]);

    return state;
};

const graph = new StateGraph(StateAnnotation)
    .addNode("receptionist", receptionist)
    .addNode("generalMedicine", generalMedicine)
    .addNode("generalSurgeon", generalSurgeon)
    .addEdge("__start__", "receptionist")
    .addConditionalEdges("receptionist", nextResponder)


    //TODO: remove
    .addEdge("generalMedicine", "__end__")
    .addEdge("generalSurgeon", "__end__")

export const agent = graph.compile({ checkpointer: new MemorySaver() });