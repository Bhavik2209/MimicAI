"use client"

import { Clock, Zap, Lightbulb, TrendingUp, Award, Book } from "lucide-react"

interface TimelineEvent {
    year: string
    title: string
    description: string
    category: "invention" | "career" | "award" | "publication" | "event"
}

// Sample data for Nikola Tesla
const timelineEvents: TimelineEvent[] = [
    {
        year: "1856",
        title: "Birth in Smiljan",
        description: "Born on July 10 during a lightning storm in Smiljan, Austrian Empire (modern-day Croatia).",
        category: "event",
    },
    {
        year: "1882",
        title: "Conception of AC Motor",
        description: "Conceives the idea for the brushless alternating current (AC) motor while walking in a park in Budapest.",
        category: "invention",
    },
    {
        year: "1884",
        title: "Arrival in America",
        description: "Arrives in New York City with four cents in his pocket. Begins working for Thomas Edison.",
        category: "career",
    },
    {
        year: "1887",
        title: "Tesla Electric Company",
        description: "Founders back Tesla to set up his own laboratory. He develops his AC induction motor and patents the polyphase system.",
        category: "career",
    },
    {
        year: "1891",
        title: "The Tesla Coil",
        description: "Invents the Tesla coil, a resonant transformer circuit used to produce high-voltage, low-current, high-frequency alternating-current electricity.",
        category: "invention",
    },
    {
        year: "1893",
        title: "Chicago World's Fair",
        description: "Demonstrates AC power illuminating the World's Columbian Exposition in Chicago, proving its safety and efficiency over DC power.",
        category: "event",
    },
    {
        year: "1895",
        title: "Niagara Falls Power Project",
        description: "Designs the first commercial AC hydroelectric power plant at Niagara Falls in partnership with George Westinghouse.",
        category: "career",
    },
    {
        year: "1898",
        title: "Radio-Controlled Boat",
        description: "Demonstrates the first radio-controlled vessel (a small boat) at Madison Square Garden, pioneering remote control technology.",
        category: "invention",
    },
    {
        year: "1899",
        title: "Colorado Springs Lab",
        description: "Moves to Colorado Springs to conduct high-voltage, high-frequency experiments and observe global electromagnetic resonance.",
        category: "event",
    },
    {
        year: "1901",
        title: "Wardenclyffe Tower",
        description: "Begins construction of the Wardenclyffe Tower facility intended for wireless transmission of messages and power.",
        category: "career",
    },
    {
        year: "1915",
        title: "Nobel Prize Rumor",
        description: "The New York Times prematurely reports that Tesla and Edison were to share the Nobel Prize in Physics.",
        category: "event",
    },
    {
        year: "1943",
        title: "Death in New York",
        description: "Dies at age 86 in the New Yorker Hotel. The US Supreme Court posthumously restores his patent priority for radio over Marconi.",
        category: "event",
    },
]

const categoryIcons = {
    invention: <Lightbulb size={18} />,
    career: <TrendingUp size={18} />,
    award: <Award size={18} />,
    publication: <Book size={18} />,
    event: <Zap size={18} />,
}

const categoryColors = {
    invention: "var(--teal)",
    career: "var(--gold)",
    award: "var(--red)",
    publication: "var(--text-2)",
    event: "var(--ivory)",
}

export function TimelineTab() {
    return (
        <div className="max-w-4xl mx-auto px-8 py-12">
            <div className="mb-12">
                <h2
                    className="mb-4"
                    style={{
                        fontSize: 32,
                        color: "var(--ivory)",
                        fontWeight: 500,
                        fontStyle: "italic",
                        fontFamily: "var(--font-reading), serif",
                        lineHeight: 1.2,
                    }}
                >
                    Chronology & Milestones
                </h2>
                <p className="text-lg" style={{ color: "var(--text-2)", fontFamily: "var(--font-ui), sans-serif", letterSpacing: "0.02em" }}>
                    The defining moments and breakthrough discoveries spanning the lifetime of the entity.
                </p>
            </div>

            <div className="relative">
                {/* Main Vertical Line */}
                <div
                    className="absolute left-[19px] top-4 bottom-0 w-px"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                />

                <div className="flex flex-col gap-10 relative z-10">
                    {timelineEvents.map((item, index) => {
                        const Icon = categoryIcons[item.category]
                        const color = categoryColors[item.category]

                        return (
                            <div key={index} className="flex gap-6 group">
                                {/* Connector & Icon */}
                                <div className="flex flex-col items-center mt-1">
                                    <div
                                        className="flex items-center justify-center rounded-full relative"
                                        style={{
                                            width: 40,
                                            height: 40,
                                            background: "transparent",
                                            color: color,
                                        }}
                                    >
                                        {Icon}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 pb-2">
                                    <div className="flex items-baseline gap-4 mb-3">
                                        <span
                                            className="text-2xl font-medium tracking-tight"
                                            style={{ color: "var(--gold)", fontFamily: "var(--font-data), monospace" }}
                                        >
                                            {item.year}
                                        </span>
                                        <span
                                            className="text-xs uppercase"
                                            style={{ color: color, fontFamily: "var(--font-primary), monospace", letterSpacing: "0.15em" }}
                                        >
                                            {item.category}
                                        </span>
                                    </div>

                                    <h3
                                        className="text-2xl mb-2"
                                        style={{ color: "var(--ivory)", fontWeight: 500, fontFamily: "var(--font-primary), monospace", letterSpacing: "0.02em" }}
                                    >
                                        {item.title}
                                    </h3>

                                    <p
                                        className="text-base"
                                        style={{ color: "var(--text-2)", fontFamily: "var(--font-reading), serif", lineHeight: 1.8 }}
                                    >
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
