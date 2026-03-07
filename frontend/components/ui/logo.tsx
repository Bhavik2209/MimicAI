export function Logo({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return (
        <svg
            viewBox="0 0 280 200"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="currentColor"
            strokeWidth="40"
            strokeLinecap="butt"
            strokeLinejoin="round"
            className={className}
            style={style}
            aria-label="Mimic AI Logo"
        >
            <path d="M 20 180 L 20 60 A 40 40 0 0 1 100 60 L 100 120 A 40 40 0 0 0 180 120 L 180 60 A 40 40 0 0 1 260 60 L 260 180" />
        </svg>
    );
}
