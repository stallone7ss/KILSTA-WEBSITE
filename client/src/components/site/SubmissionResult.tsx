import { CheckCircle2, Copy, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { notificationNote } from '../../services/submissions';
import type { SubmissionReceipt } from '../../types';
import { Alert } from '../ui/Feedback';

export function SubmissionResult({
  receipt,
  onReset,
  resetLabel = 'Submit another request'
}: {
  receipt: SubmissionReceipt;
  onReset: () => void;
  resetLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyReference = async () => {
    if (!receipt.reference) return;
    try {
      await navigator.clipboard.writeText(receipt.reference);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="card-surface overflow-hidden">
      <div className="border-b border-teal-100 bg-teal-50/70 px-6 py-7">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-500 text-white">
          <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-xl font-semibold text-navy-900">Submission received</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{receipt.message}</p>
      </div>
      <div className="space-y-5 px-6 py-6">
        {receipt.reference ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Your reference
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-3">
              <p className="font-mono text-lg font-bold tracking-wide text-navy-900">
                {receipt.reference}
              </p>
              <button
                type="button"
                onClick={copyReference}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Keep this reference for any follow-up about your submission.
            </p>
          </div>
        ) : null}

        <Alert tone="info" title="What happens next">
          <p>
            Our team will review your submission and respond using the contact method you chose.
            This acknowledgement does not confirm a booking, price or delivery date.
          </p>
        </Alert>

        <p className="text-xs leading-5 text-slate-500">
          {notificationNote(receipt.notifications.customer)}
        </p>

        <button type="button" onClick={onReset} className="btn-outline">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          {resetLabel}
        </button>
      </div>
    </div>
  );
}
