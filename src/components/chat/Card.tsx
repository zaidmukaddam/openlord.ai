import { GeistMono } from 'geist/font/mono';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';

const Code = ({ children }: { children: ReactNode }) => {
    return (
        <code
            className={`${GeistMono.className} text-xs bg-zinc-100 dark:bg-neutral-800 dark:text-white p-1 rounded-md border`}
        >
            {children}
        </code>
    );
};

export const Card = () => {
    return (
        <div className="w-full py-6 top-10">
            <div className="p-4 border rounded-lg flex flex-col gap-2 w-full">
                <div
                    className='flex items-center justify-center gap-2'
                >
                    <Image priority src="/logo.png" width={40} height={40} alt="Logo" />
                    <div className="text-2xl text-center font-semibold text-zinc-800 dark:text-neutral-100">
                        Openlord AI Chatbot
                    </div>
                </div>
                <div className="text-zinc-500 text-sm leading-[26.5px] flex flex-col gap-4 clear-both">
                    <p>
                        The <Code>Openlord</Code> is an open uncensored AI chatbot
                        with tool calls and multimodal capabilities. The tools are defined in the <Code>/api/chat/route.ts</Code> file
                        and the multi-modal capabilities of Language Models are powered by <Code>experimental_attachments</Code>{" "}
                        by{' '} <Link
                            target="_blank"
                            className="text-blue-500 hover:underline"
                            href="https://sdk.vercel.ai/docs/ai-sdk-ui/chatbot#attachments-experimental">
                            Vercel AI SDK
                        </Link>.
                    </p>

                    <p>
                        The chatbot supports only Vision Large Language Models (LLM) like GPT4o mini and Gemini 1.5 Flash.
                        To change the models, you can modify the <Code>model</Code> parameter in the <Code>route.ts</Code>
                        {" "}and <Code>types.ts</Code> files.
                    </p>

                    <p>
                        Visit the better live version of the chatbot at{' '}
                        <Link
                            target="_blank"
                            className="text-blue-500 hover:underline"
                            href="https://shitlord.lol"
                        >
                            shitlord.lol
                        </Link>.
                    </p>
                </div>
            </div>
        </div>
    );
};