import React from 'react';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  isRetrying = false,
}) => {
  return (
    <div
      role="alert"
      className="border-2 border-[var(--border-color)] bg-[var(--card-bg)] p-8 sm:p-14 my-6 space-y-6 shadow-[var(--card-shadow)]"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 text-xs font-mono-tabular">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-amber-500 inline-block" />
          <span className="font-bold uppercase tracking-wider">
            Archive Registry // Connection Notice
          </span>
        </div>
        <span className="opacity-60 hidden sm:inline">Data Integrity Preserved</span>
      </div>

      <div className="max-w-2xl space-y-4">
        <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
          We couldn&rsquo;t load the snack archive right now.
        </h3>

        <p className="text-base sm:text-lg opacity-85 leading-relaxed">
          {message ||
            'We were unable to establish a live connection with the cloud repository. This is usually caused by a momentary network interruption or offline browser state. All existing records and ratings remain securely preserved.'}
        </p>

        <p className="text-xs sm:text-sm font-mono-tabular opacity-70">
          Please check your network connection and retry synchronizing with the registry.
        </p>

        {/* Retry & Assistance Actions */}
        <div className="pt-4 flex flex-wrap items-center gap-4">
          <button
            onClick={onRetry}
            disabled={isRetrying}
            type="button"
            className="brutalist-btn text-xs sm:text-sm font-mono-tabular flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isRetrying ? (
              <>
                <span className="inline-block w-2.5 h-2.5 border-2 border-current border-t-transparent animate-spin" />
                <span>Reconnecting...</span>
              </>
            ) : (
              <>
                <span>[ ↻ Retry Connection ]</span>
              </>
            )}
          </button>

          <span className="text-xs font-mono-tabular opacity-60">
            Takes a second to re-establish real-time sync
          </span>
        </div>
      </div>

      {/* Helpful diagnosis points */}
      <div className="border-t border-[var(--border-subtle)] pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono-tabular opacity-75">
        <div>
          <span className="font-bold block uppercase opacity-80 mb-1">Are you offline?</span>
          <span>If your device lost internet connection, reconnecting Wi-Fi or mobile data will restore the archive.</span>
        </div>
        <div>
          <span className="font-bold block uppercase opacity-80 mb-1">Your data is safe</span>
          <span>Snacks stored in Firestore are immutable and will appear as soon as the connection reopens.</span>
        </div>
      </div>
    </div>
  );
};
