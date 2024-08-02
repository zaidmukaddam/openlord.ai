/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { ToolInvocation } from 'ai';
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { CloudRain, Loader2, Search, Thermometer } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const DRAG_BUFFER = 50;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;

const SPRING_OPTIONS = {
    type: "spring",
    stiffness: 300,
    damping: 30,
};

const WebSearchCarousel: React.FC<{ results: any[] }> = ({ results }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [itemWidth, setItemWidth] = useState(300);
    const x = useMotionValue(0);
    const [currentIndex, setCurrentIndex] = React.useState(0);

    useEffect(() => {
        const updateItemWidth = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                setItemWidth(Math.min(containerWidth - 32, 600)); // 32px for padding
            }
        };

        updateItemWidth();
        window.addEventListener('resize', updateItemWidth);
        return () => window.removeEventListener('resize', updateItemWidth);
    }, []);

    const handleDragEnd = (_: any, info: PanInfo) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;

        if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
            setCurrentIndex((prev) => Math.min(prev + 1, results.length - 1));
        } else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
            setCurrentIndex((prev) => Math.max(prev - 1, 0));
        }
    };

    const leftConstraint = -((itemWidth + GAP) * (results.length - 1));

    return (
        <div ref={containerRef} className="relative overflow-hidden rounded-[24px] border border-muted p-2 sm:p-4 mt-3 bg-neutral-100 dark:bg-neutral-800">
            <motion.div
                className="flex"
                drag="x"
                dragConstraints={{
                    left: leftConstraint,
                    right: 0,
                }}
                style={{
                    width: itemWidth,
                    gap: `${GAP}px`,
                    perspective: 1000,
                    perspectiveOrigin: currentIndex * itemWidth + itemWidth / 2,
                    x,
                }}
                onDragEnd={handleDragEnd}
                animate={{ x: -(currentIndex * (itemWidth + GAP)) }}
                transition={SPRING_OPTIONS}
            >
                {results.map((result, index) => {
                    const range = [
                        (-100 * (index + 1) * (itemWidth + GAP)) / 100,
                        (-100 * index * (itemWidth + GAP)) / 100,
                        (-100 * (index - 1) * (itemWidth + GAP)) / 100,
                    ];
                    const outputRange = [90, 0, -90];
                    const rotateY = useTransform(x, range, outputRange, {
                        clamp: false,
                    });

                    return (
                        <motion.div
                            key={index}
                            className="relative flex shrink-0 flex-col items-start justify-between rounded-[20px] border border-muted bg-card p-3 sm:p-5"
                            style={{
                                width: itemWidth,
                                height: "100%",
                                rotateY: rotateY,
                            }}
                            transition={SPRING_OPTIONS}
                        >
                            <div className="mb-2 sm:mb-4 flex items-center">
                                <img
                                    src={`https://www.google.com/s2/favicons?domain=${new URL(result.url).hostname}&sz=32`}
                                    alt="Favicon"
                                    className="mr-2 h-4 w-4 sm:h-6 sm:w-6"
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z'/%3E%3C/svg%3E";
                                    }}
                                />
                                <a href={result.url} className="text-xs sm:text-sm font-medium text-foreground">
                                    {new URL(result.url).hostname}
                                </a>
                            </div>
                            <div>
                                <div className="mb-1 sm:mb-2 text-sm sm:text-base font-medium text-foreground">
                                    {result.title}
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    {result.content.length > 100
                                        ? result.content.substring(0, 100) + "..."
                                        : result.content}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
            <div className="flex w-full justify-center">
                <div className="mt-2 sm:mt-4 flex justify-between gap-2">
                    {results.map((_, index) => (
                        <motion.div
                            key={index}
                            className={`h-1.5 sm:h-2 w-1.5 sm:w-2 cursor-pointer rounded-full transition-colors duration-150 ${currentIndex === index
                                ? "bg-foreground"
                                : "bg-muted-foreground/40"
                                }`}
                            animate={{ scale: currentIndex === index ? 1.2 : 1 }}
                            onClick={() => setCurrentIndex(index)}
                            transition={{
                                duration: 0.15,
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

const WeatherResult: React.FC<{ result: any }> = ({ result }) => {
    return (
        <div className="grid grid-cols-2 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Temperature</CardTitle>
                    <Thermometer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{result.temperature}{result.unit}</div>
                    <p className="text-xs text-muted-foreground">Feels like {result.apparentTemperature}{result.unit}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Rain</CardTitle>
                    <CloudRain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{result.rain} mm</div>
                    <p className="text-xs text-muted-foreground">Precipitation</p>
                </CardContent>
            </Card>
        </div>
    );
};

const ArgumentDisplay: React.FC<{ toolName: string; args: any }> = ({ toolName, args }) => {
    if (toolName === 'web_search') {
        return (
            <div className="flex items-center space-x-2 bg-muted rounded-full px-3 py-1 text-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <span className="truncate max-w-[200px]">{args?.query && args.query}</span>
            </div>
        );
    }

    if (toolName === 'weatherTool') {
        return (
            <div className="flex items-center space-x-2 bg-muted rounded-full px-3 py-1 text-sm">
                <CloudRain className="h-4 w-4 text-muted-foreground" />
                <span>{args?.city && args.city}</span>
            </div>
        );
    }

    return null;
};

const LoadingAlertWithSeparator: React.FC = () => {
    return (
        <Alert className="p-0 overflow-hidden">
            <div className="flex items-stretch">
                <div className="flex-shrink-0 p-4 flex items-center justify-center sm:mr-2">
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                </div>
                <Separator orientation="vertical" className="h-auto" />
                <div className="flex-grow p-4">
                    <AlertTitle className="text-sm sm:text-base">Fetching results</AlertTitle>
                    <AlertDescription className="text-xs sm:text-sm mt-1">
                        Please wait while we process your request...
                    </AlertDescription>
                </div>
            </div>
        </Alert>
    );
};

const ToolInvocationComp: React.FC<{ toolInvocation: ToolInvocation }> = ({ toolInvocation }) => {
    const { toolName, args } = toolInvocation;

    const isLoading = !('result' in toolInvocation);

    const renderResult = () => {
        if (isLoading) {
            return (
                <LoadingAlertWithSeparator />
            );
        }

        if (toolName === 'web_search' && toolInvocation.result && toolInvocation.result.results) {
            return <WebSearchCarousel results={toolInvocation.result.results} />;
        }

        if (toolName === 'weatherTool' && toolInvocation.result) {
            return <WeatherResult result={toolInvocation.result} />;
        }

        return (
            <pre className="text-sm bg-muted p-3 rounded-md overflow-x-auto max-h-60 mt-2">
                {JSON.stringify(toolInvocation.result, null, 2)}
            </pre>
        );
    };

    return (
        <div className="w-full space-y-2 py-2">
            <div className="flex items-center justify-between">
                <ArgumentDisplay toolName={toolName} args={args} />
            </div>
            {renderResult()}
        </div>
    );
};

export default ToolInvocationComp;