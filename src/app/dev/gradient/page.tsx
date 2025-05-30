"use client";

import React, { useState, useRef, useCallback } from "react";
import { Slider } from "@/components/shadcn/slider";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcn/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadcn/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shadcn/popover";
import { Copy, Plus, Trash2, RotateCcw, Shuffle } from "lucide-react";
import { toast } from "sonner";

interface ColorStop {
  id: string;
  color: string;
  position: number;
}

interface GradientConfig {
  type: "linear" | "radial";
  direction: string;
  stops: ColorStop[];
}

const GradientGenerator = () => {
  const [config, setConfig] = useState<GradientConfig>({
    type: "linear",
    direction: "90deg",
    stops: [
      { id: "1", color: "#2A7B9B", position: 0 },
      { id: "2", color: "#57C785", position: 50 },
      { id: "3", color: "#EDDD53", position: 100 }
    ]
  });

  const [outputFormat, setOutputFormat] = useState<"css" | "tailwind">("css");
  const [tailwindVersion, setTailwindVersion] = useState<"v3" | "v4">("v4");
  const [dragging, setDragging] = useState<{ id: string; startX: number; startPosition: number } | null>(null);
  const [selectedStop, setSelectedStop] = useState<string | null>(null);
  const [isDragEnd, setIsDragEnd] = useState(false);
  const gradientBarRef = useRef<HTMLDivElement>(null);

  // Linear gradient direction options
  const linearDirections = [
    { value: "90deg", label: "To Right (90deg)" },
    { value: "0deg", label: "To Top (0deg)" },
    { value: "180deg", label: "To Bottom (180deg)" },
    { value: "270deg", label: "To Left (270deg)" },
    { value: "45deg", label: "To Top Right (45deg)" },
    { value: "135deg", label: "To Bottom Right (135deg)" },
    { value: "225deg", label: "To Bottom Left (225deg)" },
    { value: "315deg", label: "To Top Left (315deg)" }
  ];

  // Radial gradient shape options
  const radialShapes = [
    { value: "circle", label: "Circle" },
    { value: "ellipse", label: "Ellipse" },
    { value: "circle at center", label: "Circle at Center" },
    { value: "ellipse at center", label: "Ellipse at Center" },
    { value: "circle at top", label: "Circle at Top" },
    { value: "circle at bottom", label: "Circle at Bottom" }
  ];

  // Comprehensive Tailwind color mapping
  const tailwindColorMap: { [key: string]: string } = {
    // Reds
    "#fee2e2": "red-50", "#fecaca": "red-100", "#fca5a5": "red-200", "#f87171": "red-300",
    "#ef4444": "red-500", "#dc2626": "red-600", "#b91c1c": "red-700", "#991b1b": "red-800",
    // Blues  
    "#eff6ff": "blue-50", "#dbeafe": "blue-100", "#bfdbfe": "blue-200", "#93c5fd": "blue-300",
    "#60a5fa": "blue-400", "#3b82f6": "blue-500", "#2563eb": "blue-600", "#1d4ed8": "blue-700", "#1e40af": "blue-800",
    // Greens
    "#f0fdf4": "green-50", "#dcfce7": "green-100", "#bbf7d0": "green-200", "#86efac": "green-300",
    "#4ade80": "green-400", "#22c55e": "green-500", "#16a34a": "green-600", "#15803d": "green-700", "#166534": "green-800",
    // Purples & Violets
    "#faf5ff": "purple-50", "#f3e8ff": "purple-100", "#e9d5ff": "purple-200", "#c4b5fd": "purple-300",
    "#a78bfa": "purple-400", "#8b5cf6": "purple-500", "#7c3aed": "purple-600", "#6d28d9": "purple-700", "#5b21b6": "purple-800",
    "#5f27cd": "purple-600", // Custom mapping for your gradient color
    // Yellows & Ambers
    "#fefce8": "yellow-50", "#fef3c7": "yellow-100", "#fde68a": "yellow-200", "#fcd34d": "yellow-300",
    "#facc15": "yellow-400", "#eab308": "yellow-500", "#ca8a04": "yellow-600", "#a16207": "yellow-700", "#854d0e": "yellow-800",
    "#eddd53": "yellow-400", // Custom mapping for your gradient color
    // Teals & Cyans
    "#f0fdfa": "teal-50", "#ccfbf1": "teal-100", "#99f6e4": "teal-200", "#5eead4": "teal-300",
    "#2dd4bf": "teal-400", "#14b8a6": "teal-500", "#0d9488": "teal-600", "#0f766e": "teal-700",
    "#57c785": "emerald-400", // Custom mapping for your gradient color
    // Custom colors from your example
    "#2a7b9b": "sky-600", // Custom mapping for your gradient color
    // Grays
    "#f9fafb": "gray-50", "#f3f4f6": "gray-100", "#e5e7eb": "gray-200", "#d1d5db": "gray-300",
    "#9ca3af": "gray-400", "#6b7280": "gray-500", "#4b5563": "gray-600", "#374151": "gray-700",
    "#1f2937": "gray-800", "#111827": "gray-900",
    // Indigos
    "#eef2ff": "indigo-50", "#e0e7ff": "indigo-100", "#c7d2fe": "indigo-200", "#a5b4fc": "indigo-300",
    "#818cf8": "indigo-400", "#6366f1": "indigo-500", "#4f46e5": "indigo-600", "#4338ca": "indigo-700",
    // Sky colors
    "#f0f9ff": "sky-50", "#e0f2fe": "sky-100", "#bae6fd": "sky-200", "#7dd3fc": "sky-300",
    "#38bdf8": "sky-400", "#0ea5e9": "sky-500", "#0284c7": "sky-600", "#0369a1": "sky-700",
    // Others
    "#000000": "black", "#ffffff": "white"
  };

  // Generate CSS gradient string
  const generateCSS = () => {
    const sortedStops = [...config.stops].sort((a, b) => a.position - b.position);
    const stopsString = sortedStops
      .map(stop => `${stop.color} ${stop.position}%`)
      .join(", ");

    if (config.type === "linear") {
      return `linear-gradient(${config.direction}, ${stopsString})`;
    } else {
      return `radial-gradient(${config.direction}, ${stopsString})`;
    }
  };

  // Generate Tailwind CSS classes (supports both v3 and v4)
  const generateTailwind = () => {
    const sortedStops = [...config.stops].sort((a, b) => a.position - b.position);
    
    // Get direction string based on version
    const getDirection = () => {
      if (config.type === "linear") {
        const v4Directions: { [key: string]: string } = {
          "0deg": "bg-linear-to-t",
          "45deg": "bg-linear-to-tr", 
          "90deg": "bg-linear-to-r",
          "135deg": "bg-linear-to-br",
          "180deg": "bg-linear-to-b",
          "225deg": "bg-linear-to-bl",
          "270deg": "bg-linear-to-l",
          "315deg": "bg-linear-to-tl"
        };
        
        const v3Directions: { [key: string]: string } = {
          "0deg": "bg-gradient-to-t",
          "45deg": "bg-gradient-to-tr",
          "90deg": "bg-gradient-to-r", 
          "135deg": "bg-gradient-to-br",
          "180deg": "bg-gradient-to-b",
          "225deg": "bg-gradient-to-bl",
          "270deg": "bg-gradient-to-l",
          "315deg": "bg-gradient-to-tl"
        };
        
        const directions = tailwindVersion === "v4" ? v4Directions : v3Directions;
        return directions[config.direction] || (tailwindVersion === "v4" ? "bg-linear-to-r" : "bg-gradient-to-r");
      } else {
        return tailwindVersion === "v4" ? "bg-radial" : "bg-gradient-radial";
      }
    };

    // Try to generate Tailwind classes with position support
    const classes = [getDirection()];
    
    // Handle different numbers of stops
    if (sortedStops.length === 2) {
      const fromColor = hexToTailwindColor(sortedStops[0].color);
      const toColor = hexToTailwindColor(sortedStops[1].color);
      
      // Add from color and position
      classes.push(`from-${fromColor}`);
      if (sortedStops[0].position !== 0) {
        classes.push(`from-${sortedStops[0].position}%`);
      }
      
      // Add to color and position
      classes.push(`to-${toColor}`);
      if (sortedStops[1].position !== 100) {
        classes.push(`to-${sortedStops[1].position}%`);
      }
      
      // Only use standard classes if colors are in Tailwind palette
      if (!fromColor.includes('[') && !toColor.includes('[')) {
        return classes.join(' ');
      }
    } 
    else if (sortedStops.length === 3) {
      const fromColor = hexToTailwindColor(sortedStops[0].color);
      const viaColor = hexToTailwindColor(sortedStops[1].color);
      const toColor = hexToTailwindColor(sortedStops[2].color);
      
      // Add from color and position
      classes.push(`from-${fromColor}`);
      if (sortedStops[0].position !== 0) {
        classes.push(`from-${sortedStops[0].position}%`);
      }
      
      // Add via color and position
      classes.push(`via-${viaColor}`);
      if (sortedStops[1].position !== 50) {
        classes.push(`via-${sortedStops[1].position}%`);
      }
      
      // Add to color and position
      classes.push(`to-${toColor}`);
      if (sortedStops[2].position !== 100) {
        classes.push(`to-${sortedStops[2].position}%`);
      }
      
      // Only use standard classes if colors are in Tailwind palette
      if (!fromColor.includes('[') && !viaColor.includes('[') && !toColor.includes('[')) {
        return classes.join(' ');
      }
    }
    else if (sortedStops.length > 3) {
      // For more than 3 colors, we can still try to use Tailwind syntax with arbitrary values
      // Use first color as from, last as to, and try to fit middle colors as via
      const fromColor = hexToTailwindColor(sortedStops[0].color);
      const toColor = hexToTailwindColor(sortedStops[sortedStops.length - 1].color);
      
      classes.push(`from-${fromColor}`);
      if (sortedStops[0].position !== 0) {
        classes.push(`from-${sortedStops[0].position}%`);
      }
      
      // Add middle colors as via with arbitrary values if needed
      const middleStops = sortedStops.slice(1, -1);
      if (middleStops.length === 1) {
        const viaColor = hexToTailwindColor(middleStops[0].color);
        classes.push(`via-${viaColor}`);
        if (middleStops[0].position !== 50) {
          classes.push(`via-${middleStops[0].position}%`);
        }
      } else if (middleStops.length > 1) {
        // For multiple middle colors, use arbitrary value for via
        const viaColors = middleStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
        classes.push(`via-[${viaColors}]`);
      }
      
      classes.push(`to-${toColor}`);
      if (sortedStops[sortedStops.length - 1].position !== 100) {
        classes.push(`to-${sortedStops[sortedStops.length - 1].position}%`);
      }
      
      // Check if we can use standard classes
      if (!fromColor.includes('[') && !toColor.includes('[') && middleStops.length <= 1) {
        const viaColor = middleStops.length > 0 ? hexToTailwindColor(middleStops[0].color) : '';
        if (middleStops.length === 0 || !viaColor.includes('[')) {
          return classes.join(' ');
        }
      }
    }
    
    // Fallback to arbitrary value for complex gradients
    const fallbackCSS = generateCSS().replace(/\s+/g, '_');
    return `bg-[${fallbackCSS}]`;
  };

  // Convert hex to closest Tailwind color or return arbitrary value
  const hexToTailwindColor = (hex: string): string => {
    const normalizedHex = hex.toLowerCase();
    
    // Direct match
    if (tailwindColorMap[normalizedHex]) {
      return tailwindColorMap[normalizedHex];
    }
    
    // Find closest color by RGB distance (simplified)
    let closestColor = `[${hex}]`;
    let minDistance = Infinity;
    
    for (const [colorHex, tailwindClass] of Object.entries(tailwindColorMap)) {
      const distance = colorDistance(hex, colorHex);
      if (distance < minDistance && distance < 80) { // Increased threshold for better matching
        minDistance = distance;
        closestColor = tailwindClass;
      }
    }
    
    // If we found a reasonably close match, use it
    if (minDistance < 80) {
      return closestColor;
    }
    
    return `[${hex}]`;
  };

  // Calculate color distance (simplified RGB distance)
  const colorDistance = (hex1: string, hex2: string): number => {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
    if (!rgb1 || !rgb2) return Infinity;
    
    return Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    );
  };

  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Generate random color
  const generateRandomColor = (): string => {
    const colors = [
      "#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57",
      "#ff9ff3", "#54a0ff", "#5f27cd", "#00d2d3", "#ff9f43",
      "#10ac84", "#ee5253", "#0abde3", "#3867d6", "#8c7ae6"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Generate random gradient
  const generateRandomGradient = () => {
    const randomType = Math.random() > 0.5 ? "linear" : "radial";
    const randomDirection = randomType === "linear" 
      ? linearDirections[Math.floor(Math.random() * linearDirections.length)].value
      : radialShapes[Math.floor(Math.random() * radialShapes.length)].value;
    
    const stopCount = Math.floor(Math.random() * 3) + 2; // 2-4 stops
    const stops: ColorStop[] = [];
    
    for (let i = 0; i < stopCount; i++) {
      stops.push({
        id: (i + 1).toString(),
        color: generateRandomColor(),
        position: i === 0 ? 0 : i === stopCount - 1 ? 100 : Math.floor(Math.random() * 80) + 10
      });
    }
    
    // Sort stops by position
    stops.sort((a, b) => a.position - b.position);
    
    setConfig({
      type: randomType,
      direction: randomDirection,
      stops
    });
  };

  // Handle gradient bar click to add color stop
  const handleGradientBarClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!gradientBarRef.current || dragging || isDragEnd) return;
    
    // Check if click is on a color stop handle or popover content
    const target = event.target as HTMLElement;
    const isColorStop = target.closest('[data-color-stop]');
    const isPopoverContent = target.closest('[data-radix-popper-content-wrapper]') || target.closest('[role="dialog"]');
    if (isColorStop || isPopoverContent) return;
    
    const rect = gradientBarRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = Math.round((x / rect.width) * 100);
    
    // Ensure percentage is within bounds
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    
    // Generate a new color stop
    const newStop: ColorStop = {
      id: Date.now().toString(),
      color: generateRandomColor(),
      position: clampedPercentage
    };
    
    setConfig(prev => ({
      ...prev,
      stops: [...prev.stops, newStop]
    }));
    
    toast.success(`Added color stop at ${clampedPercentage}%`);
  };

  // Handle drag start
  const handleDragStart = useCallback((event: React.MouseEvent, stopId: string) => {
    event.preventDefault();
    event.stopPropagation();
    if (!gradientBarRef.current) return;
    
    const stop = config.stops.find(s => s.id === stopId);
    if (!stop) return;
    
    setIsDragEnd(false);
    setDragging({
      id: stopId,
      startX: event.clientX,
      startPosition: stop.position
    });
  }, [config.stops]);

  // Handle drag with throttling for better performance
  const handleDrag = useCallback((event: MouseEvent) => {
    if (!dragging || !gradientBarRef.current) return;
    
    const rect = gradientBarRef.current.getBoundingClientRect();
    const deltaX = event.clientX - dragging.startX;
    const deltaPercentage = (deltaX / rect.width) * 100;
    const newPosition = Math.max(0, Math.min(100, dragging.startPosition + deltaPercentage));
    
    setConfig(prev => ({
      ...prev,
      stops: prev.stops.map(stop => 
        stop.id === dragging.id ? { ...stop, position: Math.round(newPosition) } : stop
      )
    }));
  }, [dragging]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDragging(null);
    setIsDragEnd(true);
    
    // Reset the flag after a short delay to prevent accidental clicks
    setTimeout(() => {
      setIsDragEnd(false);
    }, 100);
  }, []);

  // Mouse event listeners with improved performance
  React.useEffect(() => {
    if (dragging) {
      const throttledHandleDrag = (event: MouseEvent) => {
        event.preventDefault();
        handleDrag(event);
      };

      document.addEventListener('mousemove', throttledHandleDrag, { passive: false });
      document.addEventListener('mouseup', handleDragEnd);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', throttledHandleDrag);
        document.removeEventListener('mouseup', handleDragEnd);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [dragging, handleDrag, handleDragEnd]);

  // Add new color stop
  const addColorStop = () => {
    const newStop: ColorStop = {
      id: Date.now().toString(),
      color: generateRandomColor(),
      position: 50
    };
    setConfig(prev => ({
      ...prev,
      stops: [...prev.stops, newStop]
    }));
  };

  // Remove color stop
  const removeColorStop = (id: string) => {
    if (config.stops.length > 2) {
      setConfig(prev => ({
        ...prev,
        stops: prev.stops.filter(stop => stop.id !== id)
      }));
    }
  };

  // Update color stop
  const updateColorStop = (id: string, updates: Partial<ColorStop>) => {
    setConfig(prev => ({
      ...prev,
      stops: prev.stops.map(stop => 
        stop.id === id ? { ...stop, ...updates } : stop
      )
    }));
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  // Reset to default
  const resetGradient = () => {
    setConfig({
      type: "linear",
      direction: "90deg",
      stops: [
        { id: "1", color: "#2A7B9B", position: 0 },
        { id: "2", color: "#57C785", position: 50 },
        { id: "3", color: "#EDDD53", position: 100 }
      ]
    });
  };

  // Simplify gradient to 3 colors for better Tailwind compatibility
  const simplifyGradient = () => {
    const sortedStops = [...config.stops].sort((a, b) => a.position - b.position);
    
    if (sortedStops.length <= 3) {
      // Already simple, just adjust positions
      const newStops = sortedStops.map((stop, index) => ({
        ...stop,
        position: index === 0 ? 0 : index === sortedStops.length - 1 ? 100 : 50
      }));
      setConfig(prev => ({ ...prev, stops: newStops }));
      toast.success("Gradient positions adjusted to 0%, 50%, 100%!");
    } else {
      // Reduce to 3 colors: first, middle, last
      const firstStop = sortedStops[0];
      const lastStop = sortedStops[sortedStops.length - 1];
      const middleIndex = Math.floor(sortedStops.length / 2);
      const middleStop = sortedStops[middleIndex];
      
      const newStops = [
        { ...firstStop, position: 0 },
        { ...middleStop, position: 50 },
        { ...lastStop, position: 100 }
      ];
      
      setConfig(prev => ({
        ...prev,
        stops: newStops
      }));
      
      // Show what colors were selected
      toast.success(`Simplified to 3 colors: ${firstStop.color}, ${middleStop.color}, ${lastStop.color}`);
    }
  };

  const cssGradient = generateCSS();
  const tailwindGradient = generateTailwind();

  return (
    <>
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        .animate-gradient-x {
          background-size: 400% 400%;
          animation: gradient-shift 4s ease infinite;
        }
        
        .gradient-title {
          font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
          font-weight: 900;
          font-size: 3.5rem;
          letter-spacing: -0.025em;
          background: linear-gradient(
            -45deg,
            #ee7752,
            #e73c7e,
            #23a6d5,
            #23d5ab,
            #7dd3fc,
            #c084fc,
            #fb7185
          );
          background-size: 400% 400%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradient-shift 3s ease infinite;
          text-shadow: 0 0 30px rgba(238, 119, 82, 0.3);
          filter: drop-shadow(0 0 10px rgba(199, 125, 255, 0.4));
        }
        
        @media (max-width: 768px) {
          .gradient-title {
            font-size: 2.5rem;
          }
        }
      `}</style>
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6 text-center">
          <h1 className="gradient-title mb-3">
            CSS Gradient Generator
          </h1>
          <p className="text-muted-foreground text-lg">
            Create beautiful gradients with live preview and copy-ready CSS or Tailwind code
          </p>
        </div>

        {/* Live Preview at top - Now rectangular */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Live Preview</CardTitle>
            <CardDescription>See your gradient in real-time</CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="w-full h-64 rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-sm mb-4"
              style={{ background: cssGradient }}
            />
            
            {/* Interactive Gradient Bar */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Interactive Color Bar - Click to add, drag to move</Label>
              <div 
                ref={gradientBarRef}
                onClick={handleGradientBarClick}
                className="relative w-full h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer transition-all duration-200 hover:border-primary hover:shadow-sm"
                style={{ background: cssGradient }}
              >
                {/* Color stop handles - Now vertical bars with rounded corners */}
                {config.stops.map((stop) => (
                  <Popover key={stop.id}>
                    <PopoverTrigger asChild>
                      <div
                        data-color-stop="true"
                        className="absolute top-0 h-full flex items-center justify-center group cursor-pointer"
                        style={{ left: `calc(${stop.position}% - 10px)`, width: '20px' }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleDragStart(e, stop.id);
                        }}
                      >
                        <div
                          className={`relative h-full w-4 border-2 border-white rounded-lg shadow-lg cursor-grab transform-gpu transition-all duration-200 hover:scale-110 hover:shadow-xl ${dragging?.id === stop.id ? 'scale-110 shadow-xl' : ''}`}
                          style={{ 
                            backgroundColor: stop.color,
                            cursor: dragging?.id === stop.id ? 'grabbing' : 'grab',
                            transformOrigin: 'center'
                          }}
                          title={`Click to edit • ${stop.color} at ${stop.position}%`}
                        />
                        {/* Hover X button for deletion */}
                        {config.stops.length > 2 && (
                          <div
                            className="absolute -top-3 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full text-white text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-lg border-2 border-white hover:scale-110 z-10"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              removeColorStop(stop.id);
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-4" side="left" align="center" sideOffset={8}>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">Edit Color Stop</h4>
                          <span className="text-xs text-muted-foreground">#{config.stops.findIndex(s => s.id === stop.id) + 1}</span>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Color</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={stop.color.slice(0, 7)}
                                onChange={(e) => {
                                  const alpha = stop.color.length > 7 ? stop.color.slice(7) : '';
                                  updateColorStop(stop.id, { color: e.target.value + alpha });
                                }}
                                className="w-12 h-9 p-1 rounded border cursor-pointer"
                              />
                              <Input
                                type="text"
                                value={stop.color}
                                onChange={(e) => updateColorStop(stop.id, { color: e.target.value })}
                                className="flex-1"
                                placeholder="#000000"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Position (%)</Label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={stop.position}
                                onChange={(e) => updateColorStop(stop.id, { position: parseInt(e.target.value) || 0 })}
                                className="w-full"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Opacity (%)</Label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={Math.round((parseInt(stop.color.slice(7, 9) || 'ff', 16) / 255) * 100)}
                                onChange={(e) => {
                                  const opacity = Math.max(0, Math.min(100, parseInt(e.target.value) || 100));
                                  const alpha = Math.round((opacity / 100) * 255).toString(16).padStart(2, '0');
                                  const baseColor = stop.color.slice(0, 7);
                                  updateColorStop(stop.id, { color: baseColor + alpha });
                                }}
                                className="w-full"
                                placeholder="100"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                💡 Click anywhere to add a color stop, drag existing stops to reposition them, click a stop to edit it
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Controls - Left Column */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Gradient Type */}
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Tabs value={config.type} onValueChange={(value: string) => setConfig(prev => ({ ...prev, type: value as "linear" | "radial" }))}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="linear">Linear</TabsTrigger>
                      <TabsTrigger value="radial">Radial</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Direction/Shape */}
                <div className="space-y-2">
                  <Label>{config.type === "linear" ? "Direction" : "Shape"}</Label>
                  <Select 
                    value={config.direction} 
                    onValueChange={(value) => setConfig(prev => ({ ...prev, direction: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(config.type === "linear" ? linearDirections : radialShapes).map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button onClick={generateRandomGradient} variant="outline" className="flex-1">
                      <Shuffle className="w-4 h-4 mr-2" />
                      Random
                    </Button>
                    <Button onClick={resetGradient} variant="outline" className="flex-1">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                  {config.stops.length > 3 && (
                    <Button onClick={simplifyGradient} variant="outline" className="w-full">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Simplify for Tailwind
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Output Code - Right Columns */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Generated Code</CardTitle>
                <CardDescription>Copy the code to use in your project</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={outputFormat} onValueChange={(value: string) => setOutputFormat(value as "css" | "tailwind")}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="css">CSS</TabsTrigger>
                    <TabsTrigger value="tailwind">Tailwind</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="css" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Background Property</Label>
                      <div className="relative">
                        <pre className="p-3 bg-muted rounded text-sm overflow-x-auto border">
                          <code>{`background: ${cssGradient};`}</code>
                        </pre>
                        <Button
                          onClick={() => copyToClipboard(`background: ${cssGradient};`)}
                          size="sm"
                          className="absolute top-2 right-2"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>CSS Class</Label>
                      <div className="relative">
                        <pre className="p-3 bg-muted rounded text-sm overflow-x-auto border">
                          <code>{`.gradient {\n  background: ${cssGradient};\n}`}</code>
                        </pre>
                        <Button
                          onClick={() => copyToClipboard(`.gradient {\n  background: ${cssGradient};\n}`)}
                          size="sm"
                          className="absolute top-2 right-2"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="tailwind" className="space-y-4">
                    {/* Version Selector */}
                    <div className="space-y-2">
                      <Label>Tailwind CSS Version</Label>
                      <Tabs value={tailwindVersion} onValueChange={(value: string) => setTailwindVersion(value as "v3" | "v4")}>
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="v3">v3 (Current)</TabsTrigger>
                          <TabsTrigger value="v4">v4 (Latest)</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    <div className="space-y-2">
                      <Label>Tailwind CSS {tailwindVersion.toUpperCase()} Classes</Label>
                      <div className="relative">
                        <pre className="p-3 bg-muted rounded text-sm overflow-x-auto border">
                          <code>{tailwindGradient}</code>
                        </pre>
                        <Button
                          onClick={() => copyToClipboard(tailwindGradient)}
                          size="sm"
                          className="absolute top-2 right-2"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Usage Example</Label>
                      <div className="relative">
                        <pre className="p-3 bg-muted rounded text-sm overflow-x-auto border">
                          <code>{`<div class="${tailwindGradient}">\n  <!-- Content -->\n</div>`}</code>
                        </pre>
                        <Button
                          onClick={() => copyToClipboard(`<div class="${tailwindGradient}">\n  <!-- Content -->\n</div>`)}
                          size="sm"
                          className="absolute top-2 right-2"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {tailwindVersion === "v4" ? (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>Tailwind CSS v4:</strong> Uses new gradient syntax (bg-linear-*, bg-radial-*). 
                          This is the latest version with improved gradient utilities.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded">
                        <p className="text-sm text-green-800 dark:text-green-200">
                          <strong>Tailwind CSS v3:</strong> Uses traditional gradient syntax (bg-gradient-*). 
                          This is the stable version currently in wide use.
                        </p>
                      </div>
                    )}
                    
                    {tailwindGradient.includes("bg-[") && (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          <strong>Complex Gradient:</strong> Using arbitrary value because:
                          <br />• Colors not in Tailwind's standard palette, or
                          <br />• More than 3 color stops (Tailwind supports max 3: from/via/to)
                          <br /><br />
                          <strong>Note:</strong> Tailwind CSS supports position syntax like:
                          <br />• <code>from-blue-500 from-10%</code>
                          <br />• <code>via-red-500 via-30%</code> 
                          <br />• <code>to-green-500 to-90%</code>
                          <br /><br />
                          <strong>Arbitrary Value Format:</strong> <code>bg-[linear-gradient(...)]</code>
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default GradientGenerator; 