import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
    apiKey: process.env['ANTHROPIC_API_KEY'], // This is the default and can be omitted
});
  
export async function GET(req) {
    const message = await client.messages.create({
      max_tokens: 1024,
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
      model: 'claude-3-opus-20240229',
    });
    console.log(message.content);
    return Response.json(JSON.parse(message.content));
}