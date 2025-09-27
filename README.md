# Advanced Agentic RAG - LangGraph SubGraph and MultiAgent System
Exploring Agentic backend concepts of Agentic-RAG and Corrective-RAG(cRAG) via LangGraph framework: using its Human-in-Loop(HIL), SubGraph, custom States to build into MutliAgent system.

### What's RAG?
---
Have you ever had a need to ctrl+f your ways to find relevant keywords from the large documents or did lot of internet and information scraping from the knowledge sources and ranked them, filtered them to arrive at final relevance to attain "zen" with context! then you had need! doing this in a AI era seems counter productive and much more if your workflows, automated systems and enterprises are doing them!

**RAG does it better**: its called Retrieval Augment Generation, where AI is augmented/enriched with domain specific knowledge, so it can be helpful to you in your own ways, in your business and take/make decisions specifically for the need at hand, than being a general profound systems!

<p align="center">
<img width="700" height="500" alt="image" src="https://github.com/user-attachments/assets/f5e38880-7820-4106-bc71-f57ba8ae61c0" />
</p>

### Aren't AI/Agent/Model smart already, why Augment them?
LLM's are dramatic, set temperature high and see for yourself! 

Now imagine fabricating answers/actions based on made up stuff! LLMs generate incorrect or fabricated information (Factual Hallucinations)! at-least for sensitive business domains like Medical, Legal, Financial where there are nuances that need to be honored, it renders useless. If reason's are imaginative ergo their actions.

This drives a compelling need to ground your models with specific information so that it can be reliable when it comes to responses and acting them out! Thus RAG your way!

### Its Kind?
---
* Agentic RAG: in simple words, when Retrieval(R) is done by Agent autonomously and subject its rationale to be Augmented(A) to perform predictions and Generation(G). Its where a AI Model, (Re)asons out on its own and (Act)s to use document retrieval mechanisms to enrich its domain/specific knowledge base.

How is this any different than Traditional RAG/Vanilla Rag/Basic RAG:

<p align="center">
<img width="700" height="500" alt="image" src="https://github.com/user-attachments/assets/364692b0-90c9-41c6-8f82-aada7e0f27ec" />
</p>

* Traditional RAG: in this RAG, the user performers a before hand/upfront retrieval as context and feeds this along with messages. Here the retrieval is more user driven and lacks model autonomy to make retrievals based on its ReAct methodology. 
> A simpler process where a query retrieves context from a knowledge base once, and then a Large Language Model (LLM) generates a single response. 

<p align="center">
<img width="700" height="300" alt="image" src="https://github.com/user-attachments/assets/aac156f4-5b6e-41d6-a5ad-e260f84f45f5" />
</p>

---

### What's the main differentiator:
Basic RAG follows a fixed, pre-defined process where it performs one-shot retrieval and typically use LLM/SLM for generation at the end of the chain.

-Vs-

A dynamic and an on demand retrieval, where an LLM/SLM model reasons out using its Chain of Thought(CoT) to make the retrieval happen more dynamically and "Adaptively", as much/when needed! Here ReAct principle of Agents are completely made used and Model is the primary driver. 

---

### Does this mean more control to Model on my Sensitive Data Stores!
If there are sensitive data stores involved, the workflow of such Agentic RAG can be programmed to have Human in Loop(HIL) mechanism, to clearly audit and approve its chain of thoughts. Which gives same sense of model autonomy but unleashed in a controlled/approved way.

---

### How to decrease Hallucinations and increase Accuracy and Reliability?

There are two mechanism to do so:

* **cRAG**: Corrective RAG, where an Agentic RAG system subjugates its responses to be corrected by grading/ranking its retrieved documents/knowledge, by their relevance and if found irrelevant, goes step ahead and try to rectify/(C)orrecting its querying mechanism, so that it retrieves much better this time!

> This corrective loop in a Agent, renders decreased Hallucinations and increased Accuracy and Reliability.

Research Paper: (https://arxiv.org/pdf/2401.15884)

<p align="center">
<img width="785" height="279" alt="image" src="https://github.com/user-attachments/assets/cbb5ea54-85c6-454b-a232-4549d51f48de" />
</p>

* **Self-RAG**: Self aware/reflective RAG! meaning, the above corrections mechanism and Agentic RAG mechanisms are subjugated to be self aware, as in a more simpler terms, have an additional loop to reflect and reason/critique the responses generated and send way back if it is found irrelevant. Thus being self critical before Acting them off!

**Making these kinds of agents to be best fit for sensitive and missions critical tasks such as automated machinery, finance, medical etc.**

>  Experiments show that SELFRAG (7B and 13B parameters) significantly outperforms state-of-the-art LLMs
and retrieval-augmented models on a diverse set of tasks. Specifically, SELF-RAG
outperforms ChatGPT and retrieval-augmented Llama2-chat on Open-domain QA,
reasoning and fact verification tasks, and it shows significant gains in improving
factuality and citation accuracy for long-form generations relative to these models.

Research Paper: (https://arxiv.org/pdf/2310.11511)
<p align="center">
<img width="785" height="400" alt="image" src="https://github.com/user-attachments/assets/fb64eb43-529e-49aa-95ac-29307426dad6" />
</p>

## My Hands-On Implementation:

In this project,
* I've explored concepts of Agentic RAG for sensitive Medical Domain. Implementing a structured custom Graph via LangGraph framework and getting into deeper SubGraph to do an Agentic hand-off.

* The three LLM's perform their said job role via few shot prompting.
* The specialized doctors perform their role via Agentic RAG and more precisely Surgeon equipped with cRAG mechanism to be more accurate in its recommendations.
* Patients are engaged via Human-in-Loop interrupts.
* Making use of Retrieval Vector stores, Internet Searching Tools for Query Refinements and Grading system to be relevant.

<p align="center">
<img width="1909" height="350" alt="Capture" src="https://github.com/user-attachments/assets/da219c69-8939-4d93-b8a8-b1f56be11839" />
</p>

### Tech Stack: 
typescript, LangGraph Framework for Custom and Sub Graph, Agentic and Corrective RAG system, PineCone Vector DB, Multi Agent hand-off via different state annotations.


## Thanks & Refrences:
Thanks for digarms and knowledge:

https://blog.langchain.com/agentic-rag-with-langgraph/
https://huggingface.co/learn/cookbook/en/advanced_rag

Research Paper: 
* https://arxiv.org/pdf/2401.15884
* https://arxiv.org/pdf/2310.11511
  

