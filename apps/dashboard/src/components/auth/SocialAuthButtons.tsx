"use client";

export function SocialAuthButtons() {
  const handleGoogle = () => {
    alert("Google authentication is mocked. Please use the email form.");
  };

  const handleApple = () => {
    alert("Apple authentication is mocked. Please use the email form.");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleGoogle}
          className="flex items-center justify-center gap-2.5 rounded-xl border border-hairline bg-surface py-2.5 text-xs font-semibold text-foreground hover:bg-clay/50 transition-colors duration-150 focus:outline-none"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 14.99 1 12 1 7.35 1 3.37 3.65 1.39 7.56l3.85 2.99c.92-2.76 3.49-4.51 6.76-4.51z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.57l3.77 2.92c2.2-2.03 3.48-5.02 3.48-8.64z"
            />
            <path
              fill="#FBBC05"
              d="M5.24 14.56c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31L1.39 7.56C.5 9.36 0 11.57 0 13.75s.5 4.39 1.39 6.19l3.85-2.99z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.77-2.92c-1.12.75-2.53 1.21-4.19 1.21-3.27 0-5.84-1.75-6.76-4.51L1.39 16.8c1.98 3.91 5.96 6.56 10.61 6.56z"
            />
          </svg>
          Google
        </button>

        <button
          type="button"
          onClick={handleApple}
          className="flex items-center justify-center gap-2.5 rounded-xl border border-hairline bg-surface py-2.5 text-xs font-semibold text-foreground hover:bg-clay/50 transition-colors duration-150 focus:outline-none"
        >
          <svg className="h-4 w-4 fill-current text-foreground" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.12.09 2.28-.58 2.94-1.39z" />
          </svg>
          Apple
        </button>
      </div>

      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-hairline"></div>
        <span className="flex-shrink mx-4 text-[10px] font-bold uppercase tracking-widest text-ink-muted/80">
          or continue with email
        </span>
        <div className="flex-grow border-t border-hairline"></div>
      </div>
    </div>
  );
}
