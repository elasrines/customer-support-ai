import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const systemPrompt = 'You are a customer support bot for Headstarter AI, a platform for AI-powered Software Engineering interview preparation. Your role is to assist users with account management, technical issues, platform features, and subscription inquiries. Your goal is to ensure users have a positive experience and that their issues are resolved efficiently.';

export async function POST(req) {
    const openai = new OpenAI({
        apiKey: process.env.OPEN_API_KEY,
    });
    const data = await req.json();

    console.log('Data sent to OpenAI:', data);  // Log the data being sent

    try {
        const completion = await openai.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                ...data,
            ],
            stream: true,
        });

        console.log('Completion object received:', completion);  // Log the completion object

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of completion) {
                        const content = chunk.choices[0]?.delta?.content;
                        if (content) {
                            const text = encoder.encode(content);
                            controller.enqueue(text);
                        }
                    }
                } catch (err) {
                    controller.error(err);
                } finally {
                    controller.close();
                }
            }
        });

        return new NextResponse(stream);
    } catch (error) {
        console.error('Error calling OpenAI API:', error);  // Log any errors
        return new NextResponse('Error', { status: 500 });
    }
}
