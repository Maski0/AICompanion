# AI Companion

3D:

- Open AI, Azure TTS with visemes

##

2D:

- Live2D Cubism , Elize (Eliza provided AI, ElevenLabs)
##

## Custom Endpoint in Eliza Framework

> in packages\client-direct\src\index.ts

```
this.app.post("/:agentId/speaktext", async (req, res) => {
  const TotalstartTime = performance.now();
  const agentId = req.params.agentId;
  const roomId = stringToUuid(req.body.roomId ?? "default-room-" + agentId);
  const userId = stringToUuid(req.body.userId ?? "user");
  const text = req.body.text;

  if (!text) {
    res.status(400).send("No text provided");
    return;
  }

  let runtime = this.agents.get(agentId);

  // if runtime is null, look for runtime with the same name
  if (!runtime) {
    runtime = Array.from(this.agents.values()).find(
      (a) => a.character.name.toLowerCase() === agentId.toLowerCase()
    );
  }

  if (!runtime) {
    res.status(404).send("Agent not found");
    return;
  }

  try {
    // Process message through agent (same as /message endpoint)
    await runtime.ensureConnection(
      userId,
      roomId,
      req.body.userName,
      req.body.name,
      "direct"
    );

    const messageId = stringToUuid(Date.now().toString());

    const content: Content = {
      text,
      attachments: [],
      source: "direct",
      inReplyTo: undefined,
    };

    const userMessage = {
      content,
      userId,
      roomId,
      agentId: runtime.agentId,
    };

    const memory: Memory = {
      id: messageId,
      agentId: runtime.agentId,
      userId,
      roomId,
      content,
      createdAt: Date.now(),
    };

    await runtime.messageManager.createMemory(memory);

    const state = await runtime.composeState(userMessage, {
      agentName: runtime.character.name,
    });

    const context = composeContext({
      state,
      template: messageHandlerTemplate,
    });
    const GenerateResponseStartTime = performance.now();

    const response = await generateMessageResponse({
      runtime: runtime,
      context,
      modelClass: ModelClass.LARGE,
    });
    const GenerateResponseendTime = performance.now();
    console.log(
      `Genereate Response Time took ${(GenerateResponseendTime - GenerateResponseStartTime).toFixed(2)} ms`
    );

    // save response to memory
    const responseMessage = {
      ...userMessage,
      userId: runtime.agentId,
      content: response,
    };

    await runtime.messageManager.createMemory(responseMessage);

    if (!response) {
      res.status(500).send("No response from generateMessageResponse");
      return;
    }

    await runtime.evaluate(memory, state);

    const _result = await runtime.processActions(
      memory,
      [responseMessage],
      state,
      async () => {
        return [memory];
      }
    );

    // Get the text to convert to speech
    const textToSpeak = response.text;
    const elevenLabStratTime = performance.now();

    // Convert to speech using ElevenLabs
    const elevenLabsApiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`;
    const apiKey = process.env.ELEVENLABS_XI_API_KEY;

    if (!apiKey) {
      throw new Error("ELEVENLABS_XI_API_KEY not configured");
    }

    const speechResponse = await fetch(elevenLabsApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text: textToSpeak,
        model_id: process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2",
        voice_settings: {
          stability: parseFloat(
            process.env.ELEVENLABS_VOICE_STABILITY || "0.5"
          ),
          similarity_boost: parseFloat(
            process.env.ELEVENLABS_VOICE_SIMILARITY_BOOST || "0.9"
          ),
          style: parseFloat(process.env.ELEVENLABS_VOICE_STYLE || "0.66"),
          use_speaker_boost:
            process.env.ELEVENLABS_VOICE_USE_SPEAKER_BOOST === "true",
        },
      }),
    });

    if (!speechResponse.ok) {
      throw new Error(`ElevenLabs API error: ${speechResponse.statusText}`);
    }
    const elevenLabEndTime = performance.now();
    console.log(
      `ElevenLabs Time took ${(elevenLabEndTime - elevenLabStratTime).toFixed(2)} ms`
    );

    const audioBuffer = await speechResponse.arrayBuffer();

    // Create a multipart response with both text and audio
    const boundary = "boundary-" + Date.now().toString(16);
    res.set({
      "Content-Type": `multipart/mixed; boundary=${boundary}`,
      "Transfer-Encoding": "chunked",
    });

    // Write text part
    res.write(
      `--${boundary}\r\n` +
        "Content-Type: application/json\r\n\r\n" +
        JSON.stringify({
          text: textToSpeak,
          messageId: messageId,
          timestamp: Date.now(),
        }) +
        "\r\n"
    );

    // Write audio part
    res.write(
      `--${boundary}\r\n` +
        "Content-Type: audio/mpeg\r\n" +
        `Content-Length: ${audioBuffer.byteLength}\r\n\r\n`
    );
    res.write(Buffer.from(audioBuffer));

    // End the multipart message
    res.write(`\r\n--${boundary}--`);
    res.end();
  } catch (error) {
    console.error("Error processing message or generating speech:", error);
    res.status(500).json({
      error: "Error processing message or generating speech",
      details: error.message,
    });
  }
  const TotalendTime = performance.now();
  console.log(
    `Endpoint Time took ${(TotalendTime - TotalstartTime).toFixed(2)} ms`
  );
});
```
