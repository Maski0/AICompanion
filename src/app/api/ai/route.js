import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API, // This is the default and can be omitted
});

export async function GET(req) {
  // WARNING: Do not expose your keys
  // WARNING: If you host publicly your project, add an authentication layer to limit the consumption of ChatGPT resources

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are a heaplful bot ${req.nextUrl.searchParams.get("custom-system-prompt")} and while giving the response in following json, store response respectively and give appropriate expression(which should be selected depending on the response from only this list [Happy,Sad,Surprised,Angry,Confused,Nutral])  `,
      },
      {
        role: "system",
        content: `You always respond with a JSON object with the following format: 
        {
          "response": "",
          "expression": "",
        }`,
      },
      {
        role: "user",
        content: `${req.nextUrl.searchParams.get("question")}`,
      },
    ],
    // model: "gpt-4-turbo-preview", 
    model: "gpt-4o-mini",
    response_format: {
      type: "json_object",
    },
  });
  console.log(chatCompletion.choices[0].message.content);
  return Response.json(JSON.parse(chatCompletion.choices[0].message.content));
}
