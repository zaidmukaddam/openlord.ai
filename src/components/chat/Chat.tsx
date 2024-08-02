/* eslint-disable @next/next/no-img-element */
"use client";

import { useChat } from "ai/react";
import { ArrowUp, ImageIcon, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { ExpandableTextarea } from "@/components/atoms/ExpandableTextarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { ModelName } from "@/lib/types";
import { useAppStore } from "@/lib/useAppStore";
import { cn } from "@/lib/utils";

import { Card } from "./Card";
import { ChatMessages } from "./ChatMessage";

const MAX_IMAGES = 5;

export function Chat() {
  const { toast } = useToast();
  const model = useAppStore((state) => state.model);
  const temperature = useAppStore((state) => state.temperature);
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    maxToolRoundtrips: 4,
    body: {
      model,
      temperature,
    },
    onError: (error) => {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Woah! Hold Up!",
        description:
          "Oops, something went wrong! Please try again later.",
      });
    },
  });

  const formRef = useRef<HTMLFormElement>(null);
  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    scrollAreaRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newImages = Array.from(event.target.files).filter(file => file.type.startsWith('image/'));
      setImages(prevImages => {
        const updatedImages = [...prevImages, ...newImages].slice(0, MAX_IMAGES);
        if (updatedImages.length === MAX_IMAGES) {
          toast({
            title: "Maximum images reached",
            description: `You can only upload up to ${MAX_IMAGES} images.`,
          });
        }
        return updatedImages;
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const dataTransfer = new DataTransfer();
    images.forEach(file => dataTransfer.items.add(file));
    const fileList = dataTransfer.files;

    handleSubmit(event, { experimental_attachments: fileList.length > 0 ? fileList : undefined });
    setImages([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const placeholder = `Message lord with ${getModelName(model)}`;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
      {messages.length === 0 && images.length === 0 && (
        <div className="flex w-full flex-col gap-4 px-4 items-center mx-auto">
          <Card />
        </div>
      )}


      <ScrollArea className="flex-1">
        {messages.length > 0 && (<ChatMessages messages={messages} />)}
        <div ref={scrollAreaRef} />
      </ScrollArea>


      <div className="sticky bottom-0 bg-background max-w-xl sm:max-w-2xl w-full">
        {images.length > 0 && (
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <h3 className="text-sm font-medium mb-2">Selected Images ({images.length}/{MAX_IMAGES})</h3>
            <div className="flex flex-wrap gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Selected ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-1.5 -right-1.5 rounded-full bg-white dark:bg-gray-800 p-0.5 shadow-md flex items-center justify-center"
                    aria-label="Remove image"
                  >
                    <X className="h-3 w-3 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <form
          ref={formRef}
          onSubmit={handleFormSubmit}
          className="mb-6 flex w-full flex-col gap-4 mx-auto"
          onDrag={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            handleFileChange({ target: { files: e.dataTransfer?.files } } as React.ChangeEvent<HTMLInputElement>);
          }}
        >
          <div className="group relative flex w-full items-center px-1">
            <input
              name="file"
              type="file"
              onChange={handleFileChange}
              multiple
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
            />
            <ExpandableTextarea
              className="rounded-[30px] px-6 py-4 pr-24 text-sm"
              value={input}
              placeholder={placeholder}
              autoComplete="off"
              autoCorrect="off"
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
            <div className="absolute right-0 mx-2.5 flex gap-2">
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full bg-muted-foreground px-2.5 opacity-50 transition duration-300 hover:opacity-100"
                disabled={images.length >= MAX_IMAGES}
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
              <Button
                type="submit"
                className={cn(
                  "rounded-full bg-muted-foreground px-2.5 opacity-50 transition duration-300 group-hover:opacity-100",
                  input && "bg-primary opacity-100",
                )}
              >
                <ArrowUp className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function getModelName(model: ModelName) {
  switch (model) {
    case "gpt-4o-mini":
      return "GPT 4o mini";
    case "gemini-1.5-flash":
      return "Gemini 1.5 Flash";
    case "claude-3-haiku":
      return "Claude 3 Haiku";
    default:
      return "GPT 4o mini";
  }
}