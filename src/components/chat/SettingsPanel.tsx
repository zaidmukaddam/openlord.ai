"use client";

import { Settings2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Tooltip } from "@/components/atoms/Tooltip";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { useAppStore } from "@/lib/useAppStore";

export function SettingsPanel() {
  const model = useAppStore((state) => state.model);
  const setModel = useAppStore((state) => state.setModel);
  const temperature = useAppStore((state) => state.temperature);
  const setTemperature = useAppStore((state) => state.setTemperature);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setTemperature(value);
    }
  };

  const handleTemperatureBlur = () => {
    setTemperature(Math.min(1, Math.max(0, parseFloat(temperature.toFixed(2)))));
  };

  const SettingsContent = () => (
    <>
      <div className="grid gap-8">
        <div className="grid gap-3">
          <Label htmlFor="model">Model</Label>
          <Select
            value={model}
            onValueChange={(model) => {
              if (
                model === "gpt-4o-mini" ||
                model === "gemini-1.5-flash" ||
                model === "claude-3-haiku"
              ) {
                setModel(model);
              }
            }}
          >
            <SelectTrigger
              id="model"
              className="items-start [&_[data-description]]:hidden"
            >
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4o-mini">
                <div className="flex items-start gap-1 text-muted-foreground">
                  GPT4o <span className="font-medium text-foreground">mini</span>
                </div>
              </SelectItem>
              <SelectItem value="gemini-1.5-flash">
                <div className="flex items-start gap-1 text-muted-foreground">
                  Gemini 1.5<span className="font-medium text-foreground">Flash</span>
                </div>
              </SelectItem>
              <SelectItem value="claude-3-haiku">
                <div className="flex items-start gap-1 text-muted-foreground">
                  Claude 3<span className="font-medium text-foreground">Haiku</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-3">
          <div className="group flex items-center justify-between">
            <Label htmlFor="temperature">Temperature</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              className="no-arrows h-9 w-12 border-transparent px-1 text-right hover:border-border"
              value={temperature}
              onChange={handleTemperatureChange}
              onBlur={handleTemperatureBlur}
            />
          </div>
          <Slider
            id="temperature"
            min={0}
            max={1}
            step={0.1}
            value={[temperature]}
            onValueChange={(value) => {
              if (value.length === 1) {
                setTemperature(value[0]);
              }
            }}
          />
        </div>
      </div>
    </>
  );

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <>
      <Tooltip content="Settings">
        <Button variant="ghost" size="icon" onClick={toggleOpen}>
          <Settings2 className="h-5 w-5" />
        </Button>
      </Tooltip>

      {isMobile ? (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerContent>
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle>Settings</DrawerTitle>
                <DrawerDescription>Configure Model settings</DrawerDescription>
              </DrawerHeader>
              <div className="p-4 pb-0">
                <SettingsContent />
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent className="data-[state=closed]:duration-200 data-[state=open]:duration-200">
            <SheetHeader className="text-left">
              <SheetTitle>Settings</SheetTitle>
              <SheetDescription>Configure Model settings</SheetDescription>
            </SheetHeader>
            <Separator className="my-6" />
            <SettingsContent />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}