import { Message } from "ai/react";
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import React, { useEffect, useState } from 'react';
import ReactMarkdown from "react-markdown";

import { cn } from "@/lib/utils";

import ToolInvocation from './ToolInvocation';

interface CardRotateProps {
  children: React.ReactNode;
  onSendToBack: () => void;
}

function CardRotate({ children, onSendToBack }: CardRotateProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [30, -30]);
  const rotateY = useTransform(x, [-100, 100], [-30, 30]);

  function handleDragEnd(_: any, info: PanInfo) {
    const threshold = 100;
    if (
      Math.abs(info.offset.x) > threshold ||
      Math.abs(info.offset.y) > threshold
    ) {
      onSendToBack();
    } else {
      x.set(0);
      y.set(0);
    }
  }

  return (
    <motion.div
      className="absolute h-full w-full cursor-grab"
      style={{ x, y, rotateX, rotateY }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.6}
      whileTap={{ cursor: "grabbing" }}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
}

const SwipeableImageStack: React.FC<{ images: string[] }> = ({ images }) => {
  const [cards, setCards] = useState(images.map((img, index) => ({ id: index, img })));
  const [stackSize, setStackSize] = useState({ width: 208, height: 208 });

  useEffect(() => {
    const updateSize = () => {
      const width = Math.min(window.innerWidth * 0.8, 208);
      setStackSize({ width, height: width });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const sendToBack = (id: number) => {
    setCards((prev) => {
      const newCards = [...prev];
      const index = newCards.findIndex((card) => card.id === id);
      const [card] = newCards.splice(index, 1);
      newCards.unshift(card);
      return newCards;
    });
  };

  return (
    <div className="relative mx-auto my-4" style={{ width: stackSize.width, height: stackSize.height, perspective: 600 }}>
      {cards.map((card, index) => (
        <CardRotate key={card.id} onSendToBack={() => sendToBack(card.id)}>
          <motion.div
            className="h-full w-full rounded-lg"
            animate={{
              rotateZ: (cards.length - index - 1) * 4,
              scale: 1 + index * 0.06 - cards.length * 0.06,
              transformOrigin: "90% 90%",
            }}
            initial={false}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <Image
              src={card.img}
              alt={`Attachment ${card.id + 1}`}
              width={stackSize.width}
              height={stackSize.height}
              className="pointer-events-none h-full w-full rounded-lg object-cover"
            />
          </motion.div>
        </CardRotate>
      ))}
    </div>
  );
};

export const ChatMessages = ({ messages }: { messages: Message[] }) => {
  return (
    <div className="flex w-full flex-1 flex-col gap-4 px-2 sm:px-4 py-4 sm:py-8">
      {messages.map((m) => (
        <ChatMessage key={m.id} message={m} />
      ))}
    </div>
  );
};

const ChatMessage = ({ message }: { message: Message }) => {
  const isSelf = message.role === "user";

  const renderAttachments = () => {
    if (!message.experimental_attachments) return null;

    const imageAttachments = message.experimental_attachments
      .filter(attachment => attachment.contentType?.startsWith("image/"))
      .map(attachment => attachment.url);

    if (imageAttachments.length > 0) {
      return <SwipeableImageStack images={imageAttachments} />;
    }

    return null;
  };

  const renderContent = () => {
    if (isSelf) {
      return (
        <>
          <div className="text-sm w-full">{message.content}</div>
          {renderAttachments()}
        </>
      );
    }

    return (
      <>
        <ReactMarkdown className="prose dark:prose-invert prose-strong:font-medium text-sm">{message.content}</ReactMarkdown>
        {message.toolInvocations?.map((toolInvocation, index) => (
          <ToolInvocation key={`${toolInvocation.toolCallId}-${index}`} toolInvocation={toolInvocation} />
        ))}
        {renderAttachments()}
      </>
    );
  };

  return (
    <div className={cn("flex", isSelf ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-full sm:max-w-[80%]",
        isSelf ? "rounded-3xl bg-muted px-3 sm:px-5 py-2 sm:py-2.5 ml-4" : "px-1 py-1"
      )}>
        {renderContent()}
      </div>
    </div>
  );
};

export default ChatMessages;